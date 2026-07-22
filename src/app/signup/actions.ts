"use server";

import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { signupSchema } from "@/lib/validation";

export interface SignupState {
  error?: string;
  fieldErrors?: Record<string, string>;
}

const MAX_ADMIN_CODE_ATTEMPTS = 5;
const ADMIN_CODE_WINDOW_MINUTES = 15;

async function getClientIp(): Promise<string> {
  const h = await headers();
  const forwarded = h.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return h.get("x-real-ip") ?? "unknown";
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
    // Vercel functions are stateless between invocations, so this has to
    // be tracked in the database rather than an in-memory counter — see
    // 0004_admin_code_rate_limit.sql.
    const admin = createAdminClient();
    const ip = await getClientIp();
    const windowStart = new Date(Date.now() - ADMIN_CODE_WINDOW_MINUTES * 60 * 1000).toISOString();

    const { count } = await admin
      .from("admin_code_attempts")
      .select("id", { count: "exact", head: true })
      .eq("ip", ip)
      .gte("attempted_at", windowStart);

    if ((count ?? 0) >= MAX_ADMIN_CODE_ATTEMPTS) {
      return { error: "Too many admin code attempts. Please try again in a few minutes." };
    }

    const expectedCode = process.env.ADMIN_SIGNUP_CODE;
    if (!expectedCode || adminCode !== expectedCode) {
      await admin.from("admin_code_attempts").insert({ ip });
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

  // Email confirmation is disabled (Supabase Dashboard > Authentication >
  // Sign In / Providers > Email > "Confirm email" off), so signUp() above
  // already returns an active session — go straight in instead of
  // bouncing through an email-based verification step.
  redirect(accountType === "admin" ? "/admin" : "/dashboard");
}
