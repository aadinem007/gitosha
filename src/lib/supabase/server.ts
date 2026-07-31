import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/** Session cookies: HttpOnly + Secure (prod) + SameSite=Lax. Our flags win over library defaults. */
const cookieOptions = {
  path: "/",
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  httpOnly: true,
};

// Server-side Supabase client. Used in Server Components, Route Handlers,
// and Server Actions for magic-link auth on /login and gating /research.
export async function createSupabaseServerClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookieOptions,
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, { ...options, ...cookieOptions })
            );
          } catch {
            // Called from a Server Component render — safe to ignore because
            // proxy refreshes the session cookie on every request.
          }
        },
      },
    }
  );
}
