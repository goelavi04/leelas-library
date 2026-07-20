"use client";

import { useEffect, useState, useTransition } from "react";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import Link from "next/link";
import {
  parseImportAction,
  confirmImportAction,
  type ParseState,
} from "@/app/admin/import/actions";
import type { ParsedRow } from "@/lib/import";
import { ErrorMessage, SuccessMessage, inputClass } from "@/components/auth-card";

const FIELDS: { key: keyof ParsedRow; label: string }[] = [
  { key: "title", label: "Title" },
  { key: "author", label: "Author" },
  { key: "genre", label: "Genre" },
  { key: "isbn", label: "ISBN" },
  { key: "shelfLocation", label: "Shelf location" },
  { key: "notes", label: "Notes" },
];

const primaryBtn =
  "focus-ring rounded-lg bg-accent px-5 py-2.5 text-[14.5px] font-semibold text-white shadow-card hover:bg-accent-hover disabled:opacity-60";
const ghostBtn =
  "focus-ring rounded-lg border border-line px-5 py-2.5 text-[14.5px] font-semibold text-ink hover:bg-paper-dim disabled:opacity-60";

function ParseSubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className={primaryBtn}>
      {pending ? "Reading file…" : "Read file"}
    </button>
  );
}

function UploadStep({ onParsed }: { onParsed: (rows: ParsedRow[], warning?: string) => void }) {
  const [state, formAction] = useActionState<ParseState, FormData>(parseImportAction, {});

  useEffect(() => {
    if (state.rows) onParsed(state.rows, state.warning);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.rows, state.warning]);

  return (
    <form action={formAction} className="flex flex-col gap-6" encType="multipart/form-data">
      {state.error && <ErrorMessage message={state.error} />}

      <div className="flex flex-col gap-1.5">
        <label htmlFor="file" className="text-[13px] font-semibold text-ink-soft">
          Spreadsheet or PDF list
        </label>
        <input
          id="file"
          name="file"
          type="file"
          required
          accept=".csv,.xlsx,.xls,.pdf"
          className="focus-ring w-full rounded-lg border border-line bg-paper-dim px-3.5 py-2.5 text-[15px]"
        />
        <p className="text-sm text-ink-soft">
          .csv or .xlsx files should have columns like Title, Author, Genre, ISBN, Shelf Location, and Notes.
          PDFs are parsed best-effort — you&apos;ll get a chance to fix each row before anything is saved.
        </p>
      </div>

      <ParseSubmitButton />
    </form>
  );
}

function PreviewStep({
  rows,
  warning,
  onRowsChange,
  onCancel,
  onImported,
}: {
  rows: ParsedRow[];
  warning?: string;
  onRowsChange: (rows: ParsedRow[]) => void;
  onCancel: () => void;
  onImported: (count: number) => void;
}) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function updateRow(index: number, field: keyof ParsedRow, value: string) {
    const next = rows.slice();
    next[index] = { ...next[index], [field]: value };
    onRowsChange(next);
  }

  function removeRow(index: number) {
    onRowsChange(rows.filter((_, i) => i !== index));
  }

  function handleConfirm() {
    setError(null);
    startTransition(async () => {
      const result = await confirmImportAction(rows);
      if (result.error) {
        setError(result.error);
        return;
      }
      onImported(result.insertedCount ?? 0);
    });
  }

  return (
    <div className="flex flex-col gap-6">
      {warning && (
        <p className="rounded-lg bg-gold-soft px-4 py-3 text-[14px] text-gold" role="status">
          {warning}
        </p>
      )}
      {error && <ErrorMessage message={error} />}

      <p className="text-[14.5px] text-ink-soft">
        {rows.length} {rows.length === 1 ? "row" : "rows"} found. Review and edit before importing —
        rows without a title and author will be skipped.
      </p>

      <div className="overflow-x-auto rounded-xl border border-line shadow-card">
        <table className="w-full min-w-[900px] text-left text-[14px]">
          <thead className="bg-paper-dim text-ink-faint">
            <tr>
              {FIELDS.map((field) => (
                <th key={field.key} className="px-3 py-3 text-[11.5px] font-bold uppercase tracking-wide">
                  {field.label}
                </th>
              ))}
              <th className="px-3 py-3 text-[11.5px] font-bold uppercase tracking-wide">Remove</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => (
              <tr key={index} className="border-t border-line">
                {FIELDS.map((field) => (
                  <td key={field.key} className="px-3 py-2">
                    <input
                      type="text"
                      value={row[field.key]}
                      onChange={(e) => updateRow(index, field.key, e.target.value)}
                      className={`${inputClass} py-2 text-[14px]`}
                    />
                  </td>
                ))}
                <td className="px-3 py-2">
                  <button
                    type="button"
                    onClick={() => removeRow(index)}
                    className="focus-ring text-[13.5px] font-semibold text-critical hover:underline"
                  >
                    Remove
                  </button>
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={FIELDS.length + 1} className="px-4 py-6 text-center text-ink-soft">
                  No rows left. Start over to upload another file.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="flex flex-wrap gap-3">
        <button type="button" onClick={handleConfirm} disabled={isPending || rows.length === 0} className={primaryBtn}>
          {isPending ? "Importing…" : "Import these books"}
        </button>
        <button type="button" onClick={onCancel} disabled={isPending} className={ghostBtn}>
          Start over
        </button>
      </div>
    </div>
  );
}

export function ImportWizard() {
  const [uploadKey, setUploadKey] = useState(0);
  const [rows, setRows] = useState<ParsedRow[] | null>(null);
  const [warning, setWarning] = useState<string | undefined>();
  const [insertedCount, setInsertedCount] = useState<number | null>(null);

  function reset() {
    setRows(null);
    setWarning(undefined);
    setInsertedCount(null);
    setUploadKey((k) => k + 1);
  }

  if (insertedCount !== null) {
    return (
      <div className="flex flex-col gap-6">
        <SuccessMessage
          message={`Imported ${insertedCount} ${insertedCount === 1 ? "book" : "books"} into the catalog.`}
        />
        <div className="flex flex-wrap gap-3">
          <button type="button" onClick={reset} className={primaryBtn}>
            Import another file
          </button>
          <Link href="/admin/books" className={ghostBtn}>
            Go to Manage Books
          </Link>
        </div>
      </div>
    );
  }

  if (rows) {
    return (
      <PreviewStep
        rows={rows}
        warning={warning}
        onRowsChange={setRows}
        onCancel={reset}
        onImported={setInsertedCount}
      />
    );
  }

  return (
    <UploadStep
      key={uploadKey}
      onParsed={(parsedRows, parsedWarning) => {
        setRows(parsedRows);
        setWarning(parsedWarning);
      }}
    />
  );
}
