"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { postLoginPath } from "@/lib/post-login-redirect";
import { resetPasswordSchema } from "@/lib/validation";
import {
  AuthCard,
  FormField,
  inputClass,
  primaryButtonClass,
  ErrorMessage,
} from "@/components/auth-card";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // The recovery link puts the user in a temporary "recovery" session.
    // Wait for the Supabase client to pick that up before allowing submit.
    const supabase = createClient();
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY" || event === "SIGNED_IN") {
        setReady(true);
      }
    });
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) setReady(true);
    });
    return () => subscription.unsubscribe();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (password !== confirm) {
      setError("Passwords don't match.");
      return;
    }
    const parsed = resetPasswordSchema.safeParse({ password });
    if (!parsed.success) {
      setError(parsed.error.issues[0].message);
      return;
    }

    setLoading(true);
    const supabase = createClient();
    const { error: updateError } = await supabase.auth.updateUser({
      password: parsed.data.password,
    });
    setLoading(false);

    if (updateError) {
      setError(updateError.message);
      return;
    }

    router.push(await postLoginPath(supabase));
    router.refresh();
  }

  return (
    <AuthCard title="Set a new password" subtitle="Choose a new password for your account.">
      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        {error && <ErrorMessage message={error} />}
        {!ready && (
          <p className="text-[15px] text-ink-soft">
            Open this page using the reset link from your email.
          </p>
        )}

        <FormField label="New password" htmlFor="password" hint="At least 8 characters.">
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

        <FormField label="Confirm new password" htmlFor="confirm">
          <input
            id="confirm"
            type="password"
            autoComplete="new-password"
            required
            className={inputClass}
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
          />
        </FormField>

        <button type="submit" disabled={loading || !ready} className={primaryButtonClass}>
          {loading ? "Saving…" : "Save new password"}
        </button>
      </form>
    </AuthCard>
  );
}
