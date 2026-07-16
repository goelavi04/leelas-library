import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { searchBooks, coverImageUrl, PAGE_SIZE } from "@/lib/books";
import { BookCard } from "@/components/book-card";

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
      <h1 className="font-serif text-4xl font-semibold text-green-deep">Catalog</h1>
      <p className="mt-2 text-ink-soft">
        {total} {total === 1 ? "book" : "books"} in the library
      </p>

      <form method="get" action="/catalog" className="mt-6 flex flex-wrap items-center gap-3">
        <label htmlFor="q" className="sr-only">
          Search by title, author, genre, or ISBN
        </label>
        <input
          id="q"
          name="q"
          type="search"
          defaultValue={query}
          placeholder="Search by title, author, genre, or ISBN…"
          className="focus-ring min-w-0 flex-1 rounded-md border border-line bg-white px-4 py-3 text-[17px] text-ink placeholder:text-ink-soft/60"
        />
        <label className="flex items-center gap-2 text-[15px] text-ink-soft">
          <input
            type="checkbox"
            name="available"
            value="1"
            defaultChecked={availableOnly}
            className="h-5 w-5 rounded border-line"
          />
          Available only
        </label>
        <button
          type="submit"
          className="focus-ring rounded-md bg-green-deep px-6 py-3 text-[17px] font-medium text-paper hover:bg-green-deep-hover"
        >
          Search
        </button>
      </form>

      {books.length === 0 ? (
        <p className="mt-12 text-lg text-ink-soft">
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
            <Link href={pageHref(page - 1)} className="focus-ring rounded-md border border-line px-4 py-2 text-[15px] font-medium hover:bg-paper-dim">
              ← Previous
            </Link>
          ) : (
            <span className="rounded-md border border-line px-4 py-2 text-[15px] text-ink-soft/50">← Previous</span>
          )}
          <span className="text-[15px] text-ink-soft">
            Page {page} of {totalPages}
          </span>
          {page < totalPages ? (
            <Link href={pageHref(page + 1)} className="focus-ring rounded-md border border-line px-4 py-2 text-[15px] font-medium hover:bg-paper-dim">
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
