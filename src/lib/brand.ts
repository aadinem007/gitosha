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
  /** Hero support — premium B2B line under the tagline */
  heroSupport:
    "International operators, priced in USD. Rigorous opportunity scoring with explicit go/no-go criteria — and a production-ready, payment-ready foundation so you ship the right product, not the loudest idea.",
  /** Slightly longer meta / footer line */
  description:
    "Know what to build, then ship it. USD-priced Vault research and a production-ready Foundry foundation for international operators.",
  chatName: "Gita",
  chatRole: "Gitosha guide",
  products: {
    vault: "Vault",
    vaultFull: "The Vault",
    foundry: "Foundry",
  },
  /** Vault chapter headline under the product name */
  vaultHeadline: "Your research vault for scored opportunities.",
  /** Vault chapter body */
  vaultBody:
    "Every idea is scored across demand, competition, margin, and time-to-launch — with explicit build-or-pass criteria. Operator unlocks full teardowns, financial sketches, and launch checklists from $15/mo for the first 100 seats.",
  /** Foundry chapter headline */
  foundryHeadline: "Ship on a foundation that already takes payments.",
  /** Foundry chapter body */
  foundryBody:
    "Auth, checkout, webhooks, and deploy docs in one zip — the same production stack Gitosha runs. Solo $99 for your product. Agency $249 for every client after. Pay once in USD; download the same minute.",
  /** Live deploy until custom domain (gitosha.com) is wired — updated after Vercel rename */
  defaultSiteUrl: "https://gitosha.vercel.app",
  /** Fallback Resend from-address; set EMAIL_FROM in Vercel for production */
  emailFrom: "Gitosha <hello@gitosha.com>",
} as const;

export function siteUrl(): string {
  return process.env.NEXT_PUBLIC_SITE_URL ?? BRAND.defaultSiteUrl;
}
