import { ShelfDivider } from "@/components/shelf-divider";

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-line bg-paper-dim">
      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
        <ShelfDivider />
        <p className="mt-3 text-sm text-ink-soft">
          Leela&rsquo;s Library — a home for our books, and the people who borrow them.
        </p>
      </div>
    </footer>
  );
}
