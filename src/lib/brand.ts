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
  /** Public brand story — no fake founders, addresses, or awards */
  story: {
    headline: "Named for the path — not the pitch.",
    lede: "Gitosha is the name for a single motion: know what to build, then ship it. Vault is the judgment. Foundry is the craft. Gita is the guide in between.",
    origin:
      "Operators were drowning in idea lists and starving for decisions. Twitter threads. Notion dumps. “100 SaaS ideas” PDFs that never tell you what to kill. Quarters vanished on the loudest concept instead of the one that cleared the gates. Gitosha exists so knowing and shipping stay one motion — scored research, then a production zip that already takes payments.",
    nameParts: [
      {
        mark: "G",
        title: "Guide · Insight",
        body: "Vault. Ten dimensions, one hundred points, explicit ship / pass / defer. Research that tells you what to kill — not another inspiration dump.",
      },
      {
        mark: "To",
        title: "The path",
        body: "Idea → decision → build. The dash in the middle is the product. Most tools stop at “here’s a list.” We stay until you choose.",
      },
      {
        mark: "Sha",
        title: "Ship · shastra · craft",
        body: "Foundry. Auth, checkout, webhooks, deploy docs — the production zip so you ship the right product, not the plumbing week.",
      },
    ],
  },
  /** Public support inbox (already used on FAQ / Gita) */
  supportEmail: "aaditya.shah8005@gmail.com",
  /** Live deploy until custom domain (gitosha.com) is wired — updated after Vercel rename */
  defaultSiteUrl: "https://gitosha.vercel.app",
  /** Fallback Resend from-address; set EMAIL_FROM in Vercel for production */
  emailFrom: "Gitosha <hello@gitosha.com>",
} as const;

export function siteUrl(): string {
  return process.env.NEXT_PUBLIC_SITE_URL ?? BRAND.defaultSiteUrl;
}
