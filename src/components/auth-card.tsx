import type { ReactNode } from "react";

export function AuthCard({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
}) {
  return (
    <div className="mx-auto flex max-w-md flex-col px-4 py-16 sm:px-0">
      <h1 className="text-2xl font-bold tracking-tight text-ink">{title}</h1>
      {subtitle && <p className="mt-2 text-ink-soft">{subtitle}</p>}
      <div className="mt-8 rounded-xl border border-line shadow-card bg-paper p-6 sm:p-8">
        {children}
      </div>
    </div>
  );
}

export function FormField({
  label,
  htmlFor,
  children,
  hint,
}: {
  label: string;
  htmlFor: string;
  children: ReactNode;
  hint?: string;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={htmlFor} className="text-[13px] font-semibold text-ink-soft">
        {label}
      </label>
      {children}
      {hint && <p className="text-sm text-ink-soft">{hint}</p>}
    </div>
  );
}

export const inputClass =
  "focus-ring w-full rounded-lg border border-line bg-paper-dim px-3.5 py-2.5 text-[15px] text-ink placeholder:text-ink-faint focus:bg-paper";

export const primaryButtonClass =
  "focus-ring w-full rounded-lg bg-accent px-5 py-2.5 text-[15px] font-semibold text-white shadow-card hover:bg-accent-hover disabled:opacity-60";

export function ErrorMessage({ message }: { message: string }) {
  return (
    <p className="rounded-lg bg-critical-soft px-4 py-3 text-[14px] text-critical" role="alert">
      {message}
    </p>
  );
}

export function SuccessMessage({ message }: { message: string }) {
  return (
    <p className="rounded-lg bg-good-soft px-4 py-3 text-[14px] text-good" role="status">
      {message}
    </p>
  );
}
