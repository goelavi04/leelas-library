"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { signupSchema } from "@/lib/validation";

export interface SignupState {
  error?: string;
  fieldErrors?: Record<string, string>;
}

export async function signupAction(_prevState: SignupState, formData: FormData): Promise<SignupState> {
  const parsed = signupSchema.safeParse({
    fullName: String(formData.get("fullName") ?? ""),
    email: String(formData.get("email") ?? ""),
    password: String(formData.get("password") ?? ""),
    accountType: String(formData.get("accountType") ?? "user"),
    adminCode: String(formData.get("adminCode") ?? ""),
  });

  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = String(issue.path[0]);
      if (!fieldErrors[key]) fieldErrors[key] = issue.message;
    }
    return { error: "Please fix the highlighted fields.", fieldErrors };
  }

  const { fullName, email, password, accountType, adminCode } = parsed.data;

  if (accountType === "admin") {
    const expectedCode = process.env.ADMIN_SIGNUP_CODE;
    if (!expectedCode || adminCode !== expectedCode) {
      return {
        error: "Please fix the highlighted fields.",
        fieldErrors: { adminCode: "That admin code isn't right." },
      };
    }
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { full_name: fullName } },
  });

  if (error) {
    return {
      error: error.message.toLowerCase().includes("already registered")
        ? "An account with that email already exists. Try logging in instead."
        : error.message,
    };
  }

  if (accountType === "admin" && data.user) {
    // handle_new_user() (0001_init.sql) already created the profile row
    // with role 'user'. prevent_role_self_escalation blocks a plain
    // UPDATE from anyone who isn't already an admin — it only guards
    // UPDATE, not INSERT — so replace the row via the service-role key
    // instead of trying to update it.
    const admin = createAdminClient();
    await admin.from("profiles").delete().eq("id", data.user.id);
    await admin.from("profiles").insert({
      id: data.user.id,
      full_name: fullName,
      email,
      role: "admin",
    });
  }

  redirect(`/verify?email=${encodeURIComponent(email)}`);
}
