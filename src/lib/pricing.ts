import {
  displayAmountForPlan,
  usdCentsToInrPaise,
  USD_CENTS_TO_INR_PAISE_FACTOR,
  PLAN_PRICE_BOOK,
} from "@/lib/payments/currencies";

export type PricingPlan = {
  id:
    | "vault-free"
    | "vault-pro"
    | "vault-pro-annual"
    | "vault-team"
    | "foundry-solo"
    | "foundry-agency"
    | "bundle-launch";
  product: "vault" | "foundry" | "bundle";
  name: string;
  price: string;
  cadence: string;
  description: string;
  features: string[];
  /** Stripe minor units (cents). amount * 100. */
  amountCents?: number;
  planEnvVar?: "vaultPro" | "vaultTeam";
  mode: "subscription" | "payment" | "none";
  cta: string;
  badge?: string;
  highlight?: boolean;
};

export const CURRENCY = "usd" as const;
export const CURRENCY_DISPLAY = "USD";

/** Configured charge/display currencies — fixed price lists, not live FX. */
export const PRICING_CURRENCIES = ["USD", "INR", "EUR"] as const;
export type PricingCurrency = (typeof PRICING_CURRENCIES)[number];

/** Post-launch Operator list price (first 100 seats use launch amountCents on vault-pro). */
export const OPERATOR_LIST_PRICE_CENTS = 1900;

/**
 * Fixed configured INR conversion for Razorpay India settlement.
 * NOT a live FX rate — do not present as market FX.
 * Re-exported from payments layer for a single source of truth.
 */
export { usdCentsToInrPaise, USD_CENTS_TO_INR_PAISE_FACTOR, PLAN_PRICE_BOOK };

/** Display helper: prefer PLAN_PRICE_BOOK; else label approx conversion (not live FX). */
export function formatPlanPrice(
  amountCents: number,
  display: PricingCurrency = "USD",
  planId?: string
): { label: string; note?: string } {
  if (planId) {
    const priced = displayAmountForPlan(planId, amountCents, display);
    return { label: priced.label, note: priced.note };
  }
  if (display === "INR") {
    const paise = usdCentsToInrPaise(amountCents);
    return {
      label: `₹${Math.round(paise / 100).toLocaleString("en-IN")}`,
      note: "Approx. INR from fixed configured conversion — not a live FX rate. Charge currency follows payment provider.",
    };
  }
  if (display === "EUR") {
    const priced = displayAmountForPlan("_", amountCents, "EUR");
    return {
      label: priced.label,
      note: "Approx. EUR from fixed configured conversion — not a live FX rate.",
    };
  }
  const dollars = amountCents / 100;
  return {
    label: `$${dollars % 1 === 0 ? dollars.toFixed(0) : dollars.toFixed(2)}`,
  };
}

