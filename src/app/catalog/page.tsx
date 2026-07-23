import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { searchBooks, coverImageUrl, PAGE_SIZE } from "@/lib/books";
import { BookCard } from "@/components/book-card";
import { SearchIcon } from "@/components/icons";
import { BackButton } from "@/components/back-button";
import { ExportPdfButton } from "@/components/export-pdf-button";

export const metadata = { title: "Catalog" };

export default async function CatalogPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; available?: string; page?: string }>;
}) {
  const params = await searchParams;
  const query = params.q ?? "";
  const availableOnly = params.available === "1";
  const page = Math.max(1, Number(params.page ?? "1") || 1);

  const supabase = await createClient();
  const { books, total } = await searchBooks(supabase, { query, availableOnly, page });

  if (query && books.length === 0) {
    await supabase.from("zero_result_searches").insert({ query: query.slice(0, 200) });
  }

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  function pageHref(targetPage: number) {
    const sp = new URLSearchParams();
    if (query) sp.set("q", query);
    if (availableOnly) sp.set("available", "1");
    sp.set("page", String(targetPage));
    return `/catalog?${sp.toString()}`;
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <BackButton fallbackHref="/" />
      <div className="mt-3 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-ink">Catalog</h1>
          <p className="mt-2 text-ink-soft">
            {total} {total === 1 ? "book" : "books"} in the library
          </p>
        </div>
        <ExportPdfButton
          title="Catalog"
          subtitle={query ? `Search: "${query}"` : undefined}
          columns={["Title", "Author", "Genre", "Status"]}
          rows={books.map((book) => [
            book.title,
            book.author,
            book.genre ?? "—",
            book.status === "available" ? "Available" : "Checked out",
          ])}
          filename="catalog.pdf"
        />
      </div>

      <form method="get" action="/catalog" className="mt-6 flex flex-wrap items-center gap-3">
        <label htmlFor="q" className="sr-only">
          Search by title, author, genre, or ISBN
        </label>
        <div className="relative min-w-0 flex-1">
          <SearchIcon className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-faint" />
          <input
            id="q"
            name="q"
            type="search"
            defaultValue={query}
            placeholder="Search by title, author, genre, or ISBN…"
            className="focus-ring w-full rounded-lg border border-line bg-paper-dim py-2.5 pl-10 pr-4 text-[15px] text-ink placeholder:text-ink-faint"
          />
        </div>
        <label className="flex items-center gap-2 text-[14px] text-ink-soft">
          <input
            type="checkbox"
            name="available"
            value="1"
            defaultChecked={availableOnly}
            className="h-4 w-4 rounded border-line accent-accent"
          />
          Available only
        </label>
        <button
          type="submit"
          className="focus-ring rounded-lg bg-accent px-5 py-2.5 text-[14.5px] font-semibold text-white shadow-card hover:bg-accent-hover"
        >
          Search
        </button>
      </form>

      {books.length === 0 ? (
        <p className="mt-12 text-[15px] text-ink-soft">
          No books matched your search. Try a different title, author, or genre.
        </p>
      ) : (
        <div className="mt-8 grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
          {books.map((book) => (
            <BookCard key={book.id} book={book} coverUrl={coverImageUrl(supabase, book.cover_image_path)} />
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <nav className="mt-10 flex items-center justify-center gap-4" aria-label="Pagination">
          {page > 1 ? (
            <Link
              href={pageHref(page - 1)}
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
              href={pageHref(page + 1)}
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
