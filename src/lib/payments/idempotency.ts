import { createHash } from "crypto";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { paymentsLog } from "./errors";
import type { ProviderId, WebhookProcessStatus } from "./types";

export function buildCheckoutIdempotencyKey(opts: {
  email: string;
  planId: string;
  provider: ProviderId;
  clientKey?: string;
}): string {
  if (opts.clientKey && opts.clientKey.length >= 8 && opts.clientKey.length <= 128) {
    return `client:${opts.clientKey}`;
  }
  // 15-minute window buckets retries without creating duplicate pending rows forever
  const window = Math.floor(Date.now() / (15 * 60_000));
  const digest = createHash("sha256")
    .update(`${opts.email}|${opts.planId}|${opts.provider}|${window}`)
    .digest("hex")
    .slice(0, 32);
  return `auto:${digest}`;
}

/**
 * Record a webhook event. Returns whether this is the first time we see eventId.
 * Duplicate → caller should return 200 without re-fulfilling.
 */
export async function claimWebhookEvent(opts: {
  provider: ProviderId;
  eventId: string;
  summary: Record<string, unknown>;
}): Promise<{ isNew: boolean; id: string }> {
  try {
    const row = await prisma.paymentWebhookEvent.create({
      data: {
        provider: opts.provider,
        eventId: opts.eventId,
        payloadSummary: opts.summary as Prisma.InputJsonValue,
        status: "received",
      },
    });
    return { isNew: true, id: row.id };
  } catch (err) {
    const code =
      err && typeof err === "object" && "code" in err
        ? String((err as { code: unknown }).code)
        : "";
    if (code === "P2002") {
      const existing = await prisma.paymentWebhookEvent.findUnique({
        where: {
          provider_eventId: { provider: opts.provider, eventId: opts.eventId },
        },
      });
      paymentsLog("webhook_duplicate", { provider: opts.provider, eventId: opts.eventId.slice(0, 64) });
      return { isNew: false, id: existing?.id ?? "dup" };
    }
    throw err;
  }
}

export async function markWebhookProcessed(
  id: string,
  status: WebhookProcessStatus = "processed"
): Promise<void> {
  if (id === "dup") return;
  await prisma.paymentWebhookEvent.update({
    where: { id },
    data: { status, processedAt: new Date() },
  });
}
