import Link from "next/link";
import { getSession } from "@/lib/auth";
import { LogoutButton } from "@/components/logout-button";
import { BookIcon, ClockIcon, GridIcon } from "@/components/icons";

function initials(name: string | null, email: string | null): string {
  if (name) {
    return name
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() ?? "")
      .join("");
  }
  return email ? email[0].toUpperCase() : "?";
}

export async function SiteHeader() {
  const session = await getSession();

  return (
    <header className="sticky top-0 z-10 border-b border-line bg-paper/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3.5 sm:px-6">
        <Link href="/" className="focus-ring flex items-center gap-2.5 rounded-md">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-accent to-teal text-white">
            <BookIcon className="h-[18px] w-[18px]" />
          </span>
          <span className="text-[16px] font-bold tracking-tight text-ink">
            Leela&rsquo;s Library
          </span>
        </Link>

        <nav className="flex items-center gap-1 sm:gap-1.5">
          <Link
            href="/catalog"
            className="focus-ring flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[14px] font-medium text-ink-soft hover:bg-paper-dim hover:text-ink"
          >
            <BookIcon className="h-4 w-4" />
            Catalog
          </Link>

          {session && (
            <Link
              href="/dashboard"
              className="focus-ring flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[14px] font-medium text-ink-soft hover:bg-paper-dim hover:text-ink"
            >
              <ClockIcon className="h-4 w-4" />
              My Books
            </Link>
          )}

          {session?.profile.role === "admin" && (
            <Link
              href="/admin"
              className="focus-ring flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[14px] font-medium text-ink-soft hover:bg-paper-dim hover:text-ink"
            >
              <GridIcon className="h-4 w-4" />
              Admin
            </Link>
          )}

          {session ? (
            <div className="ml-1 flex items-center gap-1.5 rounded-full border border-line py-1 pl-1 pr-1.5">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-accent to-teal text-[11px] font-semibold text-white">
                {initials(session.profile.full_name, session.profile.email)}
              </span>
              <LogoutButton />
            </div>
          ) : (
            <>
              <Link
                href="/login"
                className="focus-ring rounded-full px-3 py-1.5 text-[14px] font-medium text-ink-soft hover:bg-paper-dim hover:text-ink"
              >
                Log in
              </Link>
              <Link
                href="/signup"
                className="focus-ring rounded-lg bg-accent px-4 py-2 text-[14px] font-semibold text-white hover:bg-accent-hover"
              >
                Sign up
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
