import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/**
 * Edge WAF-ish layer (Next.js proxy — not middleware.ts).
 * Blocks scanners, probe paths, bad methods, oversized bodies, and bot UAs on mutating APIs.
 * Does not replace Cloudflare/WAF on a custom domain.
 */

const BLOCKED_PREFIXES = [
  "/.env",
  "/.git",
  "/.svn",
  "/.hg",
  "/.aws",
  "/.docker",
  "/.vscode",
  "/.idea",
  "/wp-admin",
  "/wp-login",
  "/wp-content",
  "/wp-includes",
  "/wordpress",
  "/phpmyadmin",
  "/pma",
  "/mysql",
  "/adminer",
  "/server-status",
  "/server-info",
  "/cgi-bin",
  "/vendor/phpunit",
  "/phpunit",
  "/actuator",
  "/console",
  "/telescope",
  "/_ignition",
  "/debug/default",
  "/xmlrpc.php",
  "/xmlrpc",
  "/manager/html",
  "/solr",
  "/jenkins",
  "/.DS_Store",
];

const BLOCKED_EXACT = new Set([
  "/admin.php",
  "/shell.php",
  "/config.php",
  "/eval.php",
  "/cmd.php",
  "/backup.sql",
  "/dump.sql",
  "/database.sql",
  "/web.config",
  "/crossdomain.xml",
  "/phpinfo.php",
  "/info.php",
  "/test.php",
  "/.htaccess",
  "/.htpasswd",
]);

const BLOCKED_SUBSTRINGS = [
  "/../",
  "/..\\",
  "%2e%2e",
  "etc/passwd",
  "wp-config",
  "autoload_classmap",
  "eval-stdin.php",
];

/** APIs that legitimately accept GET. Everything else under /api is POST-only. */
const GET_ALLOWED_APIS = ["/api/auth/callback", "/api/vault/export", "/api/legal/admin/publish"];

/** Webhooks / payment callbacks — do not apply browser-bot UA heuristics. */
const UA_EXEMPT_PREFIXES = ["/api/stripe/webhook", "/api/razorpay/webhook"];

const BAD_UA_PATTERNS = [
  /sqlmap/i,
  /nikto/i,
  /nmap/i,
  /masscan/i,
  /dirbuster/i,
  /gobuster/i,
  /wfuzz/i,
  /nuclei/i,
  /acunetix/i,
  /nessus/i,
  /burpsuite/i,
  /zgrab/i,
  /python-requests\/0\.0/i,
  /curl\/7\.(0|1|2)\./i,
  /^$/,
];

/** Default body caps by route (Content-Length). Webhook allows larger signed payloads. */
function maxBodyBytes(path: string): number {
  if (path.startsWith("/api/stripe/webhook")) return 256_000;
  if (path.startsWith("/api/razorpay/webhook")) return 256_000;
  if (path.startsWith("/api/chat")) return 16_384;
  if (path.startsWith("/api/waitlist")) return 8_192;
  if (path.startsWith("/api/legal/admin")) return 64_000;
  if (path.startsWith("/api/legal/")) return 8_192;
  if (path.startsWith("/api/auth/magic-link")) return 8_192;
  if (path.startsWith("/api/auth/sign-out")) return 1_024;
  if (path.startsWith("/api/")) return 32_768;
  return 1_048_576;
}

function isBlockedPath(path: string): boolean {
  const lower = path.toLowerCase();
  if (BLOCKED_EXACT.has(lower)) return true;
  if (BLOCKED_PREFIXES.some((p) => lower.startsWith(p.toLowerCase()))) return true;
  if (BLOCKED_SUBSTRINGS.some((s) => lower.includes(s.toLowerCase()))) return true;
  // Bare scanner file extensions on the root
  if (/\.(php|asp|aspx|jsp|cgi|bak|old|sql|exe)$/i.test(lower) && !lower.startsWith("/api/")) {
    return true;
  }
  return false;
}

function suspiciousUserAgent(ua: string | null, path: string): boolean {
  if (UA_EXEMPT_PREFIXES.some((p) => path.startsWith(p))) return false;
  const value = (ua ?? "").trim();
  return BAD_UA_PATTERNS.some((re) => re.test(value));
}

