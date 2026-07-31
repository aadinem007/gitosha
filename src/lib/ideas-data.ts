export type IdeaScores = {
  demand: number;
  competition: number;
  scalability: number;
  automation: number;
  margin: number;
  mrrPotential: number;
  barrierToEntry: number;
  aiLeverage: number;
  globalReach: number;
  timeToLaunch: number;
};

export type SeedIdea = {
  slug: string;
  name: string;
  category: string;
  oneLiner: string;
  scores: IdeaScores;
  isPremium: boolean;
  teardownMd: string;
};

function scores(
  demand: number,
  competition: number,
  scalability: number,
  automation: number,
  margin: number,
  mrrPotential: number,
  barrierToEntry: number,
  aiLeverage: number,
  globalReach: number,
  timeToLaunch: number
): IdeaScores {
  return { demand, competition, scalability, automation, margin, mrrPotential, barrierToEntry, aiLeverage, globalReach, timeToLaunch };
}

export function totalScore(s: IdeaScores): number {
  return (
    s.demand + s.competition + s.scalability + s.automation + s.margin +
    s.mrrPotential + s.barrierToEntry + s.aiLeverage + s.globalReach + s.timeToLaunch
  );
}

// Same 18 concepts scored in the portfolio canvas. The first three ship as
// free preview teardowns; the rest are Pro-tier content.
export const SEED_IDEAS: SeedIdea[] = [
  {
    slug: "build-intel-vault",
    name: "Build-Intel Vault",
    category: "Intel Product",
    oneLiner: "AI-automated weekly research digest + live-scored opportunity database for indie founders.",
    scores: scores(8, 5, 10, 9, 10, 6, 8, 10, 9, 9),
    isPremium: false,
    teardownMd: "This is the product you're reading right now — the flagship venture. Full teardown lives in the [Portfolio Scoring canvas](/) and the README.",
  },
  {
    slug: "foundry-kit",
    name: "Foundry Kit",
    category: "Software",
    oneLiner: "AI-native Next.js/Stripe/Supabase SaaS starter kit built for agent-assisted founders.",
    scores: scores(8, 5, 10, 9, 9, 6, 6, 10, 9, 9),
    isPremium: false,
    teardownMd: "The companion starter-kit product — see /foundry for the full story and /foundry-kit to buy.",
  },
  {
    slug: "recoverly",
    name: "Recoverly",
    category: "Software",
    oneLiner: "Stripe failed-payment recovery / dunning automation for subscription businesses.",
    scores: scores(8, 4, 9, 9, 9, 8, 5, 6, 8, 6),
    isPremium: false,
    teardownMd: "Free preview: Recoverly targets the ~5-10% of subscription revenue lost to failed card payments every month. Churnkey and Stripe's own Smart Retries prove the ceiling, but the small-SaaS segment ($1M-10M ARR) is underserved by both. Next in the Gitosha build queue.",
  },
  {
    slug: "bridge-integration",
    name: "Bridge",
    category: "Software",
    oneLiner: "Niche B2B integration connecting two popular tools with no native integration.",
    scores: scores(6, 7, 8, 9, 9, 5, 8, 5, 7, 8),
    isPremium: true,
    teardownMd: "Pro teardown: the lowest-build-cost idea in the database — you inherit both tools' user bases and typically face zero direct competition. The hard part is picking the right pair; full candidate shortlist is Pro-only.",
  },
  {
    slug: "meterbase",
    name: "MeterBase",
    category: "Dev Tools",
    oneLiner: "Usage metering & billing-as-a-service for indie AI/API builders.",
    scores: scores(7, 5, 9, 9, 8, 7, 5, 6, 9, 6),
    isPremium: true,
    teardownMd: "Pro teardown: Orb, Metronome, and Lago all target mid-market and enterprise. The solo/indie tier building usage-based AI products is genuinely underserved.",
  },
  {
    slug: "triageai",
    name: "TriageAI",
    category: "Software",
    oneLiner: "AI ticket-triage and auto-reply widget for small SaaS support inboxes.",
    scores: scores(7, 4, 8, 8, 8, 6, 6, 8, 8, 7),
    isPremium: true,
    teardownMd: "Pro teardown: full competitor map (Intercom Fin, Forethought) and the underserved segment they've priced out.",
  },
  {
    slug: "keyforge",
    name: "KeyForge",
    category: "Dev Tools",
    oneLiner: "License-key and feature-flag management API for solo SaaS founders.",
    scores: scores(5, 6, 9, 9, 8, 6, 7, 5, 8, 7),
    isPremium: true,
    teardownMd: "Pro teardown: pairs naturally with Foundry Kit as an upsell — full build spec included for Pro subscribers.",
  },
  {
    slug: "founder-vault",
    name: "Founder Vault",
    category: "Digital Product",
    oneLiner: "Notion + Excel template pack: launch checklist, finance model, roadmap.",
    scores: scores(6, 4, 9, 7, 9, 3, 9, 6, 8, 9),
    isPremium: true,
    teardownMd: "Pro teardown: low MRR ceiling on its own, but a strong lead-magnet / bundle candidate inside the Vault Pro tier.",
  },
  {
    slug: "outreach-pilot",
    name: "Outreach Pilot",
    category: "Software",
    oneLiner: "Chrome extension: AI personalizer for LinkedIn/X outbound messages.",
    scores: scores(7, 3, 8, 8, 7, 5, 7, 7, 7, 8),
    isPremium: true,
    teardownMd: "Pro teardown: crowded extension category — full differentiation angle and platform-policy risk notes included.",
  },
  {
    slug: "prompt-exchange",
    name: "Prompt Exchange",
    category: "Marketplace",
    oneLiner: "Vertical prompt-pack marketplace for legal, real estate, and e-commerce.",
    scores: scores(5, 4, 8, 7, 8, 4, 8, 7, 8, 8),
    isPremium: true,
    teardownMd: "Pro teardown: marketplace cold-start problem and the specific vertical with the best early supply/demand balance.",
  },
  {
    slug: "signal-reel",
    name: "Signal Reel",
    category: "Media",
    oneLiner: "Faceless YouTube/Shorts channel repurposing SaaS-building content.",
    scores: scores(6, 3, 7, 6, 8, 4, 7, 7, 8, 7),
    isPremium: true,
    teardownMd: "Pro teardown: content supply strategy and repurposing pipeline from long-form to shorts.",
  },
  {
    slug: "bench-community",
    name: "Bench",
    category: "Community",
    oneLiner: "Paid Discord/community for indie SaaS founders with tools and accountability.",
    scores: scores(5, 4, 6, 5, 8, 5, 8, 4, 8, 8),
    isPremium: true,
    teardownMd: "Pro teardown: retention mechanics that keep a paid community above 5% monthly churn.",
  },
  {
    slug: "pixelstock-ai",
    name: "PixelStock AI",
    category: "Licensing",
    oneLiner: "AI-generated icon and illustration pack licensing marketplace.",
    scores: scores(4, 2, 8, 7, 6, 3, 8, 7, 8, 8),
    isPremium: true,
    teardownMd: "Pro teardown: race-to-the-bottom pricing risk and the one differentiation angle that survives it.",
  },
  {
    slug: "agencyos",
    name: "AgencyOS",
    category: "B2B Service",
    oneLiner: "AI automation agency for local businesses: real estate, dealerships.",
    scores: scores(7, 3, 3, 4, 6, 5, 6, 7, 4, 7),
    isPremium: true,
    teardownMd: "Pro teardown: why service-heavy models cap scalability, and the productization path that fixes it.",
  },
  {
    slug: "leadforge",
    name: "LeadForge",
    category: "B2B Service",
    oneLiner: "AI scraping + outreach lead-gen-as-a-service for a single niche (e.g. dental).",
    scores: scores(6, 4, 4, 6, 6, 6, 6, 7, 5, 7),
    isPremium: true,
    teardownMd: "Pro teardown: niche selection framework and compliance notes on scraping/outreach.",
  },
  {
    slug: "micro-directory",
    name: "Micro Directory",
    category: "Marketplace",
    oneLiner: "Directory/marketplace of small micro-SaaS apps for niche workflows.",
    scores: scores(4, 2, 7, 6, 7, 3, 8, 5, 7, 8),
    isPremium: true,
    teardownMd: "Pro teardown: why generic directories struggle and the vertical-specific twist that could work.",
  },
  {
    slug: "datamint",
    name: "DataMint",
    category: "Marketplace",
    oneLiner: "Niche AI training-dataset marketplace for underserved verticals.",
    scores: scores(5, 5, 7, 5, 7, 4, 5, 6, 7, 5),
    isPremium: true,
    teardownMd: "Pro teardown: data-licensing legal considerations and the highest-demand underserved verticals right now.",
  },
  {
    slug: "printwave",
    name: "PrintWave",
    category: "B2B Service",
    oneLiner: "Print-on-demand niche merch store.",
    scores: scores(4, 2, 6, 6, 4, 2, 9, 4, 6, 9),
    isPremium: true,
    teardownMd: "Pro teardown: why this scored lowest in the database, and the one niche angle that would change that.",
  },
];
