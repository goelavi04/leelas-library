"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import type { Role } from "@/lib/supabase/types";

export async function setUserRole(userId: string, role: Role): Promise<void> {
  const session = await requireAdmin();

  // Admins can't change their own role here — prevents locking yourself
  // out by accident. Another admin has to do it.
  if (userId === session.userId) return;

  const supabase = await createClient();
  await supabase.from("profiles").update({ role }).eq("id", userId);

  revalidatePath("/admin/users");
}
