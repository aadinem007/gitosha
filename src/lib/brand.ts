/**
 * GITOSHA brand SSOT
 *
 * Gi  = Guide / Insight  → Vault (scored opportunity research)
 * to  = the path from idea → build
 * sha = ship / shastra / craft → Foundry (production delivery)
 */
export const BRAND = {
  name: "Gitosha",
  nameUpper: "GITOSHA",
  tagline: "Stop guessing. Start shipping the right thing.",
  description:
    "Gitosha is the operator stack for builders who refuse to waste a quarter on the wrong product — scored research in the Vault, production scaffolding in Foundry. Priced in USD for international teams.",
  chatName: "Gita",
  chatRole: "Gitosha guide",
  products: {
    vault: "Vault",
    vaultFull: "The Vault",
    foundry: "Foundry",
  },
  defaultSiteUrl: "https://gitosha.vercel.app",
  emailFrom: "Gitosha <hello@gitosha.com>",
} as const;

export function siteUrl(): string {
  return process.env.NEXT_PUBLIC_SITE_URL ?? BRAND.defaultSiteUrl;
}
