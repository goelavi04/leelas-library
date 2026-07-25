"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import Link from "next/link";
import { signupAction, type SignupState } from "@/app/signup/actions";
import {
  AuthCard,
  FormField,
  inputClass,
  primaryButtonClass,
  ErrorMessage,
} from "@/components/auth-card";
import { BackButton } from "@/components/back-button";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className={primaryButtonClass}>
      {pending ? "Creating account…" : "Create account"}
    </button>
  );
}

export default function SignupPage() {
  const [state, formAction] = useActionState<SignupState, FormData>(signupAction, {});

  return (
    <>
      <div className="mx-auto max-w-md px-4 pt-8 sm:px-0">
        <BackButton fallbackHref="/" />
      </div>
      <AuthCard
        title="Create an admin account"
        subtitle="Ask an existing admin for the admin code to get access."
      >
      <form action={formAction} className="flex flex-col gap-5">
        {state.error && <ErrorMessage message={state.error} />}

        <FormField label="Your name" htmlFor="fullName">
          <input id="fullName" name="fullName" type="text" autoComplete="name" required className={inputClass} />
          {state.fieldErrors?.fullName && <p className="text-sm text-critical">{state.fieldErrors.fullName}</p>}
        </FormField>

        <FormField label="Email address" htmlFor="email">
          <input id="email" name="email" type="email" autoComplete="email" required className={inputClass} />
          {state.fieldErrors?.email && <p className="text-sm text-critical">{state.fieldErrors.email}</p>}
        </FormField>

        <FormField label="Password" htmlFor="password" hint="At least 8 characters.">
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="new-password"
            required
            className={inputClass}
          />
          {state.fieldErrors?.password && <p className="text-sm text-critical">{state.fieldErrors.password}</p>}
        </FormField>

        <FormField label="Admin code" htmlFor="adminCode" hint="Ask an existing admin for this code.">
          <input id="adminCode" name="adminCode" type="password" autoComplete="off" required className={inputClass} />
          {state.fieldErrors?.adminCode && <p className="text-sm text-critical">{state.fieldErrors.adminCode}</p>}
        </FormField>

        <SubmitButton />

        <p className="text-center text-[15px] text-ink-soft">
          Already have an account?{" "}
          <Link href="/login" className="font-semibold text-accent hover:underline">
            Log in
          </Link>
        </p>
      </form>
      </AuthCard>
    </>
  );
}
