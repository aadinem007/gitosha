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
    description: "Public research layer — enough to judge if we are serious.",
    features: [
      "Weekly top-3 scored opportunities",
      "Full public 10-dimension method",
      "Public teardown archive (including low scores)",
      "SEO idea pages you can cite",
    ],
    mode: "none",
    cta: "Start free",
  },
  {
    id: "vault-pro",
    product: "vault",
    name: "Operator",
    price: "₹999",
    cadence: "/month",
    description: "Launch price for the first 100 operators. Then ₹1,499/mo.",
    features: [
      "Full scored database + every teardown",
      "Kill criteria & anti-portfolio (what NOT to build)",
      "Financial model + 14-day launch checklist per idea",
      "Competitor map + positioning wedge",
      "CSV export of the live scoreboard",
      "15% off Foundry forever",
      "Cancel anytime",
    ],
    amountPaise: 99900,
    planEnvVar: "vaultPro",
    mode: "subscription",
    cta: "Get Operator access",
    badge: "Launch price",
    highlight: true,
  },
  {
    id: "vault-pro-annual",
    product: "vault",
    name: "Operator Annual",
    price: "₹9,999",
    cadence: "/year",
    description: "Pay once. ~2 months free vs monthly launch price.",
    features: [
      "Everything in Operator",
      "Priority research queue (1 niche / quarter)",
      "Annual invoice for accounting",
      "Early access to new research formats",
    ],
    amountPaise: 999900,
    mode: "payment",
    cta: "Lock annual access",
    badge: "Best value",
  },
  {
    id: "vault-team",
    product: "vault",
    name: "Studio",
    price: "₹4,999",
    cadence: "/month",
    description: "For studios shipping multiple products in parallel.",
    features: [
      "Everything in Operator",
      "5 seats under one invoice",
      "Private niche scoring requests",
      "Shared workspace notes",
      "Quarterly strategy call (30 min)",
    ],
    amountPaise: 499900,
    planEnvVar: "vaultTeam",
    mode: "subscription",
    cta: "Start Studio",
  },
];

export const FOUNDRY_PLANS: PricingPlan[] = [
  {
    id: "foundry-solo",
    product: "foundry",
    name: "Foundry Solo",
    price: "₹9,999",
    cadence: "one-time",
    description: "Production SaaS scaffold — auth, billing, DB, deploy — ready to customize.",
    features: [
      "Next.js + TypeScript + Tailwind production scaffold",
      "Postgres + Prisma schema (subscriptions, licenses, waitlist)",
      "Magic-link auth pre-wired",
      "Razorpay checkout, verify, signed webhooks",
      "Rate limits, CSP, HSTS, honeypot patterns included",
      "Docker + CI deploy pipeline",
      "Architecture docs + module map",
      "90 days of Operator Vault included",
    ],
    amountPaise: 999900,
    mode: "payment",
    cta: "Buy Foundry Solo",
    highlight: true,
  },
  {
    id: "foundry-agency",
    product: "foundry",
    name: "Foundry Agency",
    price: "₹29,999",
    cadence: "one-time",
    description: "Unlimited client builds. White-label. Priority support.",
    features: [
      "Everything in Solo",
      "Unlimited client projects",
      "White-label rights (remove Shipyard marks)",
      "Priority support channel",
      "Client handoff checklist + invoice templates",
      "1 year of Studio Vault included",
    ],
    amountPaise: 2999900,
    mode: "payment",
    cta: "Buy Agency license",
  },
  {
    id: "bundle-launch",
    product: "bundle",
    name: "Launch Bundle",
    price: "₹14,999",
    cadence: "one-time",
    description: "Foundry Solo + 1 year Operator. Research + scaffold in one checkout.",
    features: [
      "Foundry Solo source license",
      "12 months Operator Vault",
      "Save vs buying separately",
      "Single payment, instant unlock",
    ],
    amountPaise: 1499900,
    mode: "payment",
    cta: "Get the Launch Bundle",
    badge: "Most chosen",
  },
];
