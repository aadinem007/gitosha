export type ChatLink = { label: string; href: string };

export type ChatReply = {
  text: string;
  links?: ChatLink[];
  suggestions?: string[];
};

export type KnowledgeEntry = {
  id: string;
  keywords: string[];
  reply: ChatReply;
};

export const CHAT_GREETING: ChatReply = {
  text: "Hey — I'm Gita. Tell me what you want: cheaper Operator access, Foundry download after pay, or why studios pick Agency at $249. I'll be blunt.",
  suggestions: [
    "Why pay $249 for Agency?",
    "Show pricing",
    "How do I get Foundry after paying?",
    "What's free?",
  ],
};

export const KNOWLEDGE: KnowledgeEntry[] = [
  {
    id: "what",
    keywords: [
      "what is",
      "gitosha",
      // Internal alias: old product name — not shown in user-facing copy
      "shipyard",
      "about",
      "about us",
      "brand story",
      "who are you",
      "name mean",
      "why gitosha",
      "gita",
      "what do you",
      "explain",
      "overview",
    ],
    reply: {
      text: "Gitosha helps builders know what to build — then ship it. The name is the path: G (guide / Vault), To (idea → build), Sha (ship / Foundry). Gita is the on-site guide. Honest scores. Instant kit download after payment.",
      links: [
        { label: "About / brand story", href: "/about" },
        { label: "See the method", href: "/method" },
        { label: "Pricing", href: "/pricing" },
      ],
      suggestions: ["Show pricing", "What is the Vault?", "What is Foundry?"],
    },
  },
  {
    id: "vault",
    keywords: [
      "vault",
      "research",
      "score",
      "scoring",
      "operator",
      "scout",
      "studio",
      "teardown",
      "idea",
      "opportunities",
    ],
    reply: {
      text: "The Vault is our scored opportunity database. Scout (free) shows public research. Operator ($15/mo launch) unlocks full teardowns, kill criteria, anti-portfolio, financial sketches, competitor maps, 14-day launch checklists, CSV export, and 15% off Foundry. Studio ($49/mo) adds 5 seats + private niche scoring.",
      links: [
        { label: "Vault product page", href: "/vault" },
        { label: "Operator pricing", href: "/pricing" },
        { label: "Sign in to research", href: "/login?next=/research" },
      ],
      suggestions: ["How do scores work?", "Foundry vs Vault", "Show pricing"],
    },
  },
  {
    id: "method",
    keywords: ["method", "dimension", "rubric", "how score", "100", "honest"],
    reply: {
      text: "We score every idea on 10 dimensions out of 100 — demand, competition, scalability, automation, margin, MRR potential, barrier, AI leverage, global reach, time to launch. We publish weak scores too. Round one: none of 18 ideas cleared 90/100 honestly.",
      links: [{ label: "Full method", href: "/method" }],
      suggestions: ["What is the Vault?", "Show pricing"],
    },
  },
  {
    id: "foundry",
    keywords: [
      "foundry",
      "kit",
      "scaffold",
      "starter",
      "code",
      "download",
      "zip",
      "solo",
      "agency",
      "99",
      "$99",
      "249",
      "$249",
    ],
    reply: {
      text: "Foundry is a one-time SaaS starter kit (Next.js, auth, Prisma, checkout, webhooks, deploy docs — same patterns Gitosha runs). Download the zip instantly from License after pay. Solo $99 (one product + 90 days Operator). Agency $249 (unlimited clients + white-label + templates + 1yr Studio Vault). Launch Bundle $149 = Solo + 1 year Operator.",
      links: [
        { label: "Foundry story", href: "/foundry" },
        { label: "Buy Foundry", href: "/foundry-kit" },
        { label: "License / download", href: "/license" },
      ],
      suggestions: [
        "How do I download after payment?",
        "Solo vs Agency",
        "Show pricing",
      ],
    },
  },
  {
    id: "solo-vs-agency",
    keywords: ["difference", "solo vs", "vs agency", "agency vs", "which plan", "compare", "249", "$249", "worth"],
    reply: {
      text: "Solo ($99) = one product you own. Agency ($249) = unlimited client builds, white-label, handoff/invoice/proposal templates, priority support, and 1 year Studio Vault. If you ship for clients, Agency usually pays for itself by the second engagement — same zip, wider rights.",
      links: [
        { label: "Compare table", href: "/foundry#compare" },
        { label: "Buy Foundry", href: "/foundry-kit" },
        { label: "Pricing", href: "/pricing" },
      ],
      suggestions: ["How do I get Foundry after paying?", "Show pricing", "What's free?"],
    },
  },
  {
    id: "delivery",
    keywords: [
      "after paying",
      "after payment",
      "how do i get",
      "receive",
      "deliver",
      "license",
      "gito-",
      "ship-",
      "download",
      "where is my",
    ],
    reply: {
      text: "Right after payment you'll see your license key (GITO-XXXX-…). Open License, enter the same email + key, then Download Foundry zip. You can re-download anytime. Vault access: sign in with the same email you paid with.",
      links: [
        { label: "License portal", href: "/license" },
        { label: "Sign in", href: "/login" },
      ],
      suggestions: ["What is inside Foundry?", "Payment methods", "Contact support"],
    },
  },
  {
    id: "pricing",
    keywords: ["price", "pricing", "cost", "how much", "dollar", "usd", "$", "cheap", "plan"],
    reply: {
      text: "Vault: Scout free · Operator $15/mo launch (then $19) · Operator Annual $149/yr · Studio $49/mo. Foundry: Solo $99 · Agency $249 · Launch Bundle $149. Prices in USD; cards accepted worldwide.",
      links: [{ label: "Full pricing", href: "/pricing" }],
      suggestions: ["Operator details", "Foundry Solo details", "Launch Bundle"],
    },
  },
  {
    id: "payment",
    keywords: ["stripe", "razorpay", "upi", "pay", "payment", "card", "checkout", "refund", "test"],
    reply: {
      text: "Checkout runs through the site payment provider. List prices are USD; amounts are set server-side. After a successful payment, Foundry buyers get a license key on-screen; Vault buyers sign in with the same email. For billing issues, use Contact in the footer.",
      links: [
        { label: "Pricing", href: "/pricing" },
        { label: "Contact", href: "mailto:aaditya.shah8005@gmail.com" },
      ],
      suggestions: ["How do I download after payment?", "Show pricing"],
    },
  },
  {
    id: "bundle",
    keywords: ["bundle", "149", "$149", "launch bundle", "combo"],
    reply: {
      text: "Launch Bundle ($149) is Foundry Solo + 12 months Operator Vault in one checkout — usually the best value if you want research and the scaffold together.",
      links: [{ label: "Buy on Pricing", href: "/pricing" }],
      suggestions: ["How do I download after payment?", "Solo vs Agency"],
    },
  },
  {
    id: "support",
    keywords: ["support", "help", "contact", "human", "email", "stuck", "problem", "issue"],
    reply: {
      text: "I can answer product questions here. For account or payment issues, email aaditya.shah8005@gmail.com with your purchase email and license key (if any). Agency buyers get priority replies.",
      links: [{ label: "Email support", href: "mailto:aaditya.shah8005@gmail.com" }],
      suggestions: ["How do I download after payment?", "Show pricing"],
    },
  },
  {
    id: "waitlist",
    keywords: ["waitlist", "newsletter", "weekly", "free issue", "email list"],
    reply: {
      text: "Join the free weekly issue from the homepage — top scored opportunities, no spam pitch walls. Paying Operator unlocks the full Vault anytime.",
      links: [{ label: "Homepage", href: "/" }],
      suggestions: ["What is the Vault?", "Show pricing"],
    },
  },
  {
    id: "free",
    keywords: ["free", "scout", "$0", "no card", "what's free", "whats free"],
    reply: {
      text: "Scout is free forever — weekly top-3, public method, teardown archive. No card. Operator is $15/mo launch for the full vault. Foundry is paid one-time with instant zip download.",
      links: [
        { label: "Start on homepage", href: "/" },
        { label: "Pricing", href: "/pricing" },
      ],
      suggestions: ["Show pricing", "Why pay $249 for Agency?"],
    },
  },
  {
    id: "legal",
    keywords: [
      "terms",
      "privacy",
      "refund",
      "policy",
      "legal",
      "cancel",
      "money back",
      "return",
    ],
    reply: {
      text: "We publish Terms of Service, Privacy Policy, and Refund Policy on the site. Foundry is a digital download — refunds are limited after download (see Refund Policy). Vault has a short unused-access review window.",
      links: [
        { label: "Terms", href: "/terms" },
        { label: "Privacy", href: "/privacy" },
        { label: "Legal", href: "/legal" },
        { label: "Refunds", href: "/legal/refunds" },
      ],
      suggestions: ["How do I get Foundry after paying?", "Show pricing", "Contact support"],
    },
  },
];

