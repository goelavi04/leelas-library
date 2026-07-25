"use client";

import { useActionState, useRef, useState } from "react";
import { useFormStatus } from "react-dom";
import Image from "next/image";
import type { BookFormState, IsbnLookupState } from "@/app/admin/books/actions";
import { lookupBookByIsbn } from "@/app/admin/books/actions";
import { FormField, inputClass, ErrorMessage } from "@/components/auth-card";
import { BarcodeScanner } from "@/components/barcode-scanner";
import { ScanIcon } from "@/components/icons";

function SubmitButton({ label, savingLabel }: { label: string; savingLabel: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="focus-ring rounded-lg bg-accent px-5 py-2.5 text-[14.5px] font-semibold text-white shadow-card disabled:opacity-60"
    >
      {pending ? savingLabel : label}
    </button>
  );
}

async function dataUrlToFile(dataUrl: string, filename: string): Promise<File> {
  const res = await fetch(dataUrl);
  const blob = await res.blob();
  return new File([blob], filename, { type: blob.type });
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

  const titleRef = useRef<HTMLInputElement>(null);
  const authorRef = useRef<HTMLInputElement>(null);
  const genreRef = useRef<HTMLInputElement>(null);
  const isbnRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  const [scanning, setScanning] = useState(false);
  const [lookupState, setLookupState] = useState<IsbnLookupState | null>(null);
  const [looking, setLooking] = useState(false);
  const [scannedCoverPreview, setScannedCoverPreview] = useState<string | null>(null);

  async function handleDetected(rawIsbn: string) {
    setScanning(false);
    setLooking(true);
    setLookupState(null);

    const result = await lookupBookByIsbn(rawIsbn);
    setLooking(false);
    setLookupState(result);

    if (isbnRef.current) isbnRef.current.value = result.isbn ?? rawIsbn;

    if (result.data) {
      if (titleRef.current) titleRef.current.value = result.data.title;
      if (authorRef.current) authorRef.current.value = result.data.author ?? "";
      if (genreRef.current) genreRef.current.value = result.data.genre ?? "";

      if (result.data.coverDataUrl && coverInputRef.current) {
        const file = await dataUrlToFile(result.data.coverDataUrl, "cover.jpg");
        const transfer = new DataTransfer();
        transfer.items.add(file);
        coverInputRef.current.files = transfer.files;
        setScannedCoverPreview(result.data.coverDataUrl);
      }
    }
  }

  return (
    <form action={formAction} className="flex flex-col gap-6">
      {state.error && <ErrorMessage message={state.error} />}

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-line bg-paper-dim px-4 py-3">
        <div>
          <p className="text-[14.5px] font-semibold text-ink">Scan a barcode</p>
          <p className="text-[13px] text-ink-soft">Use your phone&rsquo;s camera to fill in the details below.</p>
        </div>
        <button
          type="button"
          onClick={() => {
            setLookupState(null);
            setScanning(true);
          }}
          className="focus-ring flex items-center gap-2 rounded-lg border border-line bg-paper px-4 py-2 text-[14px] font-semibold text-ink hover:bg-paper-dim"
        >
          <ScanIcon className="h-4 w-4" />
          Scan Barcode
        </button>
      </div>

      {looking && <p className="text-[14px] text-ink-soft">Looking up this ISBN…</p>}
      {lookupState?.data && (
        <p className="rounded-lg bg-good-soft px-4 py-3 text-[14px] text-good">
          Found &ldquo;{lookupState.data.title}&rdquo; — review the details below, then save.
        </p>
      )}
      {lookupState?.error && (
        <p className="rounded-lg bg-gold-soft px-4 py-3 text-[14px] text-gold">{lookupState.error}</p>
      )}

      {scanning && (
        <BarcodeScanner onDetected={handleDetected} onClose={() => setScanning(false)} />
      )}

      <FormField label="Title" htmlFor="title">
        <input
          id="title"
          name="title"
          type="text"
          required
          ref={titleRef}
          defaultValue={initialValues?.title}
          className={inputClass}
        />
        {state.fieldErrors?.title && (
          <p className="text-sm text-critical">{state.fieldErrors.title}</p>
        )}
      </FormField>

      <FormField label="Author" htmlFor="author">
        <input
          id="author"
          name="author"
          type="text"
          required
          ref={authorRef}
          defaultValue={initialValues?.author}
          className={inputClass}
        />
        {state.fieldErrors?.author && (
          <p className="text-sm text-critical">{state.fieldErrors.author}</p>
        )}
      </FormField>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <FormField label="Genre" htmlFor="genre">
          <input
            id="genre"
            name="genre"
            type="text"
            ref={genreRef}
            defaultValue={initialValues?.genre ?? ""}
            className={inputClass}
          />
        </FormField>

        <FormField label="ISBN" htmlFor="isbn">
          <input
            id="isbn"
            name="isbn"
            type="text"
            ref={isbnRef}
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
        {(scannedCoverPreview ?? existingCoverUrl) && (
          <div className="mb-2 flex items-center gap-4">
            <Image
              src={scannedCoverPreview ?? existingCoverUrl!}
              alt="Cover preview"
              width={80}
              height={107}
              unoptimized={!!scannedCoverPreview}
              className="rounded border border-line"
            />
            {!scannedCoverPreview && existingCoverUrl && (
              <label className="flex items-center gap-2 text-[15px] text-ink-soft">
                <input type="checkbox" name="removeCover" value="1" className="h-5 w-5 rounded border-line" />
                Remove current cover
              </label>
            )}
          </div>
        )}
        <input
          id="cover"
          name="cover"
          type="file"
          ref={coverInputRef}
          accept="image/png,image/jpeg,image/webp"
          className="focus-ring w-full rounded-lg border border-line bg-paper-dim px-3.5 py-2.5 text-[15px]"
        />
      </FormField>

      <SubmitButton label={submitLabel} savingLabel={savingLabel} />
    </form>
  );
}
