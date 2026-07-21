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
  amountPaise?: number;
  planEnvVar?: "vaultPro" | "vaultTeam";
  mode: "subscription" | "payment" | "none";
  cta: string;
  badge?: string;
  highlight?: boolean;
};

export const VAULT_PLANS: PricingPlan[] = [
  {
    id: "vault-free",
    product: "vault",
    name: "Scout",
    price: "₹0",
    cadence: "forever",
    description: "Taste the research. No card. No trap. Decide if we’re serious before you pay.",
    features: [
      "Weekly top-3 scored opportunities by email / site",
      "Full public 10-dimension scoring method",
      "Public teardown archive — including low scores",
      "Citeable SEO idea pages for every scored concept",
      "Yardhand chatbot answers on the site",
      "Live homepage scoreboard (always free to browse)",
      "No credit card · cancel nothing · keep browsing",
    ],
    mode: "none",
    cta: "Start free — no card",
  },
  {
    id: "vault-pro",
    product: "vault",
    name: "Operator",
    price: "₹999",
    cadence: "/month",
    description:
      "Launch lock-in for the first 100 operators (then ₹1,499/mo). Full vault — stop guessing what to build.",
    features: [
      "Everything in Scout",
      "Every scored idea + every full premium teardown",
      "Kill criteria & anti-portfolio (what NOT to build)",
      "Financial sketch + 14-day launch checklist per idea",
      "Competitor map + positioning wedge",
      "One-click CSV export of the live scoreboard",
      "Magic-link sign-in to the private Vault",
      "Yardhand + FAQ for instant product answers",
      "15% off Foundry forever (Solo / Agency / Bundle)",
      "Cancel anytime — access through the paid period",
    ],
    amountPaise: 99900,
    planEnvVar: "vaultPro",
    mode: "subscription",
    cta: "Unlock Operator — ₹999",
    badge: "First 100 only",
    highlight: true,
  },
  {
    id: "vault-pro-annual",
    product: "vault",
    name: "Operator Annual",
    price: "₹9,999",
    cadence: "/year",
    description: "Pay once. ~2 months free vs monthly launch price. Lock research for the year.",
    features: [
      "Everything in Operator",
      "Priority niche research queue (1 niche / quarter)",
      "Clean annual invoice for accounting / GST books",
      "Early access to new research formats",
      "Same CSV export + Vault magic-link access",
      "Foundry discount still applies all year",
      "No monthly reminders — one decision, twelve months",
    ],
    amountPaise: 999900,
    mode: "payment",
    cta: "Lock the year — ₹9,999",
    badge: "Best value",
  },
  {
    id: "vault-team",
    product: "vault",
    name: "Studio",
    price: "₹4,999",
    cadence: "/month",
    description: "Shared research brain for studios shipping multiple products — five seats, one invoice.",
    features: [
      "Everything in Operator",
      "5 seats under one studio invoice",
      "Private niche scoring requests for your pipeline",
      "Shared workspace notes across the team",
      "Quarterly 30-min strategy call",
      "CSV export for partners / investors / clients",
      "Priority Yardhand + email support path",
      "Ideal when 2+ people decide what to build next",
    ],
    amountPaise: 499900,
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
    price: "₹9,999",
    cadence: "one-time",
    description:
      "Stop rebuilding auth and billing. Ship your product on a stack that already takes INR payments.",
    features: [
      "Production Next.js + TypeScript + Tailwind scaffold",
      "Postgres + Prisma (customers, licenses, waitlist)",
      "Magic-link auth pre-wired (Supabase)",
      "Razorpay checkout + signature verify + webhooks",
      "Server-side amount locking (no client price hacks)",
      "Rate limits + honeypot waitlist patterns included",
      "Production security headers / CSP patterns included",
      "Docker + CI deploy pipeline starter",
      "Architecture map + Getting Started docs",
      "env.example for Supabase + Razorpay + DB",
      "Instant zip via License portal after payment",
      "90 days of Operator Vault included",
      "Re-download zip anytime (fair-use cap)",
    ],
    amountPaise: 999900,
    mode: "payment",
    cta: "Get Solo — download today",
  },
  {
    id: "foundry-agency",
    product: "foundry",
    name: "Foundry Agency",
    price: "₹29,999",
    cadence: "one-time",
    description:
      "One license. Unlimited client SaaS builds. White-label. Studio research for a year. Built so studios stop restarting from zero every engagement.",
    features: [
      "Everything in Solo — same production zip",
      "Unlimited client projects under one license",
      "Full white-label rights (remove Shipyard marks)",
      "Client handoff checklist (in the zip)",
      "Invoice template for client billing (in the zip)",
      "Proposal template for win-more pitches (in the zip)",
      "White-label delivery playbook (in the zip)",
      "Priority support when you’re on a client deadline",
      "1 year Studio Vault included (5 seats)",
      "Commercial rights for agency resale of *your builds*",
      "License portal re-download for every machine on the team",
      "Clear Solo vs Agency comparison on-site before you buy",
    ],
    amountPaise: 2999900,
    mode: "payment",
    cta: "Claim Agency — ₹29,999",
    badge: "Studios choose this",
    highlight: true,
  },
  {
    id: "bundle-launch",
    product: "bundle",
    name: "Launch Bundle",
    price: "₹14,999",
    cadence: "one-time",
    description:
      "Research + scaffold in one checkout. Foundry Solo + 12 months Operator — cleaner and cheaper than buying both apart (~₹21,987).",
    features: [
      "Foundry Solo source license (full zip)",
      "12 months Operator Vault access",
      "Save ~₹7,000 vs Solo + monthlies at launch price",
      "Single Razorpay payment · one receipt",
      "Instant Foundry download + Vault sign-in unlock",
      "15% Foundry discount not needed — already bundled",
      "Best path if you want idea research AND a ship kit",
    ],
    amountPaise: 1499900,
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
    if (p.mode !== "none" && (!p.amountPaise || p.amountPaise <= 0)) {
      errors.push(`${p.id} missing amountPaise`);
    }
    if (new Set(p.features).size !== p.features.length) {
      errors.push(`${p.id} has duplicate feature lines`);
    }
  }
  const solo = FOUNDRY_PLANS.find((p) => p.id === "foundry-solo")!;
  const agency = FOUNDRY_PLANS.find((p) => p.id === "foundry-agency")!;
  const bundle = FOUNDRY_PLANS.find((p) => p.id === "bundle-launch")!;
  if (agency.amountPaise! <= solo.amountPaise!) errors.push("Agency must cost more than Solo");
  if (bundle.amountPaise! <= solo.amountPaise!) errors.push("Bundle should exceed Solo alone");
  return errors;
}
