"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import Link from "next/link";
import type { DeleteState } from "@/app/admin/books/actions";
import { ErrorMessage } from "@/components/auth-card";

function ConfirmButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="focus-ring rounded-lg bg-critical px-5 py-2.5 text-[14.5px] font-semibold text-white hover:opacity-90 disabled:opacity-60"
    >
      {pending ? "Deleting…" : "Yes, delete this book"}
    </button>
  );
}

export function DeleteBookConfirm({
  bookTitle,
  action,
}: {
  bookTitle: string;
  action: (prevState: DeleteState, formData: FormData) => Promise<DeleteState>;
}) {
  const [state, formAction] = useActionState<DeleteState, FormData>(action, {});

  return (
    <div className="max-w-lg rounded-xl border border-line shadow-card bg-paper p-8">
      <h1 className="text-xl font-bold tracking-tight text-ink">Delete this book?</h1>
      <p className="mt-3 text-[15px] text-ink-soft">
        Are you sure you want to delete <strong className="text-ink">&ldquo;{bookTitle}&rdquo;</strong>? This
        cannot be undone.
      </p>

      {state.error && (
        <div className="mt-4">
          <ErrorMessage message={state.error} />
        </div>
      )}

      <form action={formAction} className="mt-6 flex flex-wrap gap-3">
        <ConfirmButton />
        <Link
          href="/admin/books"
          className="focus-ring rounded-lg border border-line px-5 py-2.5 text-[14.5px] font-semibold text-ink hover:bg-paper-dim"
        >
          Cancel
        </Link>
      </form>
    </div>
  );
}
