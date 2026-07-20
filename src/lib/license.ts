import { randomBytes } from "crypto";

// Generates a human-readable license key: SHIP-XXXX-XXXX-XXXX
export function generateLicenseKey(): string {
  const segment = () => randomBytes(2).toString("hex").toUpperCase();
  return `SHIP-${segment()}-${segment()}-${segment()}`;
}
