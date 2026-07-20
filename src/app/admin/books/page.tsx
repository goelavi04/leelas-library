import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { searchBooks, PAGE_SIZE } from "@/lib/books";
import { StatusBadge } from "@/components/status-badge";
import { PencilIcon, PlusIcon, SearchIcon, TrashIcon } from "@/components/icons";

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
          <h1 className="text-3xl font-bold tracking-tight text-ink">Manage Books</h1>
          <p className="mt-2 text-ink-soft">
            {total} {total === 1 ? "book" : "books"} total
          </p>
        </div>
        <Link
          href="/admin/books/new"
          className="focus-ring flex items-center gap-2 rounded-lg bg-accent px-5 py-2.5 text-[14.5px] font-semibold text-white shadow-card hover:bg-accent-hover"
        >
          <PlusIcon className="h-4 w-4" />
          Add a Book
        </Link>
      </div>

      <form method="get" action="/admin/books" className="mt-6 flex gap-3">
        <label htmlFor="q" className="sr-only">
          Search books
        </label>
        <div className="relative min-w-0 flex-1">
          <SearchIcon className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-faint" />
          <input
            id="q"
            name="q"
            type="search"
            defaultValue={query}
            placeholder="Search by title, author, genre, or ISBN…"
            className="focus-ring w-full rounded-lg border border-line bg-paper-dim py-2.5 pl-10 pr-4 text-[15px]"
          />
        </div>
        <button
          type="submit"
          className="focus-ring rounded-lg border border-line px-5 py-2.5 text-[14.5px] font-semibold hover:bg-paper-dim"
        >
          Search
        </button>
      </form>

      <div className="mt-8 overflow-x-auto rounded-xl border border-line shadow-card">
        <table className="w-full min-w-[900px] text-left text-[14.5px]">
          <thead className="bg-paper-dim text-ink-faint">
            <tr>
              <th className="px-4 py-3 text-[11.5px] font-bold uppercase tracking-wide">Title</th>
              <th className="px-4 py-3 text-[11.5px] font-bold uppercase tracking-wide">Author</th>
              <th className="px-4 py-3 text-[11.5px] font-bold uppercase tracking-wide">Genre</th>
              <th className="px-4 py-3 text-[11.5px] font-bold uppercase tracking-wide">Shelf</th>
              <th className="px-4 py-3 text-[11.5px] font-bold uppercase tracking-wide">Status</th>
              <th className="px-4 py-3 text-right text-[11.5px] font-bold uppercase tracking-wide">Actions</th>
            </tr>
          </thead>
          <tbody>
            {books.map((book) => (
              <tr key={book.id} className="border-t border-line">
                <td className="px-4 py-3 font-medium text-ink">
                  <Link href={`/catalog/${book.id}`} className="hover:text-accent hover:underline">
                    {book.title}
                  </Link>
                </td>
                <td className="px-4 py-3 text-ink-soft">{book.author}</td>
                <td className="px-4 py-3 text-ink-soft">{book.genre ?? "—"}</td>
                <td className="px-4 py-3 text-ink-soft">{book.shelf_location ?? "—"}</td>
                <td className="px-4 py-3">
                  <StatusBadge status={book.status} />
                </td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-1">
                    {book.status === "available" && (
                      <Link
                        href={`/admin/loans/new?bookId=${book.id}`}
                        className="focus-ring rounded-lg px-2.5 py-1.5 text-[13px] font-semibold text-gold hover:bg-gold-soft"
                      >
                        Check out
                      </Link>
                    )}
                    <Link
                      href={`/admin/books/${book.id}/edit`}
                      aria-label={`Edit ${book.title}`}
                      className="focus-ring flex h-8 w-8 items-center justify-center rounded-lg text-ink-faint hover:bg-paper-dim hover:text-ink"
                    >
                      <PencilIcon className="h-4 w-4" />
                    </Link>
                    <Link
                      href={`/admin/books/${book.id}/delete`}
                      aria-label={`Delete ${book.title}`}
                      className="focus-ring flex h-8 w-8 items-center justify-center rounded-lg text-ink-faint hover:bg-critical-soft hover:text-critical"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </Link>
                  </div>
                </td>
              </tr>
            ))}
            {books.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-center text-ink-soft">
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
            <Link
              href={`/admin/books?q=${encodeURIComponent(query)}&page=${page - 1}`}
              className="focus-ring rounded-lg border border-line px-4 py-2 text-[14px] font-semibold hover:bg-paper-dim"
            >
              ← Previous
            </Link>
          ) : (
            <span className="rounded-lg border border-line px-4 py-2 text-[14px] text-ink-faint">← Previous</span>
          )}
          <span className="text-[14px] text-ink-soft">
            Page {page} of {totalPages}
          </span>
          {page < totalPages ? (
            <Link
              href={`/admin/books?q=${encodeURIComponent(query)}&page=${page + 1}`}
              className="focus-ring rounded-lg border border-line px-4 py-2 text-[14px] font-semibold hover:bg-paper-dim"
            >
              Next →
            </Link>
          ) : (
            <span className="rounded-lg border border-line px-4 py-2 text-[14px] text-ink-faint">Next →</span>
          )}
        </nav>
      )}
    </div>
  );
}
