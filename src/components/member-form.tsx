"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import type { MemberFormState } from "@/app/admin/members/actions";
import { FormField, inputClass, ErrorMessage } from "@/components/auth-card";

function SubmitButton({ label, savingLabel }: { label: string; savingLabel: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="focus-ring rounded-lg bg-accent px-5 py-2.5 text-[14.5px] font-semibold text-white shadow-card hover:bg-accent-hover disabled:opacity-60"
    >
      {pending ? savingLabel : label}
    </button>
  );
}

export function MemberForm({
  action,
  submitLabel,
  savingLabel,
  initialValues,
}: {
  action: (prevState: MemberFormState, formData: FormData) => Promise<MemberFormState>;
  submitLabel: string;
  savingLabel: string;
  initialValues?: {
    fullName: string;
    email: string | null;
    phone: string | null;
    notes: string | null;
  };
}) {
  const [state, formAction] = useActionState<MemberFormState, FormData>(action, {});

  return (
    <form action={formAction} className="flex flex-col gap-6">
      {state.error && <ErrorMessage message={state.error} />}

      <FormField label="Full name" htmlFor="fullName">
        <input
          id="fullName"
          name="fullName"
          type="text"
          required
          defaultValue={initialValues?.fullName}
          className={inputClass}
        />
        {state.fieldErrors?.fullName && (
          <p className="text-sm text-critical">{state.fieldErrors.fullName}</p>
        )}
      </FormField>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <FormField label="Email (optional)" htmlFor="email">
          <input
            id="email"
            name="email"
            type="email"
            defaultValue={initialValues?.email ?? ""}
            className={inputClass}
          />
          {state.fieldErrors?.email && <p className="text-sm text-critical">{state.fieldErrors.email}</p>}
        </FormField>

        <FormField label="Phone (optional)" htmlFor="phone">
          <input
            id="phone"
            name="phone"
            type="tel"
            defaultValue={initialValues?.phone ?? ""}
            className={inputClass}
          />
          {state.fieldErrors?.phone && <p className="text-sm text-critical">{state.fieldErrors.phone}</p>}
        </FormField>
      </div>

      <FormField label="Notes" htmlFor="notes">
        <textarea
          id="notes"
          name="notes"
          rows={4}
          defaultValue={initialValues?.notes ?? ""}
          className={inputClass}
        />
      </FormField>

      <SubmitButton label={submitLabel} savingLabel={savingLabel} />
    </form>
  );
}
