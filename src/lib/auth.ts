import "server-only";
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
 */
export async function getSession(): Promise<SessionInfo | null> {
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
}

/** Use in Server Components/pages that require any logged-in user. */
export async function requireUser(): Promise<SessionInfo> {
  const session = await getSession();
  if (!session) redirect("/login");
  return session;
}

/** Use in Server Components/pages/actions that require the admin role. */
export async function requireAdmin(): Promise<SessionInfo> {
  const session = await getSession();
  if (!session) redirect("/login");
  if (session.profile.role !== "admin") redirect("/dashboard");
  return session;
}
