import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { clientIp, rateLimit } from "@/lib/rate-limit";

const bodySchema = z.object({
  email: z.string().email().max(254),
  company: z.string().max(120).optional(),
});

export async function POST(req: NextRequest) {
  const limited = rateLimit({ key: `waitlist:${clientIp(req)}`, limit: 5, windowMs: 60_000 });
  if (!limited.ok) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const parsed = bodySchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Enter a valid email" }, { status: 400 });
  }

  if (parsed.data.company?.trim()) {
    return NextResponse.json({ ok: true });
  }

  await prisma.waitlistEntry.upsert({
    where: { email: parsed.data.email.toLowerCase() },
    create: { email: parsed.data.email.toLowerCase() },
    update: {},
  });

  return NextResponse.json({ ok: true });
}
