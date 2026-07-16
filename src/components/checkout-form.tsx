"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import type { CheckoutFormState } from "@/app/admin/loans/actions";
import { FormField, inputClass, ErrorMessage } from "@/components/auth-card";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="focus-ring rounded-md bg-green-deep px-6 py-3 text-lg font-medium text-paper hover:bg-green-deep-hover disabled:opacity-60"
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
  users,
  defaultDueDate,
}: {
  action: (prevState: CheckoutFormState, formData: FormData) => Promise<CheckoutFormState>;
  bookId?: string;
  bookLabel?: string;
  availableBooks: { id: string; title: string; author: string }[];
  users: { id: string; full_name: string | null; email: string | null }[];
  defaultDueDate: string;
}) {
  const [state, formAction] = useActionState<CheckoutFormState, FormData>(action, {});
  const [borrowerType, setBorrowerType] = useState<"registered" | "guest">("registered");

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
          <select id="bookId" name="bookId" required className={inputClass}>
            <option value="">Choose an available book…</option>
            {availableBooks.map((book) => (
              <option key={book.id} value={book.id}>
                {book.title} — {book.author}
              </option>
            ))}
          </select>
          {state.fieldErrors?.bookId && <p className="text-sm text-terracotta">{state.fieldErrors.bookId}</p>}
        </FormField>
      )}

      <fieldset className="flex flex-col gap-3">
        <legend className="text-[15px] font-medium text-ink">Who is borrowing it?</legend>
        <div className="flex gap-6">
          <label className="flex items-center gap-2 text-[15px]">
            <input
              type="radio"
              name="borrowerType"
              value="registered"
              checked={borrowerType === "registered"}
              onChange={() => setBorrowerType("registered")}
              className="h-5 w-5"
            />
            A registered user
          </label>
          <label className="flex items-center gap-2 text-[15px]">
            <input
              type="radio"
              name="borrowerType"
              value="guest"
              checked={borrowerType === "guest"}
              onChange={() => setBorrowerType("guest")}
              className="h-5 w-5"
            />
            Someone without an account
          </label>
        </div>
      </fieldset>

      {borrowerType === "registered" ? (
        <FormField label="Registered user" htmlFor="borrowerUserId">
          <select id="borrowerUserId" name="borrowerUserId" className={inputClass}>
            <option value="">Choose a person…</option>
            {users.map((user) => (
              <option key={user.id} value={user.id}>
                {user.full_name ?? "Unnamed"} {user.email ? `(${user.email})` : ""}
              </option>
            ))}
          </select>
          {state.fieldErrors?.borrowerUserId && (
            <p className="text-sm text-terracotta">{state.fieldErrors.borrowerUserId}</p>
          )}
        </FormField>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <FormField label="Borrower's name" htmlFor="borrowerName">
            <input id="borrowerName" name="borrowerName" type="text" className={inputClass} />
            {state.fieldErrors?.borrowerName && (
              <p className="text-sm text-terracotta">{state.fieldErrors.borrowerName}</p>
            )}
          </FormField>
          <FormField label="Contact (optional)" htmlFor="borrowerContact" hint="Phone or email">
            <input id="borrowerContact" name="borrowerContact" type="text" className={inputClass} />
          </FormField>
        </div>
      )}

      <FormField label="Due date" htmlFor="dueDate">
        <input id="dueDate" name="dueDate" type="date" defaultValue={defaultDueDate} required className={inputClass} />
      </FormField>

      <SubmitButton />
    </form>
  );
}
