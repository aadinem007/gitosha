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
  text: "Hey — I'm Yardhand, Shipyard's guide. Ask about pricing, Vault research, Foundry downloads, or how payments work. I'll keep it straight.",
  suggestions: [
    "What is Shipyard?",
    "Show pricing",
    "How do I get Foundry after paying?",
    "What's the difference: Solo vs Agency?",
  ],
};

export const KNOWLEDGE: KnowledgeEntry[] = [
  {
    id: "what",
    keywords: [
      "what is",
      "shipyard",
      "about",
      "who are you",
      "what do you",
      "explain",
      "overview",
    ],
    reply: {
      text: "Shipyard helps builders decide what software business to build — then ship it. Two products: The Vault (scored opportunity research) and Foundry (a production SaaS starter kit with auth + Razorpay). Honest scores. Instant kit download after payment.",
      links: [
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
      text: "The Vault is our scored opportunity database. Scout (free) shows public research. Operator (₹999/mo launch) unlocks full teardowns, kill criteria, competitor maps, launch checklists, and CSV export. Studio (₹4,999/mo) adds seats + private niche scoring.",
      links: [
        { label: "Open Vault", href: "/vault" },
        { label: "Operator pricing", href: "/pricing" },
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
      "9999",
      "9,999",
      "29999",
      "29,999",
    ],
    reply: {
      text: "Foundry is a one-time SaaS starter kit (Next.js, auth, Prisma, Razorpay, deploy docs). After you pay, you download the zip instantly from the License page — no waiting on us. Solo ₹9,999 (one product). Agency ₹29,999 (unlimited clients + white-label + priority support). Launch Bundle ₹14,999 = Solo + 1 year Operator.",
      links: [
        { label: "Inspect Foundry", href: "/foundry-kit" },
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
    keywords: ["difference", "solo vs", "vs agency", "agency vs", "which plan", "compare"],
    reply: {
      text: "Same kit code. Solo = license for one commercial product. Agency = unlimited client projects, white-label rights, priority support, and 1 year of Studio Vault. Agency is not custom freelance work — it's the kit + broader rights + support.",
      links: [{ label: "Foundry plans", href: "/foundry-kit" }],
      suggestions: ["How do I get Foundry after paying?", "Show pricing"],
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
      "ship-",
      "download",
      "where is my",
    ],
    reply: {
      text: "Right after payment you'll see your license key (SHIP-XXXX-…). Open License, enter the same email + key, then Download Foundry zip. You can re-download anytime. Vault access: sign in with the same email you paid with.",
      links: [
        { label: "License portal", href: "/license" },
        { label: "Sign in", href: "/login" },
      ],
      suggestions: ["What is inside Foundry?", "Payment methods", "Contact support"],
    },
  },
  {
    id: "pricing",
    keywords: ["price", "pricing", "cost", "how much", "rupee", "₹", "cheap", "plan"],
    reply: {
      text: "Vault: Scout free · Operator ₹999/mo launch (then ₹1,499) · Operator Annual ₹9,999/yr · Studio ₹4,999/mo. Foundry: Solo ₹9,999 · Agency ₹29,999 · Launch Bundle ₹14,999. Pay with UPI, cards, or netbanking via Razorpay.",
      links: [{ label: "Full pricing", href: "/pricing" }],
      suggestions: ["Operator details", "Foundry Solo details", "Launch Bundle"],
    },
  },
  {
    id: "payment",
    keywords: ["razorpay", "upi", "pay", "payment", "card", "checkout", "refund", "test"],
    reply: {
      text: "Checkout runs on Razorpay (UPI / cards / netbanking). Amounts are set server-side. After a successful payment, Foundry buyers get a license key on-screen; Vault buyers sign in with the same email. For billing issues, use Contact in the footer.",
      links: [
        { label: "Pricing", href: "/pricing" },
        { label: "Contact", href: "mailto:aaditya.shah8005@gmail.com" },
      ],
      suggestions: ["How do I download after payment?", "Show pricing"],
    },
  },
  {
    id: "bundle",
    keywords: ["bundle", "14999", "14,999", "launch bundle", "combo"],
    reply: {
      text: "Launch Bundle (₹14,999) is Foundry Solo + 12 months Operator Vault in one checkout — usually the best value if you want research and the scaffold together.",
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
        { label: "Refunds", href: "/refund" },
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
    "What is Shipyard?",
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
    if (entry.id === "pricing" && /\b(price|pricing|cost|₹|rs\.?)\b/.test(q)) score += 4;
    if (entry.id === "foundry" && /\bfoundry\b/.test(q)) score += 4;
    if (entry.id === "vault" && /\bvault\b/.test(q)) score += 4;
    if (entry.id === "delivery" && /\b(download|license|paid|payment)\b/.test(q)) score += 3;

    if (score > 0 && (!best || score > best.score)) {
      best = { entry, score };
    }
  }

  if (!best || best.score < 2) return CHAT_FALLBACK;
  return best.entry.reply;
}
