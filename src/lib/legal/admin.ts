import { createSupabaseServerClient } from "@/lib/supabase/server";
import { securityLog } from "@/lib/secure";

function parseEmailList(raw: string | undefined): Set<string> {
  if (!raw) return new Set();
  return new Set(
    raw
      .split(",")
      .map((s) => s.trim().toLowerCase())
      .filter(Boolean)
  );
}

/** Deny-by-default: only emails in LEGAL_ADMIN_EMAILS or ADMIN_EMAILS. */
export function legalAdminEmailAllowlist(): Set<string> {
  const legal = parseEmailList(process.env.LEGAL_ADMIN_EMAILS);
  const admin = parseEmailList(process.env.ADMIN_EMAILS);
  return new Set([...legal, ...admin]);
}

export async function requireLegalAdmin(): Promise<
  { ok: true; email: string } | { ok: false; status: 401 | 403; error: string }
> {
  const allow = legalAdminEmailAllowlist();
  if (allow.size === 0) {
    securityLog("legal_admin_misconfigured", { reason: "empty_allowlist" });
    return { ok: false, status: 403, error: "Forbidden" };
  }

  try {
    const supabase = await createSupabaseServerClient();
    const { data } = await supabase.auth.getUser();
    const email = data.user?.email?.toLowerCase()?.trim();
    if (!email) {
      return { ok: false, status: 401, error: "Unauthorized" };
    }
    if (!allow.has(email)) {
      securityLog("legal_admin_denied", { reason: "email_not_allowlisted" });
      return { ok: false, status: 403, error: "Forbidden" };
    }
    return { ok: true, email };
  } catch {
    securityLog("legal_admin_auth_error", { reason: "supabase_failure" });
    return { ok: false, status: 401, error: "Unauthorized" };
  }
}

export async function getSessionEmail(): Promise<string | null> {
  try {
    const supabase = await createSupabaseServerClient();
    const { data } = await supabase.auth.getUser();
    return data.user?.email?.toLowerCase()?.trim() ?? null;
  } catch {
    return null;
  }
}
