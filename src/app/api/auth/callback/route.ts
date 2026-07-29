import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { clientIp, rateLimit } from "@/lib/rate-limit";
import { safeRedirectPath, securityLog } from "@/lib/secure";

// Handles the Supabase magic-link redirect and exchanges the code for a session.
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = safeRedirectPath(searchParams.get("next"), "/vault");

  const limited = rateLimit({
    key: `auth-callback:${clientIp(request)}`,
    limit: 30,
    windowMs: 60_000,
  });
  if (!limited.ok) {
    securityLog("auth_callback_rate_limited", { ip: clientIp(request) });
    return NextResponse.redirect(`${origin}/login`);
  }

  if (!code) {
    securityLog("auth_callback_missing_code", { ip: clientIp(request) });
    return NextResponse.redirect(`${origin}/login`);
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) {
    securityLog("auth_callback_exchange_failed", {
      ip: clientIp(request),
      message: error.message.slice(0, 120),
    });
    return NextResponse.redirect(`${origin}/login?error=auth`);
  }

  return NextResponse.redirect(`${origin}${next}`);
}
