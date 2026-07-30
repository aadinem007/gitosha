/** Structured legal configuration — generated from real product integrations. */

export type CookieCategoryId =
  | "necessary"
  | "analytics"
  | "marketing"
  | "personalization"
  | "ai_processing";

export type JurisdictionId =
  | "IN_DPDP"
  | "GDPR"
  | "UK_GDPR"
  | "CPRA"
  | "LGPD"
  | "PIPEDA"
  | "AU_PRIVACY";

export type DataRightsRequestType =
  | "ACCESS"
  | "CORRECT"
  | "DELETE"
  | "EXPORT"
  | "WITHDRAW_CONSENT"
  | "COMMUNICATION_PREFS";

export type ThirdPartyProcessor = {
  id: string;
  name: string;
  purpose: string;
  dataCategories: string[];
  policyUrl: string;
  /** false when optional and not currently configured */
  active: boolean;
  optional?: boolean;
};

export type CookieCategory = {
  id: CookieCategoryId;
  name: string;
  description: string;
  /** Always on; cannot be disabled */
  required: boolean;
  /** Only show in UI when true — do not invent unused categories */
  enabled: boolean;
  examples: string[];
};

export type RetentionRule = {
  id: string;
  dataCategory: string;
  period: string;
  notes: string;
  operatorConfigurable: boolean;
};

export type RefundRule = {
  product: "foundry" | "vault-subscription" | "vault-annual" | "bundle";
  title: string;
  summary: string;
  windowDays: number | null;
  notes: string[];
};

export type RegionNotice = {
  id: JurisdictionId;
  title: string;
  enabled: boolean;
  summary: string;
  rightsBullets: string[];
};

export type LegalConfig = {
  version: string;
  effectiveDate: string; // ISO date YYYY-MM-DD
  lastUpdated: string; // ISO date YYYY-MM-DD
  productName: string;
  business: {
    entityName: string;
    entityNameConfigured: boolean;
    productName: string;
    contactEmail: string;
    privacyEmail: string;
    dpoEmail: string | null;
    address: string;
    addressConfigured: boolean;
    governingLaw: string;
    jurisdictionNote: string;
  };
  refunds: RefundRule[];
  subscriptions: {
    cancelAnytime: boolean;
    accessThroughPaidPeriod: boolean;
    recurringPlans: string[];
    oneTimePlans: string[];
    notes: string[];
  };
  cookies: CookieCategory[];
  retention: RetentionRule[];
  processors: ThirdPartyProcessor[];
  ai: {
    chatWidgetName: string;
    usesOptionalLlm: boolean;
    llmProvider: string | null;
    disclosure: string;
    dataSent: string[];
  };
  children: {
    minAge: number;
    audience: string;
    statement: string;
  };
  shipping: {
    physicalGoods: false;
    delivery: string;
  };
  regions: RegionNotice[];
  dmca: {
    configured: boolean;
    agentEmail: string | null;
    notice: string;
  };
  accessibility: {
    statement: string;
    contactEmail: string;
  };
  humanReviewRequired: true;
  notLegalAdvice: true;
};

export type ConsentPreferences = {
  necessary: true;
  analytics: boolean;
  marketing: boolean;
  personalization: boolean;
  ai_processing: boolean;
  version: string;
  updatedAt: string;
};

export const LEGAL_DOC_SLUGS = [
  "privacy",
  "terms",
  "cookies",
  "refunds",
  "subscriptions",
  "acceptable-use",
  "data-retention",
  "data-deletion",
  "copyright",
  "dmca",
  "accessibility",
  "ai",
  "children",
] as const;

export type LegalDocSlug = (typeof LEGAL_DOC_SLUGS)[number];
