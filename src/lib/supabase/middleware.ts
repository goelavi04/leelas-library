import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import type { Database } from "./types";

/**
 * Supabase's SSR cookie helper always names the session cookie
 * `sb-<project-ref>-auth-token` (chunked into `.0`/`.1` suffixes if large).
 * Checking for it before calling the Auth API lets anonymous visitors —
 * everyone browsing the public catalog, which is most traffic on a library
 * site — skip a network round trip to Supabase on every single request.
 */
function hasSupabaseAuthCookie(request: NextRequest): boolean {
  return request.cookies.getAll().some((cookie) => cookie.name.startsWith("sb-") && cookie.name.includes("-auth-token"));
}

// Refreshes the Supabase auth session on every request so server components
// always see a valid (non-expired) session. Runs in Next.js middleware.
export async function updateSession(request: NextRequest) {
  const response = NextResponse.next({ request });

  if (!hasSupabaseAuthCookie(request)) {
    return response;
  }

  return refreshSession(request, response);
}

async function refreshSession(request: NextRequest, initialResponse: NextResponse) {
  let response = initialResponse;

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          for (const { name, value } of cookiesToSet) {
            request.cookies.set(name, value);
          }
          response = NextResponse.next({ request });
          for (const { name, value, options } of cookiesToSet) {
            response.cookies.set(name, value, options);
          }
        },
      },
    }
  );

  // IMPORTANT: do not remove this call. It refreshes the token and must run
  // before any route logic that depends on the session.
  await supabase.auth.getUser();

  return response;
}
