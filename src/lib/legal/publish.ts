import { prisma } from "@/lib/prisma";
import { buildDefaultLegalConfig } from "@/lib/legal/config";
import type { LegalConfig } from "@/lib/legal/types";
import { writeLegalAuditLog } from "@/lib/legal/audit";
import { LEGAL_DOC_SLUGS } from "@/lib/legal/types";
import type { Prisma } from "@prisma/client";

export async function publishLegalConfig(input: {
  config: LegalConfig;
  changeSummary: string;
  publishedBy: string;
  effectiveDate?: string;
}): Promise<{ configId: string; version: string }> {
  const effective = input.effectiveDate
    ? new Date(`${input.effectiveDate}T00:00:00.000Z`)
    : new Date(`${input.config.effectiveDate}T00:00:00.000Z`);

  const stamped: LegalConfig = {
    ...input.config,
    lastUpdated: new Date().toISOString().slice(0, 10),
    effectiveDate: effective.toISOString().slice(0, 10),
    humanReviewRequired: true,
    notLegalAdvice: true,
    shipping: {
      physicalGoods: false,
      delivery: buildDefaultLegalConfig().shipping.delivery,
    },
  };

  await prisma.legalConfig.updateMany({
    where: { isActive: true },
    data: { isActive: false },
  });

  const row = await prisma.legalConfig.create({
    data: {
      version: stamped.version,
      effectiveDate: effective,
      isActive: true,
      changeSummary: input.changeSummary.slice(0, 2000),
      configJson: stamped as unknown as Prisma.InputJsonValue,
      publishedBy: input.publishedBy,
    },
  });

  for (const slug of LEGAL_DOC_SLUGS) {
    await prisma.legalDocumentVersion.create({
      data: {
        legalConfigId: row.id,
        slug,
        version: stamped.version,
        effectiveDate: effective,
        changeSummary: input.changeSummary.slice(0, 2000),
        contentJson: {
          slug,
          version: stamped.version,
          effectiveDate: stamped.effectiveDate,
          productName: stamped.productName,
        },
        createdBy: input.publishedBy,
      },
    });
  }

  await writeLegalAuditLog({
    action: "legal_config_publish",
    actorEmail: input.publishedBy,
    detail: {
      version: stamped.version,
      configId: row.id,
      changeSummary: input.changeSummary.slice(0, 200),
    },
  });

  return { configId: row.id, version: stamped.version };
}
