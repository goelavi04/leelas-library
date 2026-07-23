import { BookForm } from "@/components/book-form";
import { createBook } from "@/app/admin/books/actions";
import { BackButton } from "@/components/back-button";

export const metadata = { title: "Add a Book" };

export default function NewBookPage() {
  return (
    <div className="max-w-2xl">
      <BackButton fallbackHref="/admin/books" label="Back to Manage Books" />
      <h1 className="mt-3 text-2xl font-bold tracking-tight text-ink">Add a Book</h1>

      <div className="mt-8">
        <BookForm action={createBook} submitLabel="Add book" savingLabel="Adding…" />
      </div>
    </div>
  );
}
