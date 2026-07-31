/**
 * Legacy scaffold helpers.
 * PayPal / Xflow / Wise / Payoneer now have real adapter modules.
 * `isScaffoldProvider` remains for backward-compatible tests — always false.
 */

import type { ProviderId } from "../types";

/** @deprecated All former scaffolds have real adapters; none are scaffold-only. */
export function isScaffoldProvider(_id: ProviderId): boolean {
  void _id;
  return false;
}

// Re-export adapters so older imports from stubs keep working during transition.
export { paypalProvider } from "./paypal";
export { xflowProvider } from "./xflow";
export { wiseProvider } from "./wise";
export { payoneerProvider } from "./payoneer";
