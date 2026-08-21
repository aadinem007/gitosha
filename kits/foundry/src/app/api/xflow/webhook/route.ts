import { createHmac, timingSafeEqual } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { xflowFetch, xflowReady, type KitIntent } from "@/lib/xflow";

function signaturesEqual(a: string, b: string): boolean {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  if (left.length !== right.length) return false;
  return timingSafeEqual(left, right);
}

function verify(rawBody: string, headers: Headers, secret: string): boolean {
  const id = headers.get("webhook-id") ?? "";
  const ts = headers.get("webhook-timestamp") ?? "";
  const sigHeader = headers.get("webhook-signature") ?? "";
  if (!id || !ts || !sigHeader) return false;
  const timestamp = Number(ts);
  if (!Number.isFinite(timestamp)) return false;
  if (Math.abs(Math.floor(Date.now() / 1000) - timestamp) > 300) return false;
  const toSign = `${id}.${ts}.${rawBody}`;
  const expected = createHmac("sha256", secret).update(toSign, "utf8").digest("base64");
  const provided = sigHeader
    .split(/\s+/)
    .map((part) => part.replace(/^v\d+,/i, "").trim())
    .filter(Boolean);
  return provided.some((sig) => signaturesEqual(sig, expected));
}

export async function POST(req: NextRequest) {
  if (!xflowReady()) {
    return NextResponse.json({ error: "Unavailable" }, { status: 503 });
  }
  const secret = process.env.XFLOW_WEBHOOK_SECRET!.trim();
  const rawBody = await req.text();
  if (!verify(rawBody, req.headers, secret)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  let body: { type?: string; linked_id?: string };
  try {
    body = JSON.parse(rawBody) as { type?: string; linked_id?: string };
  } catch {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  if (body.type !== "transaction_intent.status.successful" || !body.linked_id) {
    return NextResponse.json({ received: true });
  }

  const intent = await xflowFetch<KitIntent>(`/v1/transaction_intents/${body.linked_id}`);
  const email = intent.metadata?.email?.toLowerCase();
  const planId = intent.metadata?.planId;
  if (!email || !planId) {
    return NextResponse.json({ received: true });
  }

  await prisma.customer.upsert({
    where: { email },
    create: { email, planId, status: "ACTIVE", xflowIntentId: intent.id },
    update: { planId, status: "ACTIVE", xflowIntentId: intent.id },
  });

  return NextResponse.json({ received: true });
}
