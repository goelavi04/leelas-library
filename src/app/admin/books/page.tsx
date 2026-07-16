import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { searchBooks, PAGE_SIZE } from "@/lib/books";
import { StatusBadge } from "@/components/status-badge";

export const metadata = { title: "Manage Books" };

export default async function AdminBooksPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string }>;
}) {
  const params = await searchParams;
  const query = params.q ?? "";
  const page = Math.max(1, Number(params.page ?? "1") || 1);

  const supabase = await createClient();
  const { books, total } = await searchBooks(supabase, { query, availableOnly: false, page });
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-4xl font-semibold text-green-deep">Manage Books</h1>
          <p className="mt-2 text-ink-soft">{total} {total === 1 ? "book" : "books"} total</p>
        </div>
        <Link
          href="/admin/books/new"
          className="focus-ring rounded-md bg-green-deep px-6 py-3 text-lg font-medium text-paper hover:bg-green-deep-hover"
        >
          + Add a Book
        </Link>
      </div>

      <form method="get" action="/admin/books" className="mt-6 flex gap-3">
        <label htmlFor="q" className="sr-only">Search books</label>
        <input
          id="q"
          name="q"
          type="search"
          defaultValue={query}
          placeholder="Search by title, author, genre, or ISBN…"
          className="focus-ring min-w-0 flex-1 rounded-md border border-line bg-white px-4 py-3 text-[17px]"
        />
        <button type="submit" className="focus-ring rounded-md border border-line px-6 py-3 text-[17px] font-medium hover:bg-paper-dim">
          Search
        </button>
      </form>

      <div className="mt-8 overflow-x-auto rounded-lg border border-line">
        <table className="w-full min-w-[700px] text-left text-[15px]">
          <thead className="bg-paper-dim text-ink-soft">
            <tr>
              <th className="px-4 py-3 font-medium">Title</th>
              <th className="px-4 py-3 font-medium">Author</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {books.map((book) => (
              <tr key={book.id} className="border-t border-line">
                <td className="px-4 py-3 font-medium text-ink">{book.title}</td>
                <td className="px-4 py-3 text-ink-soft">{book.author}</td>
                <td className="px-4 py-3">
                  <StatusBadge status={book.status} />
                </td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-4">
                    {book.status === "available" && (
                      <Link href={`/admin/loans/new?bookId=${book.id}`} className="focus-ring font-medium text-brass underline">
                        Check out
                      </Link>
                    )}
                    <Link href={`/admin/books/${book.id}/edit`} className="focus-ring font-medium text-green-deep underline">
                      Edit
                    </Link>
                    <Link href={`/admin/books/${book.id}/delete`} className="focus-ring font-medium text-terracotta underline">
                      Delete
                    </Link>
                  </div>
                </td>
              </tr>
            ))}
            {books.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-6 text-center text-ink-soft">
                  No books found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <nav className="mt-8 flex items-center justify-center gap-4" aria-label="Pagination">
          {page > 1 ? (
            <Link href={`/admin/books?q=${encodeURIComponent(query)}&page=${page - 1}`} className="focus-ring rounded-md border border-line px-4 py-2 text-[15px] font-medium hover:bg-paper-dim">
              ← Previous
            </Link>
          ) : (
            <span className="rounded-md border border-line px-4 py-2 text-[15px] text-ink-soft/50">← Previous</span>
          )}
          <span className="text-[15px] text-ink-soft">Page {page} of {totalPages}</span>
          {page < totalPages ? (
            <Link href={`/admin/books?q=${encodeURIComponent(query)}&page=${page + 1}`} className="focus-ring rounded-md border border-line px-4 py-2 text-[15px] font-medium hover:bg-paper-dim">
              Next →
            </Link>
          ) : (
            <span className="rounded-md border border-line px-4 py-2 text-[15px] text-ink-soft/50">Next →</span>
          )}
        </nav>
      )}
    </div>
  );
}
