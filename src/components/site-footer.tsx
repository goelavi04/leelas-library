import { BookIcon } from "@/components/icons";

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-line">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-6 sm:px-6">
        <div className="flex items-center gap-2 text-[13.5px] font-semibold text-ink-faint">
          <span className="flex h-5 w-5 items-center justify-center rounded-md bg-gradient-to-br from-accent to-teal text-white">
            <BookIcon className="h-3 w-3" />
          </span>
          Leela&rsquo;s Library
        </div>
        <p className="text-[12.5px] text-ink-faint">
          A home for our books, and the people who borrow them.
        </p>
      </div>
    </footer>
  );
}
