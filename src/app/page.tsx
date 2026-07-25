import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { coverImageUrl } from "@/lib/books";
import { BookCard } from "@/components/book-card";
import { BookIcon, SearchIcon, TrendingUpIcon, GridIcon, ArrowRightIcon } from "@/components/icons";

const RECENT_BOOKS_LIMIT = 8;
const GENRE_SAMPLE_LIMIT = 1000;
const GENRE_CHIP_LIMIT = 8;

export default async function HomePage() {
  const supabase = await createClient();
  const [{ count: total }, { count: available }, { data: recentBooks }, { data: genreRows }] = await Promise.all([
    supabase.from("books").select("*", { count: "exact", head: true }),
    supabase.from("books").select("*", { count: "exact", head: true }).eq("status", "available"),
    supabase.from("books").select("*").order("created_at", { ascending: false }).limit(RECENT_BOOKS_LIMIT),
    supabase.from("books").select("genre").not("genre", "is", null).limit(GENRE_SAMPLE_LIMIT),
  ]);

  const genres = [...new Set((genreRows ?? []).map((row) => row.genre).filter(Boolean) as string[])].sort((a, b) =>
    a.localeCompare(b)
  );

  return (
    <div>
      <section className="bg-accent px-4 py-14 text-center sm:px-6 sm:py-20 md:py-24">
        <div className="mx-auto max-w-xl">
          <h1 className="font-display text-xl font-bold leading-tight text-white text-balance sm:text-2xl md:text-3xl">
            A home for every story we&rsquo;ve collected — where every book finds its reader.
          </h1>
          <p className="mt-4 text-[15px] text-white/80 sm:text-[16.5px]">
            Browse the shelves, see what&rsquo;s in, and keep track of what you&rsquo;re reading —
            all in one place.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link
              href="/catalog"
              className="focus-ring flex items-center gap-2 rounded-lg bg-gold px-5 py-2.5 text-[14.5px] font-semibold text-[#20140a] shadow-card hover:bg-gold-hover"
            >
              <SearchIcon className="h-4 w-4" />
              Browse the catalog
            </Link>
          </div>
        </div>
      </section>

      {total !== null && total > 0 && (
        <section className="border-b border-line bg-paper-dim px-4 py-10 sm:px-6">
          <p className="mx-auto max-w-2xl text-center text-[13px] font-bold uppercase tracking-wide text-ink-faint">
            Collection at a glance
          </p>
          <div className="mx-auto mt-5 grid max-w-2xl grid-cols-3 gap-4">
            <div className="rounded-xl border border-line shadow-card bg-paper p-5">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent-soft text-accent">
                <BookIcon className="h-4 w-4" />
              </span>
              <p className="mt-3 text-2xl font-bold text-ink">{total}</p>
              <p className="text-[13px] text-ink-soft">Total books</p>
            </div>
            <div className="rounded-xl border border-line shadow-card bg-paper p-5">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-good-soft text-good">
                <TrendingUpIcon className="h-4 w-4" />
              </span>
              <p className="mt-3 text-2xl font-bold text-ink">{available}</p>
              <p className="text-[13px] text-ink-soft">Available now</p>
            </div>
            <div className="rounded-xl border border-line shadow-card bg-paper p-5">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gold-soft text-gold">
                <GridIcon className="h-4 w-4" />
              </span>
              <p className="mt-3 text-2xl font-bold text-ink">{genres.length}</p>
              <p className="text-[13px] text-ink-soft">Genres</p>
            </div>
          </div>
        </section>
      )}

      {recentBooks && recentBooks.length > 0 && (
        <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-ink">Recently added</h2>
              <p className="mt-1.5 text-ink-soft">The newest additions to the shelves.</p>
            </div>
            <Link
              href="/catalog"
              className="focus-ring flex items-center gap-1.5 text-[14px] font-semibold text-accent hover:underline"
            >
              View full catalog
              <ArrowRightIcon className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
            {recentBooks.map((book) => (
              <BookCard key={book.id} book={book} coverUrl={coverImageUrl(supabase, book.cover_image_path)} />
            ))}
          </div>
        </section>
      )}

      {genres.length > 0 && (
        <section className="border-t border-line bg-paper-dim px-4 py-14 sm:px-6">
          <div className="mx-auto max-w-6xl">
            <h2 className="text-2xl font-bold tracking-tight text-ink">Browse by genre</h2>
            <p className="mt-1.5 text-ink-soft">Jump straight to what you&rsquo;re in the mood for.</p>

            <div className="mt-6 flex flex-wrap gap-2.5">
              {genres.slice(0, GENRE_CHIP_LIMIT).map((genre) => (
                <Link
                  key={genre}
                  href={`/catalog?q=${encodeURIComponent(genre)}`}
                  className="focus-ring rounded-full border border-line bg-paper px-4 py-2 text-[14px] font-medium text-ink-soft shadow-card transition hover:border-accent hover:text-accent"
                >
                  {genre}
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