export const CHAT_FALLBACK: ChatReply = {
  text: "I might have missed that. Try asking about pricing, Vault, Foundry downloads, Solo vs Agency, or payments — or tap a suggestion below.",
  links: [
    { label: "Pricing", href: "/pricing" },
    { label: "License", href: "/license" },
    { label: "Contact", href: "mailto:aaditya.shah8005@gmail.com" },
  ],
  suggestions: [
    "What is Gitosha?",
    "Show pricing",
    "How do I get Foundry after paying?",
    "Solo vs Agency",
  ],
};

export function matchKnowledge(message: string): ChatReply {
  const q = message.toLowerCase().trim();
  if (!q) return CHAT_GREETING;

  let best: { entry: KnowledgeEntry; score: number } | null = null;

  for (const entry of KNOWLEDGE) {
    let score = 0;
    for (const kw of entry.keywords) {
      if (q.includes(kw)) score += kw.length > 6 ? 3 : 2;
    }
    // Boost exact-ish topic hits
    if (entry.id === "pricing" && /\b(price|pricing|cost|\$|usd|dollar)\b/.test(q)) score += 4;
    if (entry.id === "foundry" && /\bfoundry\b/.test(q)) score += 4;
    if (entry.id === "vault" && /\bvault\b/.test(q)) score += 4;
    if (entry.id === "delivery" && /\b(download|license|paid|payment)\b/.test(q)) score += 3;
    if (entry.id === "solo-vs-agency" && /\b(agency|solo|249|\$249)\b/.test(q)) score += 4;
    if (entry.id === "legal" && /\b(refund|terms|privacy)\b/.test(q)) score += 4;

    if (score > 0 && (!best || score > best.score)) {
      best = { entry, score };
    }
  }

  if (!best || best.score < 2) return CHAT_FALLBACK;
  return best.entry.reply;
}
