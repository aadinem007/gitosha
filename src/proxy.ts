import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const BLOCKED_PREFIXES = [
  "/.env",
  "/wp-admin",
  "/wp-login",
  "/phpmyadmin",
  "/.git",
  "/server-status",
];

function withSecurityHeaders(response: NextResponse) {
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=(), payment=(self)");
  response.headers.set("X-Request-Id", crypto.randomUUID());
  response.headers.set("X-DNS-Prefetch-Control", "on");
  return response;
}

export async function proxy(request: NextRequest) {
  const path = request.nextUrl.pathname;

  if (BLOCKED_PREFIXES.some((p) => path.startsWith(p))) {
    return withSecurityHeaders(new NextResponse(null, { status: 404 }));
  }

  // Block obvious probe verbs on APIs
  if (path.startsWith("/api/") && !["GET", "POST", "HEAD", "OPTIONS"].includes(request.method)) {
    return withSecurityHeaders(new NextResponse(null, { status: 405 }));
  }

  let response = NextResponse.next({ request });
  response = withSecurityHeaders(response);

  if (path.startsWith("/vault")) {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
            cookiesToSet.forEach(({ name, value, options }) =>
              response.cookies.set(name, value, options)
            );
          },
        },
      }
    );

    const { data } = await supabase.auth.getUser();
    if (!data.user) {
      const redirectUrl = new URL("/login", request.url);
      redirectUrl.searchParams.set("next", path);
      return withSecurityHeaders(NextResponse.redirect(redirectUrl));
    }
  }

  return response;
}

export const config = {
  matcher: ["/vault/:path*", "/api/:path*", "/((?!_next/static|_next/image|favicon.ico).*)"],
};