export const VAULT_PLANS: PricingPlan[] = [
  {
    id: "vault-free",
    product: "vault",
    name: "Scout",
    price: "$0",
    cadence: "forever",
    description: "Taste the research. No card. No trap. Decide if we’re serious before you pay.",
    features: [
      "Weekly top-3 scored opportunities by email / site",
      "Full public 10-dimension scoring method (out of 100)",
      "Public teardown archive — including low scores we publish",
      "Citeable SEO idea pages for every scored concept",
      "Gita chatbot answers on product, pricing, and method",
      "Live homepage scoreboard (always free to browse)",
      "Demand · competition · margin · MRR · time-to-launch visibility",
      "Anti-hype stance: we publish rejects, not just winners",
      "No credit card · cancel nothing · keep browsing",
    ],
    mode: "none",
    cta: "Start free — no card",
  },
  {
    id: "vault-pro",
    product: "vault",
    name: "Operator",
    price: "$15",
    cadence: "/month",
    description:
      "Launch lock-in for the first 100 operators (then $19/mo). Full vault — stop guessing what to build.",
    features: [
      "Everything in Scout",
      "Every scored idea + every full premium teardown (Markdown)",
      "Go/no-go criteria written as pass/fail gates — not vibes",
      "Anti-portfolio: concepts we reject so you don’t waste a quarter",
      "Financial sketch + unit-economics notes per opportunity",
      "14-day launch checklist tied to each scored idea",
      "Competitor map + positioning wedge you can pitch from",
      "10-dimension score breakdowns (demand → global reach)",
      "One-click CSV export of the live scoreboard",
      "Magic-link sign-in to the private Vault",
      "Searchable archive that grows as new scores ship",
      "Outcome focus: decide ship / pass / defer in one sitting",
      "Gita + FAQ for instant product answers",
      "Email support for Vault access & billing",
      "15% off Foundry forever (Solo / Agency / Bundle)",
      "Cancel anytime — access through the paid period",
      "Built for operators who choose niches, not scroll Twitter lists",
    ],
    amountCents: 1500,
    planEnvVar: "vaultPro",
    mode: "subscription",
    cta: "Unlock Operator — $15",
    badge: "First 100 only",
    highlight: true,
  },
  {
    id: "vault-pro-annual",
    product: "vault",
    name: "Operator Annual",
    price: "$149",
    cadence: "/year",
    description: "Pay once. ~3 months free vs monthly launch price. Lock research for the year.",
    features: [
      "Everything in Operator",
      "Priority niche research queue (1 niche / quarter)",
      "Clean annual invoice for accounting / books",
      "Early access to new research formats",
      "Same CSV export + Vault magic-link access",
      "Go/no-go criteria + launch checklists all year",
      "Foundry discount still applies all year",
      "Quarterly research cadence without monthly decisions",
      "No monthly reminders — one decision, twelve months",
    ],
    amountCents: 14900,
    mode: "payment",
    cta: "Lock the year — $149",
    badge: "Best value",
  },
  {
    id: "vault-team",
    product: "vault",
    name: "Studio",
    price: "$49",
    cadence: "/month",
    description: "Shared research brain for studios shipping multiple products — five seats, one invoice.",
    features: [
      "Everything in Operator",
      "5 seats under one studio invoice",
      "Private niche scoring requests for your pipeline",
      "Shared workspace notes across the team",
      "Quarterly 30-min strategy call",
      "CSV export for partners / investors / clients",
      "Priority Gita + email support path",
      "Go/no-go criteria shared so the team stops debating dead ideas",
      "Same scored language across founders, PMs, and freelancers",
      "Ideal when 2+ people decide what to build next",
      "Pipeline view for client pitches that start with scores",
    ],
    amountCents: 4900,
    planEnvVar: "vaultTeam",
    mode: "subscription",
    cta: "Put the studio on Studio",
  },
];

