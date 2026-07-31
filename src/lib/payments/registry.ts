import type { PaymentProvider } from "./provider";
import type { ProviderId, ProviderPublicConfig } from "./types";
import { razorpayProvider } from "./providers/razorpay";
import { stripeProvider } from "./providers/stripe";
import { paypalProvider } from "./providers/paypal";
import { xflowProvider } from "./providers/xflow";
import { wiseProvider } from "./providers/wise";
import { payoneerProvider } from "./providers/payoneer";
import { isScaffoldProvider } from "./providers/stubs";
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

const CHECKOUT_FAILOVER_ORDER: ProviderId[] = [
  "razorpay",
  "stripe",
  "paypal",
  "xflow",
];

/** Env override for primary provider (legacy PAYMENTS_PROVIDER). */
export function legacyPrimaryProvider(): ProviderId {
  const raw = (process.env.PAYMENTS_PROVIDER ?? "razorpay").toLowerCase().trim();
  if (raw === "stripe") return "stripe";
  if (raw === "razorpay") return "razorpay";
  if (raw === "paypal") return "paypal";
  if (raw === "xflow") return "xflow";
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
  // Default: checkout providers follow credentials + isLiveReady; payout rails stay off
  if (id === "razorpay" || id === "stripe" || id === "paypal") return true;
  // Xflow is opt-in (UPI bridge + connected-account ops)
  return false;
}

function supportsCheckout(adapter: PaymentProvider, cfg: ProviderPublicConfig): boolean {
  if (cfg.supportsCheckout === false) return false;
  if (cfg.capability === "payout") return false;
  if (cfg.scaffoldOnly) return false;
  return true;
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
    const scaffold = isScaffoldProvider(adapter.id) || Boolean(base.scaffoldOnly);
    const checkoutCapable = supportsCheckout(adapter, base);
    const enabled =
      !scaffold &&
      checkoutCapable &&
      (db ? db.enabled && envEnabled(adapter.id) : envEnabled(adapter.id)) &&
      adapter.isLiveReady();

    let currencies = base.supportedCurrencies;
    if (db?.supportedCurrencies && Array.isArray(db.supportedCurrencies)) {
      currencies = (db.supportedCurrencies as string[]).filter(
        (c): c is CurrencyCode => c === "USD" || c === "INR" || c === "EUR"
      );
      if (currencies.length === 0) currencies = base.supportedCurrencies;
    }

    return {
      ...base,
      enabled,
      supportedCurrencies: currencies,
      scaffoldOnly: scaffold,
      supportsCheckout: checkoutCapable,
    };
  });
}

type CurrencyCode = ProviderPublicConfig["supportedCurrencies"][number];

/**
 * Ordered providers for checkout: primary first, then other live-ready enabled adapters.
 * Failover: if primary disabled / not ready, try next enabled live provider.
 * Payout-only adapters (Wise / Payoneer) are never included.
 */
export async function resolveCheckoutProviderOrder(
  preferred?: ProviderId
): Promise<PaymentProvider[]> {
  const configs = await resolveProviderConfigs();
  const enabledIds = new Set(
    configs
      .filter((c) => c.enabled && c.supportsCheckout !== false)
      .map((c) => c.providerId)
  );
  const primary = preferred ?? legacyPrimaryProvider();
  const order: ProviderId[] = [];
  if (enabledIds.has(primary)) order.push(primary);
  for (const id of CHECKOUT_FAILOVER_ORDER) {
    if (!order.includes(id) && enabledIds.has(id)) order.push(id);
  }
  return order.map((id) => ADAPTERS[id]);
}

export async function getEnabledProvider(id: ProviderId): Promise<PaymentProvider | null> {
  const adapter = ADAPTERS[id];
  const base = adapter.getPublicConfig();
  if (base.supportsCheckout === false || base.capability === "payout") return null;
  if (!adapter.isLiveReady()) return null;
  // Respect explicit env disable for refunds/admin
  if (envEnabled(id) === false) return null;
  return adapter;
}

/** Sync helper for thin re-exports (legacy getPaymentsProvider). */
export function getPaymentsProvider(): "stripe" | "razorpay" {
  const p = legacyPrimaryProvider();
  return p === "stripe" ? "stripe" : "razorpay";
}
