import { ImportWizard } from "@/components/import-wizard";
import { BackButton } from "@/components/back-button";

export const metadata = { title: "Import Books" };

export default function ImportBooksPage() {
  return (
    <div className="max-w-4xl">
      <BackButton fallbackHref="/admin" label="Back to Admin" />
      <h1 className="mt-3 text-2xl font-bold tracking-tight text-ink">Import Books</h1>
      <p className="mt-2 text-ink-soft">
        Add many books at once from a .csv, .xlsx, or .pdf list. Nothing is saved until you review and confirm.
      </p>

      <div className="mt-8">
        <ImportWizard />
      </div>
    </div>
  );
}
