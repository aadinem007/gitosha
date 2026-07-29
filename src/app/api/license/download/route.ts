import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { clientIp, rateLimit } from "@/lib/rate-limit";
import { createFoundryZipStream, foundryKitExists } from "@/lib/foundry-pack";
import { readJsonLimited, assertSameOrigin, requireJsonContentType, safeEqualDigest, securityLog } from "@/lib/secure";
import { Readable } from "stream";
import { LICENSE_KEY_PATTERN } from "@/lib/license";

const bodySchema = z.object({
  email: z.string().email().max(254),
  key: z.string().min(10).max(64).regex(LICENSE_KEY_PATTERN),
});

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  if (!assertSameOrigin(req)) {
    securityLog("license_dl_origin_blocked", { ip: clientIp(req) });
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  if (!requireJsonContentType(req)) {
    return NextResponse.json({ error: "Unsupported media type" }, { status: 415 });
  }

  const limited = rateLimit({
    key: `license-dl:${clientIp(req)}`,
    limit: 5,
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

  // Atomic cap — closes TOCTOU race where parallel requests both pass a pre-check
  const bumped = await prisma.licenseKey.updateMany({
    where: { id: license.id, downloadCount: { lt: 50 } },
    data: {
      downloadCount: { increment: 1 },
      lastDownloadedAt: new Date(),
      activatedAt: license.activatedAt ?? new Date(),
    },
  });
  if (bumped.count === 0) {
    securityLog("license_dl_cap_hit", { tier: license.tier });
    return NextResponse.json(
      { error: "Download limit reached. Contact support with your license key." },
      { status: 429 }
    );
  }

  const { stream, filename } = createFoundryZipStream({
    tier: license.tier,
    email: license.email,
    key: license.key,
  });

  const webStream = Readable.toWeb(stream) as ReadableStream;
  const safeName = filename === "foundry-agency.zip" ? "foundry-agency.zip" : "foundry-solo.zip";

  return new NextResponse(webStream, {
    status: 200,
    headers: {
      "Content-Type": "application/zip",
      "Content-Disposition": `attachment; filename="${safeName}"`,
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff",
      "X-License-Tier": license.tier,
    },
  });
}
