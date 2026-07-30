import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSessionEmail } from "@/lib/legal/admin";
import { writeLegalAuditLog } from "@/lib/legal/audit";
import { getLegalConfig } from "@/lib/legal/resolve";
import { clientIp, rateLimit } from "@/lib/rate-limit";
import {
  assertSameOrigin,
  readJsonLimited,
  requireJsonContentType,
  securityLog,
  stripControlChars,
} from "@/lib/secure";

const prefsSchema = z.object({
  necessary: z.literal(true),
  analytics: z.boolean(),
  marketing: z.boolean(),
  personalization: z.boolean(),
  ai_processing: z.boolean(),
  version: z.string().max(40),
  updatedAt: z.string().max(40),
});

const bodySchema = z.object({
  preferences: prefsSchema,
  source: z.enum(["banner", "preferences", "rights"]).default("banner"),
  anonymousId: z.string().max(80).optional(),
});

export async function POST(req: NextRequest) {
  if (!assertSameOrigin(req)) {
    securityLog("legal_consent_origin_blocked", { ip: clientIp(req) });
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  if (!requireJsonContentType(req)) {
    return NextResponse.json({ error: "Unsupported media type" }, { status: 415 });
  }

  const limited = rateLimit({
    key: `legal-consent:${clientIp(req)}`,
    limit: 20,
    windowMs: 60_000,
  });
  if (!limited.ok) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const body = await readJsonLimited(req, 8_192);
  if (!body.ok) {
    return NextResponse.json({ error: body.error }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(body.data);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid preferences" }, { status: 400 });
  }

  const config = await getLegalConfig();
  const email = await getSessionEmail();
  const prefs = parsed.data.preferences;

  // Drop categories that aren't enabled so clients can't invent marketing consent theater
  const enabledIds = new Set(config.cookies.filter((c) => c.enabled).map((c) => c.id));
  const sanitized = {
    necessary: true as const,
    analytics: enabledIds.has("analytics") ? prefs.analytics : false,
    marketing: enabledIds.has("marketing") ? prefs.marketing : false,
    personalization: enabledIds.has("personalization") ? prefs.personalization : false,
    ai_processing: enabledIds.has("ai_processing") ? prefs.ai_processing : false,
    version: prefs.version.slice(0, 40),
    updatedAt: prefs.updatedAt.slice(0, 40),
  };

  try {
    if (email) {
      const existing = await prisma.consentRecord.findFirst({
        where: { email },
        orderBy: { updatedAt: "desc" },
      });
      if (existing) {
        await prisma.consentRecord.update({
          where: { id: existing.id },
          data: {
            preferences: sanitized,
            policyVersion: config.version,
            source: parsed.data.source,
          },
        });
      } else {
        await prisma.consentRecord.create({
          data: {
            email,
            preferences: sanitized,
            policyVersion: config.version,
            source: parsed.data.source,
            anonymousId: parsed.data.anonymousId
              ? stripControlChars(parsed.data.anonymousId).slice(0, 80)
              : null,
          },
        });
      }
    } else if (parsed.data.anonymousId) {
      const anon = stripControlChars(parsed.data.anonymousId).slice(0, 80);
      const existing = await prisma.consentRecord.findFirst({
        where: { anonymousId: anon },
        orderBy: { updatedAt: "desc" },
      });
      if (existing) {
        await prisma.consentRecord.update({
          where: { id: existing.id },
          data: {
            preferences: sanitized,
            policyVersion: config.version,
            source: parsed.data.source,
          },
        });
      } else {
        await prisma.consentRecord.create({
          data: {
            anonymousId: anon,
            preferences: sanitized,
            policyVersion: config.version,
            source: parsed.data.source,
          },
        });
      }
    }
    // Anonymous without id: localStorage-only is fine; no DB write

    await writeLegalAuditLog({
      action: "consent_change",
      actorEmail: email,
      subjectEmail: email,
      detail: {
        source: parsed.data.source,
        ai_processing: sanitized.ai_processing,
        version: sanitized.version,
      },
      ip: clientIp(req),
    });
  } catch {
    securityLog("legal_consent_db_error", { ip: clientIp(req) });
    // Still OK — client has localStorage
  }

  return NextResponse.json({ ok: true, preferences: sanitized });
}
