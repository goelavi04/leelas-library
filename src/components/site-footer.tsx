import { BookIcon, MailIcon, MapPinIcon, PhoneIcon } from "@/components/icons";

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-line">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-10 sm:flex-row sm:justify-between sm:px-6">
        <div>
          <div className="flex items-center gap-1.5 text-[13.5px] font-semibold text-ink-faint">
            <BookIcon className="h-3.5 w-3.5" strokeWidth={1.6} />
            Leela&rsquo;s Library
          </div>
          <p className="font-display mt-2 max-w-xs text-[13px] italic text-ink-faint">
            A home for our books, and the people who borrow them.
          </p>
        </div>

        <div>
          <p className="text-[11.5px] font-bold uppercase tracking-wide text-ink-faint">Contact us</p>
          <ul className="mt-3 flex flex-col gap-2 text-[13.5px] text-ink-soft">
            <li className="flex items-center gap-2">
              <MapPinIcon className="h-3.5 w-3.5 shrink-0 text-ink-faint" />
              123 Book Street, Springfield
            </li>
            <li className="flex items-center gap-2">
              <PhoneIcon className="h-3.5 w-3.5 shrink-0 text-ink-faint" />
              (555) 010-2026
            </li>
            <li className="flex items-center gap-2">
              <MailIcon className="h-3.5 w-3.5 shrink-0 text-ink-faint" />
              hello@leelaslibrary.example
            </li>
          </ul>
        </div>
      </div>
    </footer>
  );
}
