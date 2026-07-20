"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

// supabase-js's signOut() re-throws on a raw network failure (offline, a
// blocked/aborted request) *before* it clears the session cookie — so on
// a bad connection the button would otherwise get stuck on "Signing out…"
// forever while the user stays logged in. Clear the cookie ourselves as a
// fallback so leaving the signed-in UI never depends on that request
// succeeding.
function clearSupabaseCookies() {
  document.cookie.split(";").forEach((entry) => {
    const name = entry.split("=")[0].trim();
    if (name.startsWith("sb-") && name.includes("-auth-token")) {
      document.cookie = `${name}=; path=/; max-age=0`;
    }
  });
}

export function LogoutButton() {
  const [loading, setLoading] = useState(false);

  async function handleLogout() {
    setLoading(true);
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
    } catch {
      clearSupabaseCookies();
    } finally {
      // A full page load, not client-side navigation — this guarantees
      // the next request reads the (now-cleared) cookie fresh from the
      // server instead of risking a stale entry from Next's router cache.
      window.location.href = "/";
    }
  }

  return (
    <button
      onClick={handleLogout}
      disabled={loading}
      className="focus-ring rounded-full px-2 py-1 text-[13px] font-medium text-ink-soft hover:text-ink disabled:opacity-60"
    >
      {loading ? "Signing out…" : "Log out"}
    </button>
  );
}
