"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import {
  AuthCard,
  FormField,
  inputClass,
  primaryButtonClass,
  ErrorMessage,
  SuccessMessage,
} from "@/components/auth-card";

function VerifyForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") ?? "";

  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [resent, setResent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!email) {
      setError("Missing email address. Please sign up again.");
      return;
    }
    if (!/^\d{6}$/.test(code.trim())) {
      setError("Enter the 6-digit code from your email.");
      return;
    }

    setLoading(true);
    const supabase = createClient();
    const { error: verifyError } = await supabase.auth.verifyOtp({
      email,
      token: code.trim(),
      type: "signup",
    });
    setLoading(false);

    if (verifyError) {
      setError("That code didn't work. Check the email and try again.");
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  async function handleResend() {
    if (!email) return;
    setResending(true);
    setError(null);
    const supabase = createClient();
    const { error: resendError } = await supabase.auth.resend({
      type: "signup",
      email,
    });
    setResending(false);
    if (resendError) {
      setError(resendError.message);
    } else {
      setResent(true);
    }
  }

  return (
    <AuthCard
      title="Check your email"
      subtitle={
        email
          ? `We sent a 6-digit code to ${email}. Enter it below to finish creating your account.`
          : "We sent a 6-digit code to your email. Enter it below to finish creating your account."
      }
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        {error && <ErrorMessage message={error} />}
        {resent && <SuccessMessage message="A new code has been sent." />}

        <FormField label="6-digit code" htmlFor="code">
          <input
            id="code"
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={6}
            required
            className={`${inputClass} text-center text-2xl tracking-[0.5em]`}
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
          />
        </FormField>

        <button type="submit" disabled={loading} className={primaryButtonClass}>
          {loading ? "Verifying…" : "Verify and continue"}
        </button>

        <button
          type="button"
          onClick={handleResend}
          disabled={resending}
          className="focus-ring text-center text-[15px] font-medium text-green-deep underline disabled:opacity-60"
        >
          {resending ? "Sending…" : "Resend code"}
        </button>
      </form>
    </AuthCard>
  );
}

export default function VerifyPage() {
  return (
    <Suspense fallback={null}>
      <VerifyForm />
    </Suspense>
  );
}
