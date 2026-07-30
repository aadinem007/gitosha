import { prisma } from "@/lib/prisma";
import { buildDefaultLegalConfig } from "@/lib/legal/config";
import type { LegalConfig } from "@/lib/legal/types";

/**
 * Active legal config: published DB blob if present, else file/env defaults.
 * Fail open to defaults if DB is unreachable so public legal pages still render.
 */
export async function getLegalConfig(): Promise<LegalConfig> {
  const defaults = buildDefaultLegalConfig();
  try {
    const row = await prisma.legalConfig.findFirst({
      where: { isActive: true },
      orderBy: { publishedAt: "desc" },
    });
    if (!row?.configJson) return defaults;
    const parsed = row.configJson as unknown;
    if (!parsed || typeof parsed !== "object") return defaults;
    const fromDb = parsed as Partial<LegalConfig>;

    return {
      ...defaults,
      ...fromDb,
      business: { ...defaults.business, ...(fromDb.business ?? {}) },
      subscriptions: { ...defaults.subscriptions, ...(fromDb.subscriptions ?? {}) },
      children: { ...defaults.children, ...(fromDb.children ?? {}) },
      shipping: defaults.shipping,
      dmca: { ...defaults.dmca, ...(fromDb.dmca ?? {}) },
      accessibility: { ...defaults.accessibility, ...(fromDb.accessibility ?? {}) },
      humanReviewRequired: true,
      notLegalAdvice: true,
      // Live env wins for integrations so pages never lie
      processors: defaults.processors,
      cookies: defaults.cookies,
      ai: {
        chatWidgetName: defaults.ai.chatWidgetName,
        usesOptionalLlm: defaults.ai.usesOptionalLlm,
        llmProvider: defaults.ai.llmProvider,
        dataSent: defaults.ai.dataSent,
        disclosure: fromDb.ai?.disclosure ?? defaults.ai.disclosure,
      },
      version: fromDb.version ?? defaults.version,
      effectiveDate: fromDb.effectiveDate ?? defaults.effectiveDate,
      lastUpdated: fromDb.lastUpdated ?? defaults.lastUpdated,
      refunds: fromDb.refunds ?? defaults.refunds,
      retention: fromDb.retention ?? defaults.retention,
      regions: fromDb.regions ?? defaults.regions,
      productName: fromDb.productName ?? defaults.productName,
    };
  } catch {
    return defaults;
  }
}
