import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { clientIp, rateLimit } from "@/lib/rate-limit";
import { createFoundryZipStream, foundryKitExists } from "@/lib/foundry-pack";
import { readJsonLimited, assertSameOrigin, safeEqualDigest } from "@/lib/secure";
import { Readable } from "stream";

const bodySchema = z.object({
  email: z.string().email().max(254),
  key: z
    .string()
    .min(10)
    .max(64)
    .regex(/^SHIP-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}$/i),
});

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  if (!assertSameOrigin(req)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const limited = rateLimit({
    key: `license-dl:${clientIp(req)}`,
    limit: 6,
    windowMs: 60_000,
  });
  if (!limited.ok) {
    return NextResponse.json({ error: "Too many download attempts. Wait a minute." }, { status: 429 });
  }

  if (!foundryKitExists()) {
    return NextResponse.json({ error: "Kit temporarily unavailable. Email support." }, { status: 503 });
  }

  const body = await readJsonLimited(req);
  if (!body.ok) {
    return NextResponse.json({ error: body.error }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(body.data);
  if (!parsed.success) {
    return NextResponse.json({ error: "Enter the email and license key from your receipt." }, { status: 400 });
  }

  const email = parsed.data.email.toLowerCase();
  const key = parsed.data.key.toUpperCase();

  const license = await prisma.licenseKey.findUnique({ where: { key } });
  if (!license || !safeEqualDigest(license.email.toLowerCase(), email)) {
    return NextResponse.json({ error: "License not found for that email + key." }, { status: 404 });
  }

  if (license.downloadCount >= 50) {
    return NextResponse.json(
      { error: "Download limit reached. Contact support with your license key." },
      { status: 429 }
    );
  }

  await prisma.licenseKey.update({
    where: { id: license.id },
    data: {
      downloadCount: { increment: 1 },
      lastDownloadedAt: new Date(),
      activatedAt: license.activatedAt ?? new Date(),
    },
  });

  const { stream, filename } = createFoundryZipStream({
    tier: license.tier,
    email: license.email,
    key: license.key,
  });

  const webStream = Readable.toWeb(stream) as ReadableStream;

  return new NextResponse(webStream, {
    status: 200,
    headers: {
      "Content-Type": "application/zip",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "no-store",
      "X-License-Tier": license.tier,
    },
  });
}
