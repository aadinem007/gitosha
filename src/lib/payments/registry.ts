import { xflowProvider } from "./providers/xflow";
import type { PaymentProvider } from "./provider";
import type { ProviderId, ProviderPublicConfig } from "./types";

/** Xflow is the only checkout adapter. No failover. */
export function getPaymentsProvider(): ProviderId {
  return "xflow";
}

export function getAdapter(_id?: string): PaymentProvider {
  return xflowProvider;
}

export async function getEnabledProvider(_id?: string): Promise<PaymentProvider | null> {
  return xflowProvider.isLiveReady() ? xflowProvider : null;
}

export async function resolveCheckoutProviderOrder(): Promise<PaymentProvider[]> {
  return xflowProvider.isLiveReady() ? [xflowProvider] : [];
}

export async function resolveProviderConfigs(): Promise<ProviderPublicConfig[]> {
  return [xflowProvider.getPublicConfig()];
}
