import { addDays, formatISO } from "date-fns";

export const DEFAULT_LOAN_DAYS = 14;

export function defaultDueDate(from: Date = new Date()): string {
  return formatISO(addDays(from, DEFAULT_LOAN_DAYS), { representation: "date" });
}

export function isOverdue(dueDate: string, returnedAt: string | null): boolean {
  if (returnedAt) return false;
  return new Date(dueDate) < new Date(new Date().toDateString());
}