function withSecurityHeaders(response: NextResponse, requestId: string) {
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=(), payment=(self), usb=(), interest-cohort=()"
  );
  response.headers.set("X-Request-Id", requestId);
  response.headers.set("X-DNS-Prefetch-Control", "on");
  response.headers.set("Cross-Origin-Opener-Policy", "same-origin-allow-popups");
  return response;
}

function securityEvent(
  requestId: string,
  event: string,
  detail: Record<string, string | number | undefined> = {}
) {
  console.info(`[security] ${event}`, { requestId, ...detail });
}

export async function proxy(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const method = request.method.toUpperCase();
  const requestId = request.headers.get("x-request-id") || crypto.randomUUID();
  const ua = request.headers.get("user-agent");

  if (isBlockedPath(path)) {
    securityEvent(requestId, "probe_blocked", { path, method });
    return withSecurityHeaders(new NextResponse(null, { status: 404 }), requestId);
  }

  // API method allowlist
  if (path.startsWith("/api/")) {
    const allowed = ["GET", "POST", "HEAD", "OPTIONS"];
    if (!allowed.includes(method)) {
      securityEvent(requestId, "method_blocked", { path, method });
      return withSecurityHeaders(new NextResponse(null, { status: 405 }), requestId);
    }

    if (method === "GET" && !GET_ALLOWED_APIS.some((p) => path === p || path.startsWith(`${p}/`))) {
      securityEvent(requestId, "get_blocked", { path });
      return withSecurityHeaders(new NextResponse(null, { status: 405 }), requestId);
    }

    // Mutating routes: reject empty / known-scanner User-Agents (webhook exempt)
    if (["POST", "PUT", "PATCH", "DELETE"].includes(method) && suspiciousUserAgent(ua, path)) {
      securityEvent(requestId, "ua_blocked", {
        path,
        method,
        ua: (ua ?? "").slice(0, 80) || "(empty)",
      });
      return withSecurityHeaders(new NextResponse(null, { status: 403 }), requestId);
    }

    // Body size via Content-Length (when present)
    const contentLength = request.headers.get("content-length");
    if (contentLength) {
      const size = Number(contentLength);
      const max = maxBodyBytes(path);
      if (Number.isFinite(size) && size > max) {
        securityEvent(requestId, "body_too_large", { path, size, max });
        return withSecurityHeaders(new NextResponse(null, { status: 413 }), requestId);
      }
    }
  }

  let response = NextResponse.next({
    request: {
      headers: (() => {
        const h = new Headers(request.headers);
        h.set("x-request-id", requestId);
        return h;
      })(),
    },
  });
  response = withSecurityHeaders(response, requestId);

  // Marketing + legal are always public. Auth wall ONLY for /vault app routes.
  // Login lives at /login — never treat `/` as the sign-in experience.
  if (isPublicMarketingPath(path)) {
    return response;
  }

  if (path.startsWith("/vault")) {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookieOptions: {
          path: "/",
          sameSite: "lax",
          secure: process.env.NODE_ENV === "production",
          httpOnly: true,
        },
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
            cookiesToSet.forEach(({ name, value, options }) =>
              response.cookies.set(name, value, {
                ...options,
                path: "/",
                sameSite: "lax",
                secure: process.env.NODE_ENV === "production",
                httpOnly: true,
              })
            );
          },
        },
      }
    );

    const { data } = await supabase.auth.getUser();
    if (!data.user) {
      const redirectUrl = new URL("/login", request.url);
      // Only pass a safe relative path into ?next=
      const safeNext = path.startsWith("/") && !path.startsWith("//") ? path : "/vault";
      redirectUrl.searchParams.set("next", safeNext);
      return withSecurityHeaders(NextResponse.redirect(redirectUrl), requestId);
    }
  }

  return response;
}

/** Public marketing / legal — never gated behind session. */
function isPublicMarketingPath(path: string): boolean {
  if (path === "/") return true;
  const exact = new Set([
    "/pricing",
    "/foundry-kit",
    "/faq",
    "/whats-inside",
    "/method",
    "/terms",
    "/privacy",
    "/refund",
    "/legal",
    "/login",
    "/license",
    "/security",
    "/checkout/success",
  ]);
  if (exact.has(path)) return true;
  if (path.startsWith("/ideas/")) return true;
  if (path.startsWith("/legal/")) return true;
  return false;
}

export const config = {
  matcher: ["/vault/:path*", "/api/:path*", "/((?!_next/static|_next/image|favicon.ico).*)"],
};
