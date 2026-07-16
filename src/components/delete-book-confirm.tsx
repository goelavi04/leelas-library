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
      className="focus-ring rounded-md bg-terracotta px-6 py-3 text-lg font-medium text-paper hover:opacity-90 disabled:opacity-60"
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
    <div className="max-w-lg rounded-lg border border-line bg-white/60 p-8">
      <h1 className="font-serif text-2xl font-semibold text-green-deep">Delete this book?</h1>
      <p className="mt-3 text-[17px] text-ink">
        Are you sure you want to delete <strong>“{bookTitle}”</strong>? This cannot be undone.
      </p>

      {state.error && (
        <div className="mt-4">
          <ErrorMessage message={state.error} />
        </div>
      )}

      <form action={formAction} className="mt-6 flex flex-wrap gap-4">
        <ConfirmButton />
        <Link
          href="/admin/books"
          className="focus-ring rounded-md border border-line px-6 py-3 text-lg font-medium text-ink hover:bg-paper-dim"
        >
          Cancel
        </Link>
      </form>
    </div>
  );
}
