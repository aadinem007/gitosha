import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { clientIp, rateLimit } from "@/lib/rate-limit";
import { assertSameOrigin, readJsonLimited, requireJsonContentType, safeEqualDigest, securityLog } from "@/lib/secure";

const bodySchema = z.object({
  email: z.string().email().max(254),
  key: z.string().min(10).max(64),
});

export async function POST(req: NextRequest) {
  if (!assertSameOrigin(req)) {
    securityLog("license_lookup_origin_blocked", { ip: clientIp(req) });
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  if (!requireJsonContentType(req)) {
    return NextResponse.json({ error: "Unsupported media type" }, { status: 415 });
  }

  const limited = rateLimit({
    key: `license-lookup:${clientIp(req)}`,
    limit: 8,
    windowMs: 60_000,
  });
  if (!limited.ok) {
    return NextResponse.json({ error: "Too many attempts" }, { status: 429 });
  }

  const body = await readJsonLimited(req);
  if (!body.ok) {
    return NextResponse.json({ error: body.error }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(body.data);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid email or key" }, { status: 400 });
  }

  const email = parsed.data.email.toLowerCase();
  const key = parsed.data.key.toUpperCase().trim();

  const license = await prisma.licenseKey.findUnique({ where: { key } });
  if (!license || !safeEqualDigest(license.email.toLowerCase(), email)) {
    return NextResponse.json({ error: "No matching license" }, { status: 404 });
  }

  const subscriber = await prisma.subscriber.findUnique({ where: { email } });

  return NextResponse.json({
    ok: true,
    tier: license.tier,
    downloadCount: license.downloadCount,
    vaultAccess: subscriber?.tier === "PRO" || subscriber?.tier === "TEAM",
    vaultTier: subscriber?.tier ?? null,
  });
}
