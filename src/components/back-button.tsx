"use client";

import { useRouter } from "next/navigation";

export function BackButton({
  fallbackHref,
  label = "Back",
  className,
}: {
  fallbackHref: string;
  label?: string;
  className?: string;
}) {
  const router = useRouter();

  function handleClick() {
    if (window.history.length > 1) {
      router.back();
    } else {
      router.push(fallbackHref);
    }
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className={
        className ??
        "focus-ring text-[13.5px] font-semibold text-ink-soft hover:text-accent"
      }
    >
      ← {label}
    </button>
  );
}
