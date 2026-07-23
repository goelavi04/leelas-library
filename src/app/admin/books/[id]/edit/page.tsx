import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { coverImageUrl } from "@/lib/books";
import { BookForm } from "@/components/book-form";
import { updateBook } from "@/app/admin/books/actions";
import { BackButton } from "@/components/back-button";

export const metadata = { title: "Edit Book" };

export default async function EditBookPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: book } = await supabase.from("books").select("*").eq("id", id).single();

  if (!book) notFound();

  const boundUpdate = updateBook.bind(null, book.id);

  return (
    <div className="max-w-2xl">
      <BackButton fallbackHref="/admin/books" label="Back to Manage Books" />
      <h1 className="mt-3 text-2xl font-bold tracking-tight text-ink">Edit &ldquo;{book.title}&rdquo;</h1>

      <div className="mt-8">
        <BookForm
          action={boundUpdate}
          submitLabel="Save changes"
          savingLabel="Saving…"
          initialValues={{
            title: book.title,
            author: book.author,
            genre: book.genre,
            isbn: book.isbn,
            shelfLocation: book.shelf_location,
            notes: book.notes,
          }}
          existingCoverUrl={coverImageUrl(supabase, book.cover_image_path)}
        />
      </div>
    </div>
  );
}