export const FOUNDRY_PLANS: PricingPlan[] = [
  {
    id: "foundry-solo",
    product: "foundry",
    name: "Foundry Solo",
    price: "$99",
    cadence: "one-time",
    description:
      "Stop rebuilding auth and billing. Ship your product on a stack that already takes payments.",
    features: [
      "Production Next.js App Router + TypeScript + Tailwind foundation",
      "Postgres + Prisma (customers, licenses, waitlist models)",
      "Magic-link auth pre-wired (Supabase)",
      "Checkout + signature verify + webhook unlock flow",
      "Server-side amount locking (no client price hacks)",
      "Rate limits + honeypot waitlist patterns included",
      "Production security headers / CSP patterns included",
      "Docker + CI deploy pipeline starter",
      "Architecture map + Getting Started docs in the zip",
      "env.example for auth, payments, and database",
      "Auth-gated dashboard route pattern included",
      "License portal re-download anytime (fair-use cap)",
      "Instant zip via License portal after payment",
      "90 days of Operator Vault included",
      "Email support for setup blockers (fair-use)",
      "Commercial rights for one product you own or operate",
      "Outcome: first paid checkout path without weeks of plumbing",
      "Deliverable: runnable codebase you can rename and ship",
      "Webhook → entitlement unlock pattern you can extend",
      "Smoke-tested kit layout (docs + agency folder present)",
      "Same stack Gitosha uses in production — not a toy demo",
    ],
    amountCents: 9900,
    mode: "payment",
    cta: "Get Solo — download today",
  },
  {
    id: "foundry-agency",
    product: "foundry",
    name: "Foundry Agency",
    price: "$249",
    cadence: "one-time",
    description:
      "One license. Unlimited client SaaS builds. White-label. Studio research for a year. Built so studios stop restarting from zero every engagement.",
    features: [
      "Everything in Solo — same production zip",
      "Unlimited client projects under one license",
      "Full white-label rights (remove Gitosha marks)",
      "Client handoff checklist (in the zip)",
      "Invoice template for client billing (in the zip)",
      "Proposal template for win-more pitches (in the zip)",
      "White-label delivery playbook (in the zip)",
      "Priority support when you’re on a client deadline",
      "1 year Studio Vault included (5 seats)",
      "Commercial rights for agency resale of *your builds*",
      "License portal re-download for every machine on the team",
      "Auth + checkout + webhooks ready for client handoff",
      "Clear Solo vs Agency comparison on-site before you buy",
      "Studio research so client pitches start with scored niches",
      "Outcome: second client build shouldn’t restart from blank",
      "Deliverable: rights + templates + research seat pack",
      "Studio Vault seats keep research language consistent across staff",
    ],
    amountCents: 24900,
    mode: "payment",
    cta: "Claim Agency — $249",
    badge: "Studios choose this",
    highlight: true,
  },
  {
    id: "bundle-launch",
    product: "bundle",
    name: "Launch Bundle",
    price: "$149",
    cadence: "one-time",
    description:
      "Research + ship kit in one checkout. Foundry Solo + 12 months Operator — cleaner and cheaper than buying both apart ($99 + $180).",
    features: [
      "Foundry Solo source license (full zip)",
      "12 months Operator Vault access",
      "Go/no-go criteria + premium teardowns for a full year",
      "CSV export + magic-link Vault access",
      "Save ~$130 vs Solo + monthlies at launch price",
      "Single checkout · one receipt",
      "Instant Foundry download + Vault sign-in unlock",
      "15% Foundry discount not needed — already bundled",
      "Best path if you want idea research AND a ship kit",
      "Decide what to build (Vault) and ship it (Foundry) without two cart decisions",
      "Annual Operator cadence locked in — no monthly churn risk",
    ],
    amountCents: 14900,
    mode: "payment",
    cta: "Take the Launch Bundle",
    badge: "Most chosen",
  },
];

/** Invariants used by smoke tests */
export function assertPricingInvariants(): string[] {
  const errors: string[] = [];
  const all = [...VAULT_PLANS, ...FOUNDRY_PLANS];
  const ids = new Set<string>();
  for (const p of all) {
    if (ids.has(p.id)) errors.push(`Duplicate plan id: ${p.id}`);
    ids.add(p.id);
    if (p.features.length < 4) errors.push(`${p.id} needs richer features`);
    if (p.mode !== "none" && (!p.amountCents || p.amountCents <= 0)) {
      errors.push(`${p.id} missing amountCents`);
    }
    if (p.price.includes("₹") || p.price.toLowerCase().includes("rs")) {
      errors.push(`${p.id} must display USD, not INR`);
    }
    if (new Set(p.features).size !== p.features.length) {
      errors.push(`${p.id} has duplicate feature lines`);
    }
  }
  const solo = FOUNDRY_PLANS.find((p) => p.id === "foundry-solo")!;
  const agency = FOUNDRY_PLANS.find((p) => p.id === "foundry-agency")!;
  const bundle = FOUNDRY_PLANS.find((p) => p.id === "bundle-launch")!;
  const operator = VAULT_PLANS.find((p) => p.id === "vault-pro")!;
  if (agency.amountCents! <= solo.amountCents!) errors.push("Agency must cost more than Solo");
  if (bundle.amountCents! <= solo.amountCents!) errors.push("Bundle should exceed Solo alone");
  if (solo.amountCents !== 9900) errors.push("Solo must be $99 (9900 cents)");
  if (agency.amountCents !== 24900) errors.push("Agency must be $249 (24900 cents)");
  if (bundle.amountCents !== 14900) errors.push("Bundle must be $149 (14900 cents)");
  if (operator.amountCents !== 1500) errors.push("Operator launch must be $15 (1500 cents)");
  return errors;
}
