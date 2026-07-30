import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getSessionEmail } from "@/lib/legal/admin";
import { writeLegalAuditLog } from "@/lib/legal/audit";
import { attemptSafeAutoDelete, buildUserDataExport } from "@/lib/legal/data-export";
import { clientIp, rateLimit } from "@/lib/rate-limit";
import {
  assertSameOrigin,
  readJsonLimited,
  requireJsonContentType,
  securityLog,
  stripControlChars,
} from "@/lib/secure";

const bodySchema = z.object({
  type: z.enum([
    "ACCESS",
    "CORRECT",
    "DELETE",
    "EXPORT",
    "WITHDRAW_CONSENT",
    "COMMUNICATION_PREFS",
  ]),
  email: z.string().email().max(254),
  details: z.string().max(2000).optional(),
});

export async function POST(req: NextRequest) {
  if (!assertSameOrigin(req)) {
    securityLog("legal_rights_origin_blocked", { ip: clientIp(req) });
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  if (!requireJsonContentType(req)) {
    return NextResponse.json({ error: "Unsupported media type" }, { status: 415 });
  }

  const ip = clientIp(req);
  const limited = rateLimit({ key: `legal-rights:${ip}`, limit: 6, windowMs: 60_000 });
  if (!limited.ok) {
    securityLog("legal_rights_rate_limited", { ip });
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const body = await readJsonLimited(req, 8_192);
  if (!body.ok) {
    return NextResponse.json({ error: body.error }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(body.data);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const email = parsed.data.email.toLowerCase().trim();
  const sessionEmail = await getSessionEmail();
  const isOwner = Boolean(sessionEmail && sessionEmail === email);

  // Email-level rate limit
  const emailLimit = rateLimit({
    key: `legal-rights-email:${email}`,
    limit: 8,
    windowMs: 60 * 60_000,
  });
  if (!emailLimit.ok) {
    return NextResponse.json({ error: "Too many requests for this email" }, { status: 429 });
  }

  const details = parsed.data.details
    ? stripControlChars(parsed.data.details).slice(0, 2000)
    : null;

  let status: "RECEIVED" | "COMPLETED" | "NEEDS_OPERATOR" = "RECEIVED";
  let resultJson: Prisma.InputJsonValue | undefined;
  let note =
    "Request recorded. An operator may follow up if verification or processor action is required.";
  let exportPayload: unknown = undefined;

  if (parsed.data.type === "EXPORT") {
    if (!isOwner) {
      await prisma.dataRightsRequest.create({
        data: {
          type: "EXPORT",
          status: "RECEIVED",
          email,
          details,
        },
      });
      await writeLegalAuditLog({
        action: "data_rights_export_queued",
        actorEmail: sessionEmail,
        subjectEmail: email,
        detail: { authenticated: false },
        ip,
      });
      return NextResponse.json({
        ok: true,
        note: "Export queued. Sign in with this email to download immediately, or wait for operator verification.",
      });
    }

    exportPayload = await buildUserDataExport(email);
    resultJson = { exported: true };
    status = "COMPLETED";
    note = "Export generated for authenticated owner. Limitations are listed inside the JSON.";
  }

  if (parsed.data.type === "DELETE") {
    if (!isOwner) {
      status = "RECEIVED";
      note =
        "Deletion request queued pending verification. Sign in with this email for faster automated steps.";
    } else {
      const outcome = await attemptSafeAutoDelete(email);
      resultJson = outcome as unknown as Prisma.InputJsonValue;
      status = outcome.needsOperator.length > 0 ? "NEEDS_OPERATOR" : "COMPLETED";
      note =
        "Partial automated deletion applied where safe. Operator must complete Supabase/payment/email processor erasure. This is not a claim of full cross-processor erasure.";
    }
  }

  if (parsed.data.type === "ACCESS" && isOwner) {
    exportPayload = await buildUserDataExport(email);
    resultJson = { access: true };
    status = "COMPLETED";
    note = "Access export generated for authenticated owner.";
  }

  if (parsed.data.type === "WITHDRAW_CONSENT") {
    status = "COMPLETED";
    note =
      "Recorded. Also update /legal/preferences (localStorage). Optional AI processing will respect the preference center when you save.";
  }

  const row = await prisma.dataRightsRequest.create({
    data: {
      type: parsed.data.type,
      status,
      email,
      userId: isOwner ? sessionEmail : null,
      details,
      resultJson,
      completedAt: status === "COMPLETED" ? new Date() : null,
    },
  });

  await writeLegalAuditLog({
    action: "data_rights_request",
    actorEmail: sessionEmail,
    subjectEmail: email,
    detail: {
      type: parsed.data.type,
      status,
      id: row.id,
      authenticated: isOwner,
    },
    ip,
  });

  return NextResponse.json({
    ok: true,
    id: row.id,
    note,
    ...(exportPayload ? { export: exportPayload } : {}),
  });
}
