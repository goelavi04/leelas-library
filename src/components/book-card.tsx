import Link from "next/link";
import Image from "next/image";
import type { Book } from "@/lib/supabase/types";
import { StatusBadge } from "@/components/status-badge";

export function BookCard({ book, coverUrl }: { book: Book; coverUrl: string | null }) {
  return (
    <Link
      href={`/catalog/${book.id}`}
      className="focus-ring group flex flex-col overflow-hidden rounded-lg border border-line bg-white/60 transition hover:border-brass hover:shadow-sm"
    >
      <div className="flex aspect-[3/4] items-center justify-center bg-paper-dim">
        {coverUrl ? (
          <Image
            src={coverUrl}
            alt=""
            width={240}
            height={320}
            className="h-full w-full object-cover"
          />
        ) : (
          <span className="font-serif text-3xl text-brass-light">
            {book.title.charAt(0).toUpperCase()}
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-2 p-4">
        <h3 className="font-serif text-lg font-semibold leading-snug text-ink group-hover:text-green-deep">
          {book.title}
        </h3>
        <p className="text-[15px] text-ink-soft">{book.author}</p>
        <div className="mt-auto flex items-center justify-between gap-2 pt-2">
          {book.genre && <span className="text-sm text-ink-soft">{book.genre}</span>}
          <StatusBadge status={book.status} />
        </div>
      </div>
    </Link>
  );
}
