import Link from "next/link";
import { ImportWizard } from "@/components/import-wizard";

export const metadata = { title: "Import Books" };

export default function ImportBooksPage() {
  return (
    <div className="max-w-4xl">
      <Link href="/admin" className="focus-ring text-[13.5px] font-semibold text-ink-soft hover:text-accent">
        ← Back to Admin
      </Link>
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
