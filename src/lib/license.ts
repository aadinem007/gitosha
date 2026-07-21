import { randomBytes } from "crypto";

/** New keys use GITO-; legacy SHIP- keys remain valid for existing buyers. */
export const LICENSE_KEY_PREFIX_NEW = "GITO";
export const LICENSE_KEY_PREFIX_LEGACY = "SHIP";

export const LICENSE_KEY_PATTERN =
  /^(GITO|SHIP)-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}$/i;

export function generateLicenseKey(): string {
  const segment = () => randomBytes(2).toString("hex").toUpperCase();
  return `${LICENSE_KEY_PREFIX_NEW}-${segment()}-${segment()}-${segment()}`;
}

export function isLicenseKeyFormat(key: string): boolean {
  return LICENSE_KEY_PATTERN.test(key.trim());
}
