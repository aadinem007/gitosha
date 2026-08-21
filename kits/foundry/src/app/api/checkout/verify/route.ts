import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { clientIp, rateLimit } from "@/lib/rate-limit";
import { xflowFetch, xflowReady, type KitIntent } from "@/lib/xflow";

const bodySchema = z.object({
  sessionId: z.string().max(200),
  email: z.string().email().max(254).optional(),
  planId: z.string().max(64).optional(),
});

export async function POST(req: NextRequest) {
  const limited = rateLimit({ key: `verify:${clientIp(req)}`, limit: 20, windowMs: 60_000 });
  if (!limited.ok) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }
  if (!xflowReady()) {
    return NextResponse.json({ error: "Verification unavailable" }, { status: 500 });
  }

  const parsed = bodySchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const intent = await xflowFetch<KitIntent>(`/v1/transaction_intents/${parsed.data.sessionId}`);
  const status = (intent.status ?? "").toLowerCase();
  if (status !== "successful" && status !== "completed") {
    return NextResponse.json({ error: "Payment not completed" }, { status: 400 });
  }

  const email = (intent.metadata?.email || parsed.data.email || "").toLowerCase();
  const planId = intent.metadata?.planId || parsed.data.planId || "";
  if (!email || !planId) {
    return NextResponse.json({ error: "Metadata mismatch" }, { status: 400 });
  }

  await prisma.customer.upsert({
    where: { email },
    create: {
      email,
      planId,
      status: "ACTIVE",
      xflowIntentId: intent.id,
    },
    update: {
      planId,
      status: "ACTIVE",
      xflowIntentId: intent.id,
    },
  });

  return NextResponse.json({ ok: true, email, planId });
}
