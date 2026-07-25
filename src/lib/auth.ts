import "server-only";
import { cache } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Profile } from "@/lib/supabase/types";

export interface SessionInfo {
  userId: string;
  email: string | null;
  profile: Profile;
}

/**
 * Reads the current session from Supabase Auth and re-fetches the profile
 * row (with role) directly from the database — never trust a role coming
 * from anywhere other than this lookup.
 *
 * Wrapped in React's cache() so the auth round trip runs once per request
 * no matter how many times it's called — the root layout (for the header)
 * and the page itself (via requireAdmin) both call this on every
 * navigation, and without dedup that's two Supabase auth calls doing
 * identical work on every single page load.
 */
export const getSession = cache(async (): Promise<SessionInfo | null> => {
  // Anonymous visitors — everyone browsing the public catalog — have no
  // Supabase auth cookie at all. Skip the network round trip to the Auth
  // API entirely rather than asking it to confirm what the cookie jar
  // already tells us: there's no one logged in.
  const cookieStore = await cookies();
  const hasAuthCookie = cookieStore.getAll().some((cookie) => cookie.name.startsWith("sb-") && cookie.name.includes("-auth-token"));
  if (!hasAuthCookie) return null;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (!profile) return null;

  return { userId: user.id, email: user.email ?? null, profile };
});

/** Use in Server Components/pages/actions that require the admin role. */
export async function requireAdmin(): Promise<SessionInfo> {
  const session = await getSession();
  if (!session) redirect("/login");
  if (session.profile.role !== "admin") redirect("/");
  return session;
}
