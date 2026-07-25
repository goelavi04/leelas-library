import Link from "next/link";
import { getSession } from "@/lib/auth";
import { AccountMenu } from "@/components/account-menu";
import { MobileNav } from "@/components/mobile-nav";
import { BookIcon, GridIcon } from "@/components/icons";

export async function SiteHeader() {
  const session = await getSession();
  const isAdmin = session?.profile.role === "admin";

  return (
    <header className="sticky top-0 z-10 border-b border-line bg-paper/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3.5 sm:px-6">
        <Link href="/" className="focus-ring flex items-center gap-2 rounded-md">
          <BookIcon className="h-5 w-5 text-accent" strokeWidth={1.6} />
          <span className="font-display text-[18px] font-bold tracking-tight text-ink">
            Leela&rsquo;s Library
          </span>
        </Link>

        <MobileNav
          isAdmin={isAdmin}
          session={
            session
              ? { fullName: session.profile.full_name, email: session.profile.email, role: session.profile.role }
              : null
          }
        />

        <nav className="hidden items-center gap-1 md:flex md:gap-1.5">
          <Link
            href="/catalog"
            className="focus-ring flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[14px] font-medium text-ink-soft hover:bg-paper-dim hover:text-ink"
          >
            <BookIcon className="h-4 w-4" />
            Catalog
          </Link>

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
            <AccountMenu
              fullName={session.profile.full_name}
              email={session.profile.email}
              role={session.profile.role}
            />
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
