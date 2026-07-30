import { BRAND } from "@/lib/brand";
import { FOUNDRY_PLANS, VAULT_PLANS } from "@/lib/pricing";
import { getPaymentsProvider } from "@/lib/payments";
import { isLegalEmailConfigured, LEGAL_EMAIL_UNSET } from "@/lib/legal/email";
import type {
  ConsentPreferences,
  CookieCategory,
  LegalConfig,
  RegionNotice,
  ThirdPartyProcessor,
} from "@/lib/legal/types";

export { isLegalEmailConfigured, LEGAL_EMAIL_UNSET } from "@/lib/legal/email";

function envTrim(key: string): string | undefined {
  const v = process.env[key]?.trim();
  return v && v.length > 0 ? v : undefined;
}

function isStripeConfigured(): boolean {
  return Boolean(process.env.STRIPE_SECRET_KEY?.trim());
}

function isRazorpayConfigured(): boolean {
  return Boolean(process.env.RAZORPAY_KEY_ID?.trim() && process.env.RAZORPAY_KEY_SECRET?.trim());
}

function isResendConfigured(): boolean {
  return Boolean(process.env.RESEND_API_KEY?.trim());
}

function isOpenAiConfigured(): boolean {
  return Boolean(process.env.OPENAI_API_KEY?.trim());
}

function contactEmail(): string {
  return envTrim("LEGAL_CONTACT_EMAIL") ?? envTrim("LEGAL_PRIVACY_EMAIL") ?? LEGAL_EMAIL_UNSET;
}

function privacyEmail(): string {
  return envTrim("LEGAL_PRIVACY_EMAIL") ?? envTrim("LEGAL_CONTACT_EMAIL") ?? LEGAL_EMAIL_UNSET;
}

function buildProcessors(): ThirdPartyProcessor[] {
  const provider = getPaymentsProvider();
  const stripeOn = isStripeConfigured();
  const razorpayOn = isRazorpayConfigured();
  const openaiOn = isOpenAiConfigured();

  return [
    {
      id: "supabase",
      name: "Supabase",
      purpose: "Authentication (magic-link), session management, and Postgres database hosting.",
      dataCategories: ["email", "auth session tokens", "account metadata", "application database records"],
      policyUrl: "https://supabase.com/privacy",
      active: true,
    },
    {
      id: "vercel",
      name: "Vercel",
      purpose: "Website hosting, edge/network delivery, and standard server request logs.",
      dataCategories: ["IP address", "user agent", "request metadata", "deployment telemetry"],
      policyUrl: "https://vercel.com/legal/privacy-policy",
      active: true,
    },
    {
      id: "razorpay",
      name: "Razorpay",
      purpose: "Payment processing for checkout (default provider when configured).",
      dataCategories: ["email", "payment references", "order/subscription IDs", "billing metadata"],
      policyUrl: "https://razorpay.com/privacy/",
      active: razorpayOn || provider === "razorpay",
      optional: true,
    },
    {
      id: "stripe",
      name: "Stripe",
      purpose: "Optional alternate payment processing when PAYMENTS_PROVIDER=stripe.",
      dataCategories: ["email", "customer/subscription IDs", "checkout session IDs", "billing metadata"],
      policyUrl: "https://stripe.com/privacy",
      active: stripeOn && provider === "stripe",
      optional: true,
    },
    {
      id: "resend",
      name: "Resend",
      purpose: "Transactional email when configured (magic links, purchase/ops messages).",
      dataCategories: ["email address", "message content for transactional templates"],
      policyUrl: "https://resend.com/legal/privacy-policy",
      active: isResendConfigured(),
      optional: true,
    },
    {
      id: "openai",
      name: "OpenAI",
      purpose: `Optional LLM polish for the ${BRAND.chatName} chat widget when an AI provider is connected. Chat still works from grounded on-site knowledge without an external AI API.`,
      dataCategories: ["chat message text", "short conversation context sent for reply generation"],
      policyUrl: "https://openai.com/policies/privacy-policy",
      active: openaiOn,
      optional: true,
    },
  ];
}

