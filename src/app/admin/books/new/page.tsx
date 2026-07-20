import Link from "next/link";
import { BookForm } from "@/components/book-form";
import { createBook } from "@/app/admin/books/actions";

export const metadata = { title: "Add a Book" };

export default function NewBookPage() {
  return (
    <div className="max-w-2xl">
      <Link href="/admin/books" className="focus-ring text-[13.5px] font-semibold text-ink-soft hover:text-accent">
        ← Back to Manage Books
      </Link>
      <h1 className="mt-3 text-2xl font-bold tracking-tight text-ink">Add a Book</h1>

      <div className="mt-8">
        <BookForm action={createBook} submitLabel="Add book" savingLabel="Adding…" />
      </div>
    </div>
  );
}
