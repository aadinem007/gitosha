import { randomBytes } from "crypto";

// Human-readable license key prefix kept as SHIP- for existing buyer compatibility.
export function generateLicenseKey(): string {
  const segment = () => randomBytes(2).toString("hex").toUpperCase();
  return `SHIP-${segment()}-${segment()}-${segment()}`;
}