function buildCookies(aiActive: boolean): CookieCategory[] {
  return [
    {
      id: "necessary",
      name: "Necessary",
      description:
        "Required for security, authentication, and basic site operation. Cannot be disabled.",
      required: true,
      enabled: true,
      examples: [
        "Supabase auth session cookies (HttpOnly, SameSite=Lax, Secure in production)",
        "Consent preference storage (localStorage / optional ConsentRecord when signed in)",
      ],
    },
    {
      id: "analytics",
      name: "Analytics",
      description: "Product analytics / measurement scripts.",
      required: false,
      enabled: false, // No first-party analytics product integrated today
      examples: [],
    },
    {
      id: "marketing",
      name: "Marketing",
      description: "Advertising or marketing pixels.",
      required: false,
      enabled: false, // Not used
      examples: [],
    },
    {
      id: "personalization",
      name: "Personalization",
      description: "Non-essential personalization profiles beyond account settings.",
      required: false,
      enabled: false, // Not used
      examples: [],
    },
    {
      id: "ai_processing",
      name: "AI processing",
      description: `Optional LLM processing for ${BRAND.chatName} chat replies when an AI provider is configured. Grounded FAQ replies may still work without this.`,
      required: false,
      enabled: aiActive,
      examples: aiActive
        ? ["Chat messages may be sent to OpenAI to generate a short reply"]
        : ["Category inactive in this environment"],
    },
  ];
}

function buildRegions(enabledCsv: string | undefined): RegionNotice[] {
  const enabled = new Set(
    (enabledCsv ?? "IN_DPDP")
      .split(",")
      .map((s) => s.trim().toUpperCase())
      .filter(Boolean)
  );

  const all: RegionNotice[] = [
    {
      id: "IN_DPDP",
      title: "India — Digital Personal Data Protection (informational)",
      enabled: enabled.has("IN_DPDP") || enabled.has("IN"),
      summary:
        "If you are in India, you may have rights regarding personal data under applicable Indian law, including the Digital Personal Data Protection Act framework as it applies over time.",
      rightsBullets: [
        "Request access to personal data we hold about you (subject to verification)",
        "Request correction of inaccurate personal data",
        "Request erasure where applicable, subject to legal/accounting retention",
        "Withdraw consent for optional processing where consent is the basis",
      ],
    },
    {
      id: "GDPR",
      title: "EEA — GDPR (informational)",
      enabled: enabled.has("GDPR") || enabled.has("EEA") || enabled.has("EU"),
      summary:
        "If you are in the EEA, GDPR may grant rights such as access, rectification, erasure, restriction, portability, and objection, depending on our role and legal basis.",
      rightsBullets: [
        "Access and copy of personal data",
        "Rectification and erasure (with exceptions)",
        "Restriction of processing / objection in certain cases",
        "Data portability where technically feasible for data you provided",
      ],
    },
    {
      id: "UK_GDPR",
      title: "United Kingdom — UK GDPR (informational)",
      enabled: enabled.has("UK_GDPR") || enabled.has("UK"),
      summary:
        "If you are in the UK, UK data protection law may provide rights similar to GDPR regarding your personal data.",
      rightsBullets: [
        "Access, correction, and erasure requests",
        "Objection / restriction in certain cases",
        "Complaint to the ICO where applicable",
      ],
    },
    {
      id: "CPRA",
      title: "California — CPRA/CCPA (informational)",
      enabled: enabled.has("CPRA") || enabled.has("CCPA") || enabled.has("CA"),
      summary:
        "If you are a California resident, you may have rights to know, delete, correct, and opt out of certain sharing, subject to exceptions. We do not sell personal information for money.",
      rightsBullets: [
        "Right to know / access categories of personal information",
        "Right to delete (with exceptions, e.g. transaction records)",
        "Right to correct inaccurate personal information",
        "Right to non-discrimination for exercising privacy rights",
      ],
    },
    {
      id: "LGPD",
      title: "Brazil — LGPD (informational)",
      enabled: enabled.has("LGPD") || enabled.has("BR"),
      summary:
        "If you are in Brazil, LGPD may provide rights of confirmation, access, correction, anonymization, portability, and deletion, subject to applicable exceptions.",
      rightsBullets: [
        "Confirmation of processing and access",
        "Correction of incomplete or outdated data",
        "Anonymization, blocking, or deletion where applicable",
      ],
    },
    {
      id: "PIPEDA",
      title: "Canada — PIPEDA (informational)",
      enabled: enabled.has("PIPEDA") || enabled.has("CA_PIPEDA") || enabled.has("CANADA"),
      summary:
        "If you are in Canada, PIPEDA and provincial laws may provide access and correction rights for personal information in our custody.",
      rightsBullets: [
        "Access to personal information upon request",
        "Correction of inaccurate information",
        "Challenging compliance with applicable principles",
      ],
    },
    {
      id: "AU_PRIVACY",
      title: "Australia — Privacy Act (informational)",
      enabled: enabled.has("AU_PRIVACY") || enabled.has("AU") || enabled.has("AUSTRALIA"),
      summary:
        "If you are in Australia, the Privacy Act and APPs may provide access and correction rights for personal information we hold.",
      rightsBullets: [
        "Access to personal information",
        "Correction of personal information",
        "Complaint pathways under applicable Australian privacy law",
      ],
    },
  ];

  return all;
}

