"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import Image from "next/image";
import type { BookFormState } from "@/app/admin/books/actions";
import { FormField, inputClass, ErrorMessage } from "@/components/auth-card";

function SubmitButton({ label, savingLabel }: { label: string; savingLabel: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="focus-ring rounded-md bg-green-deep px-6 py-3 text-lg font-medium text-paper hover:bg-green-deep-hover disabled:opacity-60"
    >
      {pending ? savingLabel : label}
    </button>
  );
}

export function BookForm({
  action,
  submitLabel,
  savingLabel,
  initialValues,
  existingCoverUrl,
}: {
  action: (prevState: BookFormState, formData: FormData) => Promise<BookFormState>;
  submitLabel: string;
  savingLabel: string;
  initialValues?: {
    title: string;
    author: string;
    genre: string | null;
    isbn: string | null;
    shelfLocation: string | null;
    notes: string | null;
  };
  existingCoverUrl?: string | null;
}) {
  const [state, formAction] = useActionState<BookFormState, FormData>(action, {});

  return (
    <form action={formAction} className="flex flex-col gap-6" encType="multipart/form-data">
      {state.error && <ErrorMessage message={state.error} />}

      <FormField label="Title" htmlFor="title">
        <input
          id="title"
          name="title"
          type="text"
          required
          defaultValue={initialValues?.title}
          className={inputClass}
        />
        {state.fieldErrors?.title && (
          <p className="text-sm text-terracotta">{state.fieldErrors.title}</p>
        )}
      </FormField>

      <FormField label="Author" htmlFor="author">
        <input
          id="author"
          name="author"
          type="text"
          required
          defaultValue={initialValues?.author}
          className={inputClass}
        />
        {state.fieldErrors?.author && (
          <p className="text-sm text-terracotta">{state.fieldErrors.author}</p>
        )}
      </FormField>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <FormField label="Genre" htmlFor="genre">
          <input
            id="genre"
            name="genre"
            type="text"
            defaultValue={initialValues?.genre ?? ""}
            className={inputClass}
          />
        </FormField>

        <FormField label="ISBN" htmlFor="isbn">
          <input
            id="isbn"
            name="isbn"
            type="text"
            defaultValue={initialValues?.isbn ?? ""}
            className={inputClass}
          />
        </FormField>
      </div>

      <FormField label="Shelf location" htmlFor="shelfLocation" hint="Where to find it, e.g. “Living room, shelf 3”.">
        <input
          id="shelfLocation"
          name="shelfLocation"
          type="text"
          defaultValue={initialValues?.shelfLocation ?? ""}
          className={inputClass}
        />
      </FormField>

      <FormField label="Notes" htmlFor="notes">
        <textarea
          id="notes"
          name="notes"
          rows={4}
          defaultValue={initialValues?.notes ?? ""}
          className={inputClass}
        />
      </FormField>

      <FormField label="Cover image" htmlFor="cover" hint="Optional. JPG or PNG, any size — it will be resized automatically.">
        {existingCoverUrl && (
          <div className="mb-2 flex items-center gap-4">
            <Image src={existingCoverUrl} alt="Current cover" width={80} height={107} className="rounded border border-line" />
            <label className="flex items-center gap-2 text-[15px] text-ink-soft">
              <input type="checkbox" name="removeCover" value="1" className="h-5 w-5 rounded border-line" />
              Remove current cover
            </label>
          </div>
        )}
        <input
          id="cover"
          name="cover"
          type="file"
          accept="image/png,image/jpeg,image/webp"
          className="focus-ring w-full rounded-md border border-line bg-white px-4 py-3 text-[17px]"
        />
      </FormField>

      <SubmitButton label={submitLabel} savingLabel={savingLabel} />
    </form>
  );
}
