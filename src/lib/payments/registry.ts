import type { PaymentProvider } from "./provider";
import type { ProviderId, ProviderPublicConfig } from "./types";
import { razorpayProvider } from "./providers/razorpay";
import { stripeProvider } from "./providers/stripe";
import {
  paypalProvider,
  payoneerProvider,
  wiseProvider,
  xflowProvider,
  isScaffoldProvider,
} from "./providers/stubs";
import { prisma } from "@/lib/prisma";
import { isStripeConfigured } from "@/lib/stripe";

const ADAPTERS: Record<ProviderId, PaymentProvider> = {
  razorpay: razorpayProvider,
  stripe: stripeProvider,
  paypal: paypalProvider,
  xflow: xflowProvider,
  wise: wiseProvider,
  payoneer: payoneerProvider,
};

/** Env override for primary provider (legacy PAYMENTS_PROVIDER). */
export function legacyPrimaryProvider(): ProviderId {
  const raw = (process.env.PAYMENTS_PROVIDER ?? "razorpay").toLowerCase().trim();
  if (raw === "stripe") return "stripe";
  if (raw === "razorpay") return "razorpay";
  if (raw === "auto") {
    return isStripeConfigured() ? "stripe" : "razorpay";
  }
  return "razorpay";
}

function envEnabled(id: ProviderId): boolean {
  if (isScaffoldProvider(id)) return false;
  const key = `PAYMENTS_${id.toUpperCase()}_ENABLED`;
  const raw = process.env[key];
  if (raw === "false") return false;
  if (raw === "true") return true;
  // Default: razorpay/stripe follow credentials + legacy primary preference
  if (id === "razorpay" || id === "stripe") return true;
  return false;
}

export function getAdapter(id: ProviderId): PaymentProvider {
  return ADAPTERS[id];
}

export function listAdapters(): PaymentProvider[] {
  return Object.values(ADAPTERS);
}

/**
 * Resolve effective enable flags: env + optional DB PaymentProviderConfig rows.
 * Secrets never come from DB — only enabled + supportedCurrencies.
 */
export async function resolveProviderConfigs(): Promise<ProviderPublicConfig[]> {
  let dbRows: { providerId: string; enabled: boolean; supportedCurrencies: unknown }[] = [];
  try {
    dbRows = await prisma.paymentProviderConfig.findMany();
  } catch {
    // Table may not exist until db:push — fall back to env-only
    dbRows = [];
  }
  const byId = new Map(dbRows.map((r) => [r.providerId as ProviderId, r]));

  return listAdapters().map((adapter) => {
    const base = adapter.getPublicConfig();
    const db = byId.get(adapter.id);
    const scaffold = isScaffoldProvider(adapter.id);
    const enabled =
      !scaffold &&
      (db ? db.enabled && envEnabled(adapter.id) : envEnabled(adapter.id)) &&
      adapter.isLiveReady();

    let currencies = base.supportedCurrencies;
    if (db?.supportedCurrencies && Array.isArray(db.supportedCurrencies)) {
      currencies = (db.supportedCurrencies as string[]).filter(
        (c): c is "USD" | "INR" => c === "USD" || c === "INR"
      ) as ProviderPublicConfig["supportedCurrencies"];
      if (currencies.length === 0) currencies = base.supportedCurrencies;
    }

    return {
      ...base,
      enabled,
      supportedCurrencies: currencies,
      scaffoldOnly: scaffold || base.scaffoldOnly,
    };
  });
}

/**
 * Ordered providers for checkout: primary first, then other live-ready enabled adapters.
 * Failover: if primary disabled / not ready, try next enabled live provider.
 */
export async function resolveCheckoutProviderOrder(
  preferred?: ProviderId
): Promise<PaymentProvider[]> {
  const configs = await resolveProviderConfigs();
  const enabledIds = new Set(configs.filter((c) => c.enabled).map((c) => c.providerId));
  const primary = preferred ?? legacyPrimaryProvider();
  const order: ProviderId[] = [];
  if (enabledIds.has(primary)) order.push(primary);
  for (const id of ["razorpay", "stripe"] as ProviderId[]) {
    if (!order.includes(id) && enabledIds.has(id)) order.push(id);
  }
  return order.map((id) => ADAPTERS[id]);
}

export async function getEnabledProvider(id: ProviderId): Promise<PaymentProvider | null> {
  const configs = await resolveProviderConfigs();
  const cfg = configs.find((c) => c.providerId === id);
  if (!cfg?.enabled) return null;
  return ADAPTERS[id];
}

/** Sync helper for thin re-exports (legacy getPaymentsProvider). */
export function getPaymentsProvider(): "stripe" | "razorpay" {
  const p = legacyPrimaryProvider();
  return p === "stripe" ? "stripe" : "razorpay";
}
