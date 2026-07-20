"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export function LogoutButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleLogout() {
    setLoading(true);
    const supabase = createClient();
    await supabase.auth.signOut();
    router.refresh();
    router.push("/");
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