/** File/env source of truth for legal page generation. DB may override after admin publish. */
export function buildDefaultLegalConfig(): LegalConfig {
  const entityName = envTrim("LEGAL_ENTITY_NAME");
  const address = envTrim("LEGAL_ADDRESS");
  const dpo = envTrim("LEGAL_DPO_EMAIL") ?? null;
  const dmcaEmail = envTrim("LEGAL_DMCA_EMAIL") ?? null;
  const openaiOn = isOpenAiConfigured();
  const contact = contactEmail();
  const privacy = privacyEmail();

  const recurring = VAULT_PLANS.filter((p) => p.mode === "subscription").map(
    (p) => `${p.name} (${p.id})`
  );
  const oneTime = [...VAULT_PLANS, ...FOUNDRY_PLANS]
    .filter((p) => p.mode === "payment")
    .map((p) => `${p.name} (${p.id})`);

  return {
    version: envTrim("LEGAL_POLICY_VERSION") ?? "1.0.0",
    effectiveDate: envTrim("LEGAL_EFFECTIVE_DATE") ?? "2026-07-30",
    lastUpdated: envTrim("LEGAL_LAST_UPDATED") ?? "2026-07-30",
    productName: BRAND.name,
    business: {
      entityName: entityName ?? BRAND.name,
      entityNameConfigured: Boolean(entityName),
      productName: BRAND.name,
      contactEmail: contact,
      privacyEmail: privacy,
      dpoEmail: dpo,
      address: address ?? "",
      addressConfigured: Boolean(address),
      governingLaw: envTrim("LEGAL_GOVERNING_LAW") ?? "India",
      jurisdictionNote:
        envTrim("LEGAL_JURISDICTION_NOTE") ??
        "Courts of competent jurisdiction in India, unless mandatory consumer law requires otherwise.",
    },
    refunds: [
      {
        product: "foundry",
        title: "Foundry (Solo, Agency) — digital download",
        summary:
          "Delivered immediately via the License portal after payment. No physical shipping.",
        windowDays: 7,
        notes: [
          "If you have not downloaded the zip, contact us within 7 days for a refund review.",
          "After a successful download, refunds are generally unavailable except where required by law or we confirm a technical failure blocking legitimate access despite valid payment.",
        ],
      },
      {
        product: "bundle",
        title: "Launch Bundle (Foundry + Vault access)",
        summary: "One-time digital purchase: Foundry zip + included Vault access period.",
        windowDays: 7,
        notes: [
          "Foundry download rules apply to the kit portion.",
          "Vault portion follows unused-access goodwill review within 7 days for first-time purchases.",
        ],
      },
      {
        product: "vault-subscription",
        title: "Vault subscriptions (Operator monthly, Studio)",
        summary: "Recurring digital research access when billing is active.",
        windowDays: 7,
        notes: [
          "Cancel future renewals anytime when recurring billing is active — access continues through the paid period.",
          "First-time Operator/Studio: if you have not meaningfully used premium Vault content, contact us within 7 days for a goodwill refund review.",
        ],
      },
      {
        product: "vault-annual",
        title: "Vault annual / prepaid (Operator Annual)",
        summary: "One-time or prepaid digital access for the stated period.",
        windowDays: 7,
        notes: [
          "Same 7-day window for unused access.",
          "After substantial use of premium teardowns/exports, refunds are discretionary.",
        ],
      },
    ],
    subscriptions: {
      cancelAnytime: true,
      accessThroughPaidPeriod: true,
      recurringPlans: recurring,
      oneTimePlans: oneTime,
      notes: [
        "Scout (vault-free) requires no payment and has nothing to cancel.",
        "List prices are USD; Razorpay may charge an INR equivalent when that provider is active.",
        "Operator launch pricing may change after the early-operator cap described on Pricing.",
      ],
    },
    cookies: buildCookies(openaiOn),
    retention: [
      {
        id: "account",
        dataCategory: "Account email / subscriber records",
        period: "While account is active + up to 24 months after last activity (operator-configurable)",
        notes: "Needed to deliver Vault access and support.",
        operatorConfigurable: true,
      },
      {
        id: "billing",
        dataCategory: "Purchase / payment references",
        period: "Up to 7 years or as required by tax/accounting rules (operator-configurable)",
        notes: "We do not store full card numbers; processors hold card data.",
        operatorConfigurable: true,
      },
      {
        id: "licenses",
        dataCategory: "Foundry license keys & download metadata",
        period: "While license is valid for re-download + retention needed for abuse prevention",
        notes: "Download count and timestamps retained for fair-use caps.",
        operatorConfigurable: true,
      },
      {
        id: "waitlist",
        dataCategory: "Scout / waitlist email (Subscriber FREE)",
        period: "Until unsubscribe/deletion request or operator purge",
        notes: "Waitlist joins upsert a FREE Subscriber row — no separate Waitlist table.",
        operatorConfigurable: true,
      },
      {
        id: "chat",
        dataCategory: "Chat messages",
        period: "Not persisted in app DB by default; ephemeral for reply generation / rate limiting",
        notes: "If OpenAI is used, their retention policies also apply to prompts sent.",
        operatorConfigurable: true,
      },
      {
        id: "logs",
        dataCategory: "Security / server logs",
        period: "Typically 30–90 days (hosting provider + operator policy)",
        notes: "Used for abuse prevention; avoid logging PII beyond what infrastructure emits.",
        operatorConfigurable: true,
      },
      {
        id: "consent",
        dataCategory: "Consent records & legal audit logs",
        period: "Up to 5 years or as needed to demonstrate compliance posture",
        notes: "No secrets in audit payloads.",
        operatorConfigurable: true,
      },
    ],
    processors: buildProcessors(),
    ai: {
      chatWidgetName: BRAND.chatName,
      usesOptionalLlm: openaiOn,
      llmProvider: openaiOn ? "OpenAI" : null,
      disclosure: openaiOn
        ? `${BRAND.chatName} answers product questions from grounded on-site knowledge. When an optional AI provider is connected, message text may be sent to OpenAI to polish a short reply. This is not a general-purpose AI assistant and is not a social network.`
        : `${BRAND.chatName} answers from grounded on-site knowledge. Chat replies are not sent to an external AI API in this environment.`,
      dataSent: openaiOn
        ? ["user chat message text", "limited recent chat context", "system grounding text"]
        : ["none to external AI — grounded matcher only"],
    },
    children: {
      minAge: 18,
      audience: "Adult operators and B2B builders deciding what software to ship",
      statement: `${BRAND.name} is intended for adults building businesses (operators, studios, agencies). We do not knowingly collect personal data from children under 18. If you believe a minor has provided data, contact us via the site support channels so we can delete it.`,
    },
    shipping: {
      physicalGoods: false,
      delivery:
        "All paid products are digital: Vault access via magic-link sign-in and/or Foundry zip via the License portal. There is no physical shipping. A Shipping Policy for goods does not apply.",
    },
    regions: buildRegions(envTrim("LEGAL_ENABLED_REGIONS")),
    dmca: {
      configured: Boolean(dmcaEmail),
      agentEmail: dmcaEmail,
      notice: dmcaEmail
        ? `Copyright notices may be sent to ${dmcaEmail}. Include the URL of the allegedly infringing material, your contact information, and a good-faith statement.`
        : "For copyright concerns, contact us via the site support channels or the privacy contact listed on this site. Include the URL of the allegedly infringing material, your contact information, and a good-faith statement.",
    },
    accessibility: {
      statement: `${BRAND.name} aims for accessible marketing and product pages (skip link, semantic landmarks, keyboard-reachable forms). We do not claim WCAG certification. Report barriers via the site support channels.`,
      contactEmail: privacy,
    },
    humanReviewRequired: true,
    notLegalAdvice: true,
  };
}

