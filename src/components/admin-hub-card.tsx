import Link from "next/link";
import type { ComponentType } from "react";
import { ArrowRightIcon, type IconProps } from "@/components/icons";

export type HubAccent = "accent" | "gold" | "good" | "critical";

const badgeClass: Record<HubAccent, string> = {
  accent: "bg-accent-soft text-accent",
  gold: "bg-gold-soft text-gold",
  good: "bg-good-soft text-good",
  critical: "bg-critical-soft text-critical",
};

export function AdminHubCard({
  href,
  title,
  description,
  icon: Icon,
  accent = "accent",
}: {
  href: string;
  title: string;
  description: string;
  icon: ComponentType<IconProps>;
  accent?: HubAccent;
}) {
  return (
    <Link
      href={href}
      className="focus-ring group flex items-start gap-3.5 rounded-xl border border-line shadow-card bg-paper p-5 transition duration-150 ease-out hover:-translate-y-0.5 hover:shadow-md active:translate-y-0 active:scale-[0.99] active:shadow-card"
    >
      <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${badgeClass[accent]}`}>
        <Icon className="h-5 w-5" />
      </span>
      <span className="flex-1">
        <h2 className="text-[15px] font-semibold text-ink">{title}</h2>
        <p className="mt-0.5 text-[13.5px] text-ink-soft">{description}</p>
      </span>
      <ArrowRightIcon className="mt-2 h-4 w-4 shrink-0 text-ink-faint transition group-hover:text-accent" />
    </Link>
  );
}

/** The one headline action on the hub — bigger and bolder than the rest, not just another card in the grid. */
export function AdminHubHero({
  href,
  title,
  description,
  icon: Icon,
}: {
  href: string;
  title: string;
  description: string;
  icon: ComponentType<IconProps>;
}) {
  return (
    <Link
      href={href}
      className="focus-ring group flex items-center gap-5 rounded-2xl border border-accent/20 bg-gradient-to-br from-accent to-accent-hover p-6 shadow-card transition duration-150 ease-out hover:-translate-y-0.5 hover:shadow-lg active:translate-y-0 active:scale-[0.99] active:shadow-card sm:p-7"
    >
      <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-white/15 text-white">
        <Icon className="h-7 w-7" strokeWidth={1.6} />
      </span>
      <span className="flex-1">
        <h2 className="text-[19px] font-bold tracking-tight text-white">{title}</h2>
        <p className="mt-1 text-[14px] text-white/80">{description}</p>
      </span>
      <ArrowRightIcon className="hidden h-5 w-5 shrink-0 text-white/70 transition group-hover:translate-x-0.5 group-hover:text-white sm:block" />
    </Link>
  );
}
