"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import type { CheckoutFormState } from "@/app/admin/loans/actions";
import { FormField, inputClass, ErrorMessage } from "@/components/auth-card";
import { SearchableSelect } from "@/components/searchable-select";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="focus-ring rounded-lg bg-accent px-5 py-2.5 text-[14.5px] font-semibold text-white shadow-card hover:bg-accent-hover disabled:opacity-60"
    >
      {pending ? "Checking out…" : "Check out this book"}
    </button>
  );
}

export function CheckoutForm({
  action,
  bookId,
  bookLabel,
  availableBooks,
  members,
  defaultDueDate,
}: {
  action: (prevState: CheckoutFormState, formData: FormData) => Promise<CheckoutFormState>;
  bookId?: string;
  bookLabel?: string;
  availableBooks: { id: string; title: string; author: string }[];
  members: { id: string; full_name: string; email: string | null }[];
  defaultDueDate: string;
}) {
  const [state, formAction] = useActionState<CheckoutFormState, FormData>(action, {});

  return (
    <form action={formAction} className="flex flex-col gap-6">
      {state.error && <ErrorMessage message={state.error} />}

      {bookId ? (
        <FormField label="Book" htmlFor="bookLabel">
          <input id="bookLabel" type="text" readOnly value={bookLabel} className={`${inputClass} bg-paper-dim`} />
          <input type="hidden" name="bookId" value={bookId} />
        </FormField>
      ) : (
        <FormField label="Book" htmlFor="bookId">
          <SearchableSelect
            name="bookId"
            required
            placeholder="Search by title or author…"
            options={availableBooks.map((book) => ({ id: book.id, label: book.title, sublabel: book.author }))}
          />
          {state.fieldErrors?.bookId && <p className="text-sm text-critical">{state.fieldErrors.bookId}</p>}
        </FormField>
      )}

      <FormField label="Member" htmlFor="memberId">
        <SearchableSelect
          name="memberId"
          required
          placeholder="Search by name or email…"
          emptyMessage={
            <>
              No members yet — add one from the{" "}
              <a href="/admin/members/new" className="font-semibold text-accent hover:underline">
                Members
              </a>{" "}
              page first.
            </>
          }
          options={members.map((member) => ({
            id: member.id,
            label: member.full_name,
            sublabel: member.email ?? undefined,
          }))}
        />
        {state.fieldErrors?.memberId && <p className="text-sm text-critical">{state.fieldErrors.memberId}</p>}
      </FormField>

      <FormField label="Due date" htmlFor="dueDate">
        <input id="dueDate" name="dueDate" type="date" defaultValue={defaultDueDate} required className={inputClass} />
      </FormField>

      <SubmitButton />
    </form>
  );
}