export function enabledCookieCategories(config: LegalConfig): CookieCategory[] {
  return config.cookies.filter((c) => c.enabled);
}

export function defaultConsentPreferences(config: LegalConfig): ConsentPreferences {
  const enabled = new Set(enabledCookieCategories(config).map((c) => c.id));
  return {
    necessary: true,
    analytics: false,
    marketing: false,
    personalization: false,
    ai_processing: enabled.has("ai_processing") ? false : false,
    version: config.version,
    updatedAt: new Date().toISOString(),
  };
}

export function regionDisclaimer(): string {
  return "These notices describe rights that may apply depending on your location and our configuration. This software does not constitute legal advice or a claim of certification.";
}

export function legalFooterDisclaimer(): string {
  return "Not legal advice. Policies are generated from this deployment's configuration and require human legal review before you rely on them as a compliance program.";
}

/** Operator-facing gaps for /admin/legal — not for public pages. */
export function legalConfigGaps(config: LegalConfig): string[] {
  const gaps: string[] = [];
  if (!config.business.entityNameConfigured) {
    gaps.push("LEGAL_ENTITY_NAME — legal entity name not set");
  }
  if (!config.business.addressConfigured) {
    gaps.push("LEGAL_ADDRESS — business address not set (do not invent one)");
  }
  if (!isLegalEmailConfigured(config.business.contactEmail)) {
    gaps.push("LEGAL_CONTACT_EMAIL — public contact email not set");
  }
  if (!isLegalEmailConfigured(config.business.privacyEmail)) {
    gaps.push("LEGAL_PRIVACY_EMAIL — privacy contact email not set");
  }
  if (!config.business.dpoEmail) {
    gaps.push("LEGAL_DPO_EMAIL — optional DPO email not set");
  }
  if (!config.dmca.configured) {
    gaps.push("LEGAL_DMCA_EMAIL — DMCA / copyright agent email not set");
  }
  if (!config.regions.some((r) => r.enabled)) {
    gaps.push("LEGAL_ENABLED_REGIONS — no regional notice modules enabled (e.g. IN_DPDP,GDPR,CPRA)");
  }
  return gaps;
}
