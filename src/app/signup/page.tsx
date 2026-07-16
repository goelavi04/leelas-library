"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { signupSchema } from "@/lib/validation";
import {
  AuthCard,
  FormField,
  inputClass,
  primaryButtonClass,
  ErrorMessage,
} from "@/components/auth-card";

export default function SignupPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const parsed = signupSchema.safeParse({ fullName, email, password });
    if (!parsed.success) {
      setError(parsed.error.issues[0].message);
      return;
    }

    setLoading(true);
    const supabase = createClient();
    const { error: signUpError } = await supabase.auth.signUp({
      email: parsed.data.email,
      password: parsed.data.password,
      options: {
        data: { full_name: parsed.data.fullName },
      },
    });
    setLoading(false);

    if (signUpError) {
      setError(
        signUpError.message.includes("already registered")
          ? "An account with that email already exists. Try logging in instead."
          : signUpError.message
      );
      return;
    }

    router.push(`/verify?email=${encodeURIComponent(parsed.data.email)}`);
  }

  return (
    <AuthCard
      title="Create your account"
      subtitle="Sign up to see your borrowing history and get book suggestions."
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        {error && <ErrorMessage message={error} />}

        <FormField label="Your name" htmlFor="fullName">
          <input
            id="fullName"
            type="text"
            autoComplete="name"
            required
            className={inputClass}
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
          />
        </FormField>

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

        <FormField
          label="Password"
          htmlFor="password"
          hint="At least 8 characters."
        >
          <input
            id="password"
            type="password"
            autoComplete="new-password"
            required
            className={inputClass}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </FormField>

        <button type="submit" disabled={loading} className={primaryButtonClass}>
          {loading ? "Creating account…" : "Create account"}
        </button>

        <p className="text-center text-[15px] text-ink-soft">
          Already have an account?{" "}
          <Link href="/login" className="font-medium text-green-deep underline">
            Log in
          </Link>
        </p>
      </form>
    </AuthCard>
  );
}
