import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

function withSecurityHeaders(response: NextResponse) {
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set("X-Request-Id", crypto.randomUUID());
  return response;
}

export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });
  response = withSecurityHeaders(response);

  const path = request.nextUrl.pathname;

  // Auth gate for private research product
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
