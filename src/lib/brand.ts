/**
 * GITOSHA brand SSOT — company that helps you know what to build, then ship it.
 *
 * G  = Guide / Insight  → Vault (scored opportunity research)
 * To = the path from idea → build
 * Sha = ship / shastra / craft → Foundry (production delivery)
 */
export const BRAND = {
  name: "Gitosha",
  nameUpper: "GITOSHA",
  /** Public one-liner */
  tagline: "Know what to build. Then ship it.",
  /** Slightly longer meta / footer line */
  description:
    "Know what to build, then ship it. USD-priced Vault research and Foundry SaaS scaffold for international operators.",
  chatName: "Gita",
  chatRole: "Gitosha guide",
  products: {
    vault: "Vault",
    vaultFull: "The Vault",
    foundry: "Foundry",
  },
  /** Live deploy until custom domain (gitosha.com) is wired — updated after Vercel rename */
  defaultSiteUrl: "https://gitosha.vercel.app",
  /** Fallback Resend from-address; set EMAIL_FROM in Vercel for production */
  emailFrom: "Gitosha <hello@gitosha.com>",
} as const;

export function siteUrl(): string {
  return process.env.NEXT_PUBLIC_SITE_URL ?? BRAND.defaultSiteUrl;
}
