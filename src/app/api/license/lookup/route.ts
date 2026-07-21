import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { clientIp, rateLimit } from "@/lib/rate-limit";

const bodySchema = z.object({
  email: z.string().email().max(254),
  key: z.string().min(10).max(64),
});

export async function POST(req: NextRequest) {
  const limited = rateLimit({
    key: `license-lookup:${clientIp(req)}`,
    limit: 15,
    windowMs: 60_000,
  });
  if (!limited.ok) {
    return NextResponse.json({ error: "Too many attempts" }, { status: 429 });
  }

  const parsed = bodySchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid email or key" }, { status: 400 });
  }

  const email = parsed.data.email.toLowerCase();
  const key = parsed.data.key.toUpperCase().trim();

  const license = await prisma.licenseKey.findUnique({ where: { key } });
  if (!license || license.email.toLowerCase() !== email) {
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
