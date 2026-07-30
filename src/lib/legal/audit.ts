import { prisma } from "@/lib/prisma";
import { redactSecrets } from "@/lib/secure";

type AuditDetail = Record<string, string | number | boolean | null | undefined>;

/** Persist a legal audit event — never store secrets or full card data. */
export async function writeLegalAuditLog(input: {
  action: string;
  actorEmail?: string | null;
  subjectEmail?: string | null;
  detail?: AuditDetail;
  ip?: string | null;
}): Promise<void> {
  const safe: Record<string, string | number | boolean | null> = {};
  for (const [k, v] of Object.entries(input.detail ?? {})) {
    if (v === undefined) continue;
    if (typeof v === "string") {
      safe[k] = redactSecrets(v).slice(0, 500);
    } else {
      safe[k] = v;
    }
  }

  try {
    await prisma.legalAuditLog.create({
      data: {
        action: input.action.slice(0, 120),
        actorEmail: input.actorEmail?.slice(0, 254) ?? null,
        subjectEmail: input.subjectEmail?.slice(0, 254) ?? null,
        detailJson: safe,
        ip: input.ip?.slice(0, 64) ?? null,
      },
    });
  } catch {
    // Audit must not break primary flows
    console.info("[legal-audit-fallback]", input.action);
  }
}
