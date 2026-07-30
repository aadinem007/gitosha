import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { clientIp, rateLimit } from "@/lib/rate-limit";
import { assertSameOrigin, securityLog } from "@/lib/secure";

/** Clears HttpOnly Supabase session cookies (browser cannot delete them). */
export async function POST(req: NextRequest) {
  if (!assertSameOrigin(req)) {
    securityLog("signout_origin_blocked", { ip: clientIp(req) });
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const limited = rateLimit({
    key: `signout:${clientIp(req)}`,
    limit: 20,
    windowMs: 60_000,
  });
  if (!limited.ok) {
    securityLog("signout_rate_limited", { ip: clientIp(req) });
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  try {
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase.auth.signOut();
    if (error) {
      securityLog("signout_failed", {
        ip: clientIp(req),
        message: error.message.slice(0, 120),
      });
    } else {
      securityLog("signout_ok", { ip: clientIp(req) });
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : "signout_error";
    securityLog("signout_error", { ip: clientIp(req), message: message.slice(0, 120) });
  }

  return NextResponse.json({ ok: true });
}
