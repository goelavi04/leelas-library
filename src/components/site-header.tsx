import Link from "next/link";
import { getSession } from "@/lib/auth";
import { LogoutButton } from "@/components/logout-button";

export async function SiteHeader() {
  const session = await getSession();

  return (
    <header className="border-b border-line bg-paper">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
        <Link href="/" className="flex items-baseline gap-2 focus-ring rounded-md">
          <span className="font-serif text-2xl font-semibold text-green-deep">
            Leela&rsquo;s Library
          </span>
        </Link>

        <nav className="flex items-center gap-1 sm:gap-2">
          <Link
            href="/catalog"
            className="focus-ring rounded-md px-3 py-2 text-[15px] font-medium text-ink-soft hover:text-ink"
          >
            Catalog
          </Link>

          {session && (
            <Link
              href="/dashboard"
              className="focus-ring rounded-md px-3 py-2 text-[15px] font-medium text-ink-soft hover:text-ink"
            >
              My Books
            </Link>
          )}

          {session?.profile.role === "admin" && (
            <Link
              href="/admin"
              className="focus-ring rounded-md px-3 py-2 text-[15px] font-medium text-ink-soft hover:text-ink"
            >
              Admin
            </Link>
          )}

          {session ? (
            <LogoutButton />
          ) : (
            <>
              <Link
                href="/login"
                className="focus-ring rounded-md px-3 py-2 text-[15px] font-medium text-ink-soft hover:text-ink"
              >
                Log in
              </Link>
              <Link
                href="/signup"
                className="focus-ring rounded-md bg-green-deep px-4 py-2 text-[15px] font-medium text-paper hover:bg-green-deep-hover"
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
