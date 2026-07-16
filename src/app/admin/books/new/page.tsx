import Link from "next/link";
import { BookForm } from "@/components/book-form";
import { createBook } from "@/app/admin/books/actions";

export const metadata = { title: "Add a Book" };

export default function NewBookPage() {
  return (
    <div className="max-w-2xl">
      <Link href="/admin/books" className="focus-ring text-[15px] font-medium text-green-deep underline">
        ← Back to Manage Books
      </Link>
      <h1 className="mt-4 font-serif text-4xl font-semibold text-green-deep">Add a Book</h1>

      <div className="mt-8">
        <BookForm action={createBook} submitLabel="Add book" savingLabel="Adding…" />
      </div>
    </div>
  );
}
