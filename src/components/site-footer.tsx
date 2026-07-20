import { BookIcon } from "@/components/icons";

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-line">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-6 sm:px-6">
        <div className="flex items-center gap-1.5 text-[13.5px] font-semibold text-ink-faint">
          <BookIcon className="h-3.5 w-3.5" strokeWidth={1.6} />
          Leela&rsquo;s Library
        </div>
        <p className="font-display text-[13px] italic text-ink-faint">
          A home for our books, and the people who borrow them.
        </p>
      </div>
    </footer>
  );
}
