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
      <h1 className="font-serif text-3xl font-semibold text-green-deep">{title}</h1>
      {subtitle && <p className="mt-2 text-ink-soft">{subtitle}</p>}
      <div className="mt-8 rounded-lg border border-line bg-white/60 p-6 sm:p-8">
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
      <label htmlFor={htmlFor} className="text-[15px] font-medium text-ink">
        {label}
      </label>
      {children}
      {hint && <p className="text-sm text-ink-soft">{hint}</p>}
    </div>
  );
}

export const inputClass =
  "focus-ring w-full rounded-md border border-line bg-white px-4 py-3 text-[17px] text-ink placeholder:text-ink-soft/60";

export const primaryButtonClass =
  "focus-ring w-full rounded-md bg-green-deep px-6 py-3 text-lg font-medium text-paper hover:bg-green-deep-hover disabled:opacity-60";

export function ErrorMessage({ message }: { message: string }) {
  return (
    <p className="rounded-md bg-terracotta/10 px-4 py-3 text-[15px] text-terracotta" role="alert">
      {message}
    </p>
  );
}

export function SuccessMessage({ message }: { message: string }) {
  return (
    <p className="rounded-md bg-green-deep/10 px-4 py-3 text-[15px] text-green-deep" role="status">
      {message}
    </p>
  );
}
