import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { sendMagicLinkEmail, isResendConfigured } from "@/lib/email";
import { clientIp, rateLimit } from "@/lib/rate-limit";
import {
  assertSameOrigin,
  readJsonLimited,
  requireJsonContentType,
  safeRedirectPath,
  securityLog,
} from "@/lib/secure";
import { authCallbackUrl } from "@/lib/site";
import { createSupabaseAdminClient, isSupabaseAdminConfigured } from "@/lib/supabase/admin";

const bodySchema = z.object({
  email: z.string().email().max(254),
  next: z.string().max(200).optional(),
});

/**
 * Branded magic link via Resend + Supabase admin generateLink.
 * Avoids Supabase’s default “Supabase Auth” email chrome.
 * Falls back to { fallback: true } so the client can use signInWithOtp.
 */
export async function POST(req: NextRequest) {
  if (!assertSameOrigin(req)) {
    securityLog("magic_link_origin_blocked", { ip: clientIp(req) });
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  if (!requireJsonContentType(req)) {
    return NextResponse.json({ error: "Unsupported media type" }, { status: 415 });
  }

  const limited = rateLimit({
    key: `magic-link:${clientIp(req)}`,
    limit: 5,
    windowMs: 60_000,
  });
  if (!limited.ok) {
    securityLog("magic_link_ip_rate_limited", { ip: clientIp(req) });
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const body = await readJsonLimited(req, 8_192);
  if (!body.ok) {
    return NextResponse.json({ error: body.error }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(body.data);
  if (!parsed.success) {
    return NextResponse.json({ error: "Enter a valid email" }, { status: 400 });
  }

  const email = parsed.data.email.toLowerCase();
  // Per-inbox cap — stops magic-link bombing a victim mailbox (independent of IP)
  const emailLimited = rateLimit({
    key: `magic-link-email:${email}`,
    limit: 3,
    windowMs: 60 * 60_000,
  });
  if (!emailLimited.ok) {
    securityLog("magic_link_email_rate_limited", { ip: clientIp(req) });
    // Same shape as success — no email enumeration
    return NextResponse.json({ ok: true, branded: true });
  }

  const next = safeRedirectPath(parsed.data.next, "/research");
  const redirectTo = authCallbackUrl(next);

  if (!isSupabaseAdminConfigured() || !isResendConfigured()) {
    securityLog("magic_link_fallback_otp", { reason: "missing_admin_or_resend" });
    return NextResponse.json({ ok: true, fallback: true });
  }

  try {
    const admin = createSupabaseAdminClient();
    const { data, error } = await admin.auth.admin.generateLink({
      type: "magiclink",
      email,
      options: { redirectTo },
    });

    if (error || !data?.properties?.action_link) {
      securityLog("magic_link_generate_failed", {
        message: (error?.message ?? "no_link").slice(0, 120),
      });
      return NextResponse.json({ ok: true, fallback: true });
    }

    const sent = await sendMagicLinkEmail(email, data.properties.action_link);
    if (!sent) {
      return NextResponse.json({ ok: true, fallback: true });
    }

    return NextResponse.json({ ok: true, branded: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "magic_link_failed";
    securityLog("magic_link_error", { message: message.slice(0, 120) });
    return NextResponse.json({ ok: true, fallback: true });
  }
}
