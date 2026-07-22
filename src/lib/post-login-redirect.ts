import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/types";

/**
 * Where to send someone right after they sign in.
 *
 * Takes the user id directly instead of calling supabase.auth.getUser() —
 * the caller already has it from the sign-in response, and re-fetching it
 * is an extra network round trip to Supabase for no reason (the app and
 * database are in different regions, so every round trip is real latency).
 */
export async function postLoginPath(supabase: SupabaseClient<Database>, userId: string): Promise<string> {
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", userId).single();
  return profile?.role === "admin" ? "/admin" : "/dashboard";
}
