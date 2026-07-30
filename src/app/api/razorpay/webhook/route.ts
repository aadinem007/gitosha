import { NextRequest, NextResponse } from "next/server";
import { clientIp, rateLimit } from "@/lib/rate-limit";
import { securityLog } from "@/lib/secure";
import { handleWebhook } from "@/lib/payments";

export const maxDuration = 30;

export async function POST(req: NextRequest) {
  const limited = rateLimit({
    key: `webhook:${clientIp(req)}`,
    limit: 120,
    windowMs: 60_000,
  });
  if (!limited.ok) {
    securityLog("razorpay_webhook_rate_limited", { ip: clientIp(req) });
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const rawBody = await req.text();
  if (rawBody.length > 256_000) {
    return NextResponse.json({ error: "Payload too large" }, { status: 413 });
  }

  const result = await handleWebhook("razorpay", rawBody, req.headers);
  return NextResponse.json(result.body, { status: result.status });
}
