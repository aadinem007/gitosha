import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { clientIp, rateLimit } from "@/lib/rate-limit";
import { assertSameOrigin, readJsonLimited, requireJsonContentType, securityLog } from "@/lib/secure";

const bodySchema = z.object({
  email: z.string().email().max(254),
  company: z.string().max(120).optional(),
});

export async function POST(req: NextRequest) {
  if (!assertSameOrigin(req)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  if (!requireJsonContentType(req)) {
    return NextResponse.json({ error: "Unsupported media type" }, { status: 415 });
  }

  const limited = rateLimit({
    key: `waitlist:${clientIp(req)}`,
    limit: 4,
    windowMs: 60_000,
  });
  if (!limited.ok) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const body = await readJsonLimited(req, 8_192);
  if (!body.ok) {
    return NextResponse.json({ error: body.error }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(body.data);
  if (!parsed.success) {
    return NextResponse.json({ error: "Enter a valid email" }, { status: 400 });
  }

  // Honeypot: bots fill hidden "company" — pretend success, write nothing
  if (parsed.data.company && parsed.data.company.trim().length > 0) {
    securityLog("waitlist_honeypot", { ip: clientIp(req) });
    return NextResponse.json({ ok: true });
  }

  await prisma.subscriber.upsert({
    where: { email: parsed.data.email.toLowerCase() },
    create: { email: parsed.data.email.toLowerCase(), tier: "FREE" },
    update: {},
  });

  return NextResponse.json({ ok: true });
}
