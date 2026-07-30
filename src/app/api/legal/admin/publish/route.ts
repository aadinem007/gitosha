import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireLegalAdmin } from "@/lib/legal/admin";
import { buildDefaultLegalConfig } from "@/lib/legal/config";
import { publishLegalConfig } from "@/lib/legal/publish";
import { getLegalConfig } from "@/lib/legal/resolve";
import { clientIp, rateLimit } from "@/lib/rate-limit";
import {
  assertSameOrigin,
  readJsonLimited,
  requireJsonContentType,
  securityLog,
} from "@/lib/secure";
import type { LegalConfig } from "@/lib/legal/types";

export async function GET() {
  const admin = await requireLegalAdmin();
  if (!admin.ok) {
    return NextResponse.json({ error: admin.error }, { status: admin.status });
  }
  const config = await getLegalConfig();
  const defaults = buildDefaultLegalConfig();
  return NextResponse.json({ config, defaultsHint: { processors: defaults.processors } });
}

const publishSchema = z.object({
  changeSummary: z.string().min(8).max(2000),
  effectiveDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  version: z.string().min(1).max(40).optional(),
  business: z
    .object({
      entityName: z.string().max(200).optional(),
      contactEmail: z.string().max(254).optional(),
      privacyEmail: z.string().max(254).optional(),
      dpoEmail: z.string().max(254).nullable().optional(),
      address: z.string().max(500).optional(),
      governingLaw: z.string().max(120).optional(),
      jurisdictionNote: z.string().max(500).optional(),
    })
    .optional(),
  regionIds: z.array(z.string().max(40)).max(20).optional(),
});

export async function POST(req: NextRequest) {
  const admin = await requireLegalAdmin();
  if (!admin.ok) {
    securityLog("legal_admin_publish_denied", { ip: clientIp(req) });
    return NextResponse.json({ error: admin.error }, { status: admin.status });
  }

  if (!assertSameOrigin(req)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  if (!requireJsonContentType(req)) {
    return NextResponse.json({ error: "Unsupported media type" }, { status: 415 });
  }

  const limited = rateLimit({
    key: `legal-admin-publish:${admin.email}`,
    limit: 10,
    windowMs: 60_000,
  });
  if (!limited.ok) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const body = await readJsonLimited(req, 64_000);
  if (!body.ok) {
    return NextResponse.json({ error: body.error }, { status: 400 });
  }

  const parsed = publishSchema.safeParse(body.data);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid publish payload" }, { status: 400 });
  }

  const current = await getLegalConfig();
  const next: LegalConfig = {
    ...current,
    version: parsed.data.version ?? bumpPatch(current.version),
    business: {
      ...current.business,
      ...(parsed.data.business ?? {}),
      entityNameConfigured: Boolean(
        parsed.data.business?.entityName?.trim() || current.business.entityNameConfigured
      ),
      addressConfigured: Boolean(
        parsed.data.business?.address?.trim() &&
          !parsed.data.business.address.includes("Configuration pending")
      ),
    },
    regions: current.regions.map((r) => ({
      ...r,
      enabled: parsed.data.regionIds
        ? parsed.data.regionIds.includes(r.id)
        : r.enabled,
    })),
  };

  const result = await publishLegalConfig({
    config: next,
    changeSummary: parsed.data.changeSummary,
    publishedBy: admin.email,
    effectiveDate: parsed.data.effectiveDate,
  });

  return NextResponse.json({ ok: true, ...result });
}

function bumpPatch(version: string): string {
  const parts = version.split(".").map((n) => Number(n));
  if (parts.length === 3 && parts.every((n) => Number.isFinite(n))) {
    return `${parts[0]}.${parts[1]}.${parts[2]! + 1}`;
  }
  return `${version}.1`;
}
