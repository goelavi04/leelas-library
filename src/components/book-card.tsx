import Link from "next/link";
import Image from "next/image";
import type { Book } from "@/lib/supabase/types";
import { StatusBadge } from "@/components/status-badge";

export function BookCard({ book, coverUrl }: { book: Book; coverUrl: string | null }) {
  return (
    <Link
      href={`/catalog/${book.id}`}
      className="focus-ring group flex flex-col overflow-hidden rounded-xl border border-line shadow-card bg-paper transition hover:shadow-md hover:-translate-y-0.5"
    >
      <div className="flex aspect-[3/4] items-center justify-center bg-accent-soft">
        {coverUrl ? (
          <Image
            src={coverUrl}
            alt=""
            width={240}
            height={320}
            className="h-full w-full object-cover"
          />
        ) : (
          <span className="font-display text-3xl font-bold text-accent/70">
            {book.title.charAt(0).toUpperCase()}
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-1.5 p-4">
        <h3 className="text-[15px] font-semibold leading-snug text-ink group-hover:text-accent">
          {book.title}
        </h3>
        <p className="text-[13.5px] text-ink-soft">{book.author}</p>
        <div className="mt-auto flex items-center justify-between gap-2 pt-2">
          {book.genre && <span className="text-[12.5px] text-ink-faint">{book.genre}</span>}
          <StatusBadge status={book.status} />
        </div>
      </div>
    </Link>
  );
}
