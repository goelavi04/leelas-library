import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { BookIcon, SearchIcon, TrendingUpIcon } from "@/components/icons";

export default async function HomePage() {
  const supabase = await createClient();
  const [{ count: total }, { count: available }] = await Promise.all([
    supabase.from("books").select("*", { count: "exact", head: true }),
    supabase.from("books").select("*", { count: "exact", head: true }).eq("status", "available"),
  ]);

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
            <Link
              href="/signup"
              className="focus-ring rounded-lg border border-white/35 px-5 py-2.5 text-[14.5px] font-semibold text-white hover:bg-white/10"
            >
              Create an account
            </Link>
          </div>
        </div>
      </section>

      {total !== null && total > 0 && (
        <section className="border-b border-line bg-paper-dim px-4 py-10 sm:px-6">
          <p className="mx-auto max-w-md text-center text-[13px] font-bold uppercase tracking-wide text-ink-faint">
            Collection at a glance
          </p>
          <div className="mx-auto mt-5 grid max-w-md grid-cols-2 gap-4">
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
          </div>
        </section>
      )}
    </div>
  );
}
