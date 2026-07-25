"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import type { Role } from "@/lib/supabase/types";
import { LogoutButton } from "@/components/logout-button";
import { BookIcon, GridIcon, MenuIcon, XIcon } from "@/components/icons";

const linkClass =
  "focus-ring flex items-center gap-2 rounded-lg px-3 py-2.5 text-[15px] font-medium text-ink-soft hover:bg-paper-dim hover:text-ink";

export function MobileNav({
  isAdmin,
  session,
}: {
  isAdmin: boolean;
  session: { fullName: string | null; email: string | null; role: Role } | null;
}) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onPointerDown(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, []);

  // Close the panel on navigation (link tap) rather than leaving it open
  // over the new page.
  function close() {
    setOpen(false);
  }

  return (
    <div ref={containerRef} className="relative md:hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-label={open ? "Close menu" : "Open menu"}
        className="focus-ring flex h-9 w-9 items-center justify-center rounded-lg text-ink hover:bg-paper-dim"
      >
        {open ? <XIcon className="h-5 w-5" /> : <MenuIcon className="h-5 w-5" />}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-64 rounded-xl border border-line bg-paper p-2 shadow-card">
          <nav className="flex flex-col gap-0.5">
            <Link href="/catalog" onClick={close} className={linkClass}>
              <BookIcon className="h-4 w-4" />
              Catalog
            </Link>
            {isAdmin && (
              <Link href="/admin" onClick={close} className={linkClass}>
                <GridIcon className="h-4 w-4" />
                Admin
              </Link>
            )}
          </nav>

          <div className="mt-2 border-t border-line pt-2">
            {session ? (
              <div className="px-3 py-2">
                <div className="flex items-center gap-2">
                  <p className="truncate text-[14.5px] font-semibold text-ink">
                    {session.fullName ?? "Unnamed"}
                  </p>
                  <span
                    className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-semibold capitalize ${
                      session.role === "admin" ? "bg-accent-soft text-accent" : "bg-paper-dim text-ink-soft"
                    }`}
                  >
                    {session.role}
                  </span>
                </div>
                <p className="mt-0.5 truncate text-[13px] text-ink-soft">
                  {session.email ?? "No email on file"}
                </p>
                <div className="mt-2 flex justify-end">
                  <LogoutButton />
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-1 p-1">
                <Link href="/login" onClick={close} className={linkClass}>
                  Log in
                </Link>
                <Link
                  href="/signup"
                  onClick={close}
                  className="focus-ring rounded-lg bg-accent px-3 py-2.5 text-center text-[15px] font-semibold text-white hover:bg-accent-hover"
                >
                  Sign up
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
