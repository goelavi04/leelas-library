"use client";

import { useEffect, useRef, useState } from "react";
import type { Role } from "@/lib/supabase/types";
import { LogoutButton } from "@/components/logout-button";
import { ChevronDownIcon } from "@/components/icons";

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

export function AccountMenu({
  fullName,
  email,
  role,
}: {
  fullName: string | null;
  email: string | null;
  role: Role;
}) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onPointerDown(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, []);

  return (
    <div ref={containerRef} className="relative ml-1">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="true"
        className="focus-ring flex items-center gap-1 rounded-full border border-line py-1 pl-1 pr-2 hover:bg-paper-dim"
      >
        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-accent text-[11px] font-semibold text-white">
          {initials(fullName, email)}
        </span>
        <ChevronDownIcon
          className={`h-3.5 w-3.5 text-ink-faint transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 top-full mt-2 w-64 rounded-xl border border-line bg-paper p-4 shadow-card"
        >
          <div className="flex items-center gap-2">
            <p className="truncate text-[14.5px] font-semibold text-ink">{fullName ?? "Unnamed"}</p>
            <span
              className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-semibold capitalize ${
                role === "admin" ? "bg-accent-soft text-accent" : "bg-paper-dim text-ink-soft"
              }`}
            >
              {role}
            </span>
          </div>
          <p className="mt-0.5 truncate text-[13px] text-ink-soft">{email ?? "No email on file"}</p>

          <div className="mt-3 flex justify-end border-t border-line pt-3">
            <LogoutButton />
          </div>
        </div>
      )}
    </div>
  );
}
