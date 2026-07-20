import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const bodySchema = z.object({ email: z.string().email() });

export async function POST(req: NextRequest) {
  const parsed = bodySchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Enter a valid email" }, { status: 400 });
  }

  await prisma.subscriber.upsert({
    where: { email: parsed.data.email },
    create: { email: parsed.data.email, tier: "FREE" },
    update: {},
  });

  return NextResponse.json({ ok: true });
}
