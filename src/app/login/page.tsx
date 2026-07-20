"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { postLoginPath } from "@/lib/post-login-redirect";
import { loginSchema } from "@/lib/validation";
import {
  AuthCard,
  FormField,
  inputClass,
  primaryButtonClass,
  ErrorMessage,
} from "@/components/auth-card";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const parsed = loginSchema.safeParse({ email, password });
    if (!parsed.success) {
      setError(parsed.error.issues[0].message);
      return;
    }

    setLoading(true);
    const supabase = createClient();
    const { error: signInError } = await supabase.auth.signInWithPassword(parsed.data);
    setLoading(false);

    if (signInError) {
      if (signInError.message.toLowerCase().includes("email not confirmed")) {
        router.push(`/verify?email=${encodeURIComponent(parsed.data.email)}`);
        return;
      }
      setError("That email or password isn't right. Please try again.");
      return;
    }

    router.push(await postLoginPath(supabase));
    router.refresh();
  }

  return (
    <AuthCard title="Log in" subtitle="Welcome back to Leela's Library.">
      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        {error && <ErrorMessage message={error} />}

        <FormField label="Email address" htmlFor="email">
          <input
            id="email"
            type="email"
            autoComplete="email"
            required
            className={inputClass}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </FormField>

        <FormField label="Password" htmlFor="password">
          <input
            id="password"
            type="password"
            autoComplete="current-password"
            required
            className={inputClass}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </FormField>

        <button type="submit" disabled={loading} className={primaryButtonClass}>
          {loading ? "Logging in…" : "Log in"}
        </button>

        <div className="flex flex-col items-center gap-2 text-[15px] text-ink-soft">
          <Link href="/forgot-password" className="font-semibold text-accent hover:underline">
            Forgot your password?
          </Link>
          <p>
            New here?{" "}
            <Link href="/signup" className="font-semibold text-accent hover:underline">
              Create an account
            </Link>
          </p>
        </div>
      </form>
    </AuthCard>
  );
}
