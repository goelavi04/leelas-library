import Link from "next/link";
import type { ComponentType } from "react";
import { ArrowRightIcon, type IconProps } from "@/components/icons";

export function AdminHubCard({
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
      className="focus-ring group flex items-start gap-3.5 rounded-xl border border-line shadow-card bg-paper p-5 transition hover:shadow-md hover:-translate-y-0.5"
    >
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-accent-soft text-accent">
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
