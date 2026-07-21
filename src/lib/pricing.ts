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
    description: "Taste the research. No card. No trap.",
    features: [
      "Weekly top-3 scored opportunities",
      "Public 10-dimension method — fully transparent",
      "Archive of teardowns (including the ugly scores)",
      "Citeable SEO idea pages",
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
    description: "Launch lock-in for the first 100 operators. Then ₹1,499/mo. Stop guessing. Start shipping winners.",
    features: [
      "Every scored idea + every full teardown",
      "Kill criteria — what to walk away from",
      "Financial sketch + 14-day launch checklist",
      "Competitor map + positioning wedge",
      "One-click CSV of the live scoreboard",
      "15% off Foundry forever",
      "Cancel in one click — keep dignity",
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
    description: "Pay once. Sleep for a year. ~2 months free vs monthly launch price.",
    features: [
      "Everything in Operator",
      "Priority niche research (1 / quarter)",
      "Clean annual invoice for books",
      "First look at new research formats",
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
    description: "Your studio’s shared brain for what to build next — five seats, one invoice.",
    features: [
      "Everything in Operator",
      "5 seats · one invoice",
      "Private niche scoring on request",
      "Shared workspace notes",
      "Quarterly 30-min strategy call",
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
    description: "Stop rebuilding auth and billing. Ship your product on a stack that already takes money.",
    features: [
      "Production Next.js + TypeScript + Tailwind",
      "Postgres + Prisma (customers, licenses, waitlist)",
      "Magic-link auth — ready day one",
      "Razorpay checkout, verify, signed webhooks",
      "Abuse guards + production headers baked in",
      "Docker + CI deploy path",
      "Architecture map so you never get lost",
      "90 days Operator Vault included",
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
    description: "One license. Unlimited client SaaS builds. White-label. Studio research for a year. This is how serious studios stop reinventing the wheel every engagement.",
    features: [
      "Everything in Solo — same battle-tested zip",
      "Unlimited client projects · one license",
      "Full white-label rights",
      "Client handoff + invoice + proposal templates",
      "White-label delivery playbook in the zip",
      "Priority support when you’re on a deadline",
      "1 year Studio Vault (5 seats) included",
      "Re-download anytime from License portal",
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
    description: "Research + scaffold in one hit. Foundry Solo + 12 months Operator — the cleanest path from idea to live checkout.",
    features: [
      "Foundry Solo source license",
      "12 months Operator Vault",
      "Beat buying both separately",
      "One payment · instant unlock",
    ],
    amountPaise: 1499900,
    mode: "payment",
    cta: "Take the Launch Bundle",
    badge: "Most chosen",
  },
];
