export type PricingPlan = {
  id: "vault-free" | "vault-pro" | "vault-team" | "foundry-solo" | "foundry-agency";
  product: "vault" | "foundry";
  name: string;
  price: string;
  cadence: string;
  description: string;
  features: string[];
  priceEnvVar?: string;
  mode: "subscription" | "payment" | "none";
  cta: string;
};

export const VAULT_PLANS: PricingPlan[] = [
  {
    id: "vault-free",
    product: "vault",
    name: "Free",
    price: "$0",
    cadence: "forever",
    description: "The weekly digest and top-3 scored ideas, summary only.",
    features: [
      "Weekly research digest by email",
      "Top 3 scored ideas per issue",
      "Public teardown archive",
    ],
    mode: "none",
    cta: "Join free",
  },
  {
    id: "vault-pro",
    product: "vault",
    name: "Pro",
    price: "$19",
    cadence: "/month",
    description: "The full scored database, every teardown, launch-kit templates.",
    features: [
      "Everything in Free",
      "All 18+ scored ideas with full teardowns",
      "Launch-kit templates per idea",
      "CSV export of the scoring database",
      "10% off Foundry Kit",
    ],
    priceEnvVar: "vaultPro",
    mode: "subscription",
    cta: "Start Pro",
  },
  {
    id: "vault-team",
    product: "vault",
    name: "Team",
    price: "$79",
    cadence: "/month",
    description: "5 seats, private idea requests, priority research queue.",
    features: [
      "Everything in Pro",
      "5 team seats",
      "Submit a niche for custom scoring",
      "Priority research queue",
    ],
    priceEnvVar: "vaultTeam",
    mode: "subscription",
    cta: "Start Team",
  },
];

export const FOUNDRY_PLANS: PricingPlan[] = [
  {
    id: "foundry-solo",
    product: "foundry",
    name: "Solo",
    price: "$149",
    cadence: "one-time",
    description: "Full source, single project license, community support.",
    features: [
      "Next.js + TypeScript + Tailwind scaffold",
      "Prisma + Supabase auth wired up",
      "Stripe billing + webhook handlers pre-built",
      "Agent-native architecture docs",
    ],
    priceEnvVar: "foundrySolo",
    mode: "payment",
    cta: "Buy Solo",
  },
  {
    id: "foundry-agency",
    product: "foundry",
    name: "Agency",
    price: "$499",
    cadence: "one-time",
    description: "Unlimited client projects, white-label rights, priority support.",
    features: [
      "Everything in Solo",
      "Unlimited client projects",
      "White-label rights",
      "Priority support",
    ],
    priceEnvVar: "foundryAgency",
    mode: "payment",
    cta: "Buy Agency",
  },
];
