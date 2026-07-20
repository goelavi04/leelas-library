import { addDays, formatISO } from "date-fns";

export const DEFAULT_LOAN_DAYS = 14;
export const DUE_SOON_DAYS = 3;

export function defaultDueDate(from: Date = new Date()): string {
  return formatISO(addDays(from, DEFAULT_LOAN_DAYS), { representation: "date" });
}

export function isOverdue(dueDate: string, returnedAt: string | null): boolean {
  if (returnedAt) return false;
  return new Date(dueDate) < new Date(new Date().toDateString());
}

/** Not yet overdue, but due within DUE_SOON_DAYS — a heads-up before it lapses. */
export function isDueSoon(dueDate: string, returnedAt: string | null): boolean {
  if (returnedAt) return false;
  const today = new Date(new Date().toDateString());
  const due = new Date(dueDate);
  if (due < today) return false;
  return due <= addDays(today, DUE_SOON_DAYS);
}
