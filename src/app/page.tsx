import Link from "next/link";
import { ShelfDivider } from "@/components/shelf-divider";

export default function HomePage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
      <div className="max-w-2xl">
        <p className="font-serif text-lg text-brass">Welcome to</p>
        <h1 className="mt-1 font-serif text-5xl font-semibold text-green-deep sm:text-6xl">
          Leela&rsquo;s Library
        </h1>
        <p className="mt-6 text-lg text-ink-soft">
          Browse our family&rsquo;s collection, see what&rsquo;s available, and
          check your own borrowing history — all in one simple place.
        </p>

        <div className="mt-10 flex flex-wrap gap-4">
          <Link
            href="/catalog"
            className="focus-ring rounded-md bg-green-deep px-6 py-3 text-lg font-medium text-paper hover:bg-green-deep-hover"
          >
            Browse the catalog
          </Link>
          <Link
            href="/signup"
            className="focus-ring rounded-md border border-line px-6 py-3 text-lg font-medium text-ink hover:bg-paper-dim"
          >
            Create an account
          </Link>
        </div>
      </div>

      <div className="mt-16">
        <ShelfDivider />
      </div>
    </div>
  );
}
