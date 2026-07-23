import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { confirmDeleteBook } from "@/app/admin/books/actions";
import { DeleteBookConfirm } from "@/components/delete-book-confirm";
import { BackButton } from "@/components/back-button";

export const metadata = { title: "Delete Book" };

export default async function DeleteBookPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: book } = await supabase.from("books").select("id, title").eq("id", id).single();

  if (!book) notFound();

  const boundDelete = confirmDeleteBook.bind(null, book.id);

  return (
    <div>
      <BackButton fallbackHref="/admin/books" />
      <div className="mt-3">
        <DeleteBookConfirm bookTitle={book.title} action={boundDelete} />
      </div>
    </div>
  );
}
