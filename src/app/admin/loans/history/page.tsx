import Link from "next/link";
import { format } from "date-fns";
import {
  startOfMonth,
  endOfMonth,
  addMonths,
  startOfQuarter,
  endOfQuarter,
  addQuarters,
  startOfYear,
  endOfYear,
  addYears,
} from "date-fns";
import { createClient } from "@/lib/supabase/server";
import { isOverdue } from "@/lib/loans";
import { BackButton } from "@/components/back-button";
import { ExportPdfButton } from "@/components/export-pdf-button";
import { AlertTriangleIcon } from "@/components/icons";

export const metadata = { title: "Borrower History" };

type Range = "month" | "quarter" | "year" | "all";

type HistoryLoanRow = {
  id: string;
  due_date: string;
  checked_out_at: string;
  returned_at: string | null;
  borrower_name: string | null;
  borrower_contact: string | null;
  books: { id: string; title: string; author: string } | null;
  profiles: { full_name: string | null; email: string | null } | null;
};

const RANGE_LABELS: Record<Range, string> = {
  month: "Monthly",
  quarter: "Quarterly",
  year: "Yearly",
  all: "All time",
};

function periodBounds(range: Range, offset: number): { start: Date; end: Date; label: string } | null {
  const now = new Date();
  if (range === "month") {
    const base = addMonths(now, offset);
    return { start: startOfMonth(base), end: endOfMonth(base), label: format(base, "MMMM yyyy") };
  }
  if (range === "quarter") {
    const base = addQuarters(now, offset);
    const q = Math.floor(base.getMonth() / 3) + 1;
    return { start: startOfQuarter(base), end: endOfQuarter(base), label: `Q${q} ${base.getFullYear()}` };
  }
  if (range === "year") {
    const base = addYears(now, offset);
    return { start: startOfYear(base), end: endOfYear(base), label: `${base.getFullYear()}` };
  }
  return null;
}

function rangeHref(range: Range, offset: number) {
  const sp = new URLSearchParams();
  sp.set("range", range);
  if (range !== "all" && offset !== 0) sp.set("offset", String(offset));
  return `/admin/loans/history?${sp.toString()}`;
}

export default async function LoanHistoryPage({
  searchParams,
}: {
  searchParams: Promise<{ range?: string; offset?: string }>;
}) {
  const params = await searchParams;
  const range: Range = (["month", "quarter", "year", "all"] as const).includes(params.range as Range)
    ? (params.range as Range)
    : "month";
  const offset = Math.trunc(Number(params.offset ?? "0")) || 0;

  const bounds = periodBounds(range, offset);
  const supabase = await createClient();

  const baseQuery = supabase
    .from("loans")
    .select(
      "id, due_date, checked_out_at, returned_at, borrower_name, borrower_contact, books:book_id (id, title, author), profiles:borrower_user_id (full_name, email)"
    );

  const filteredQuery = bounds
    ? baseQuery.gte("checked_out_at", bounds.start.toISOString()).lte("checked_out_at", bounds.end.toISOString())
    : baseQuery;

  const { data } = await filteredQuery.order("checked_out_at", { ascending: false });
  const loans = (data as unknown as HistoryLoanRow[]) ?? [];

  // offset 0 is the current period — stepping forward from there would be the future.
  const nextIsFuture = offset >= 0;

  function statusLabel(loan: HistoryLoanRow): string {
    if (loan.returned_at) return "Returned";
    if (isOverdue(loan.due_date, loan.returned_at)) return "Overdue";
    return "Active";
  }

  return (
    <div>
      <BackButton fallbackHref="/admin/loans" />

      <div className="mt-3 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-ink">Borrower History</h1>
          <p className="mt-2 text-ink-soft">
            {loans.length} {loans.length === 1 ? "record" : "records"}
            {bounds ? ` — ${bounds.label}` : " — all time"}
          </p>
        </div>
        <ExportPdfButton
          title="Borrower History"
          subtitle={`${bounds ? bounds.label : "All time"} · Exported ${format(new Date(), "MMM d, yyyy")}`}
          columns={["Book", "Borrower", "Checked out", "Due date", "Returned", "Status"]}
          rows={loans.map((loan) => [
            loan.books?.title ?? "Unknown book",
            loan.profiles?.full_name ?? loan.borrower_name ?? "Unknown",
            format(new Date(loan.checked_out_at), "MMM d, yyyy"),
            format(new Date(loan.due_date), "MMM d, yyyy"),
            loan.returned_at ? format(new Date(loan.returned_at), "MMM d, yyyy") : "—",
            statusLabel(loan),
          ])}
          filename={`borrower-history-${range}.pdf`}
        />
      </div>

      <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
        <nav className="flex flex-wrap gap-1.5" aria-label="Time range">
          {(["month", "quarter", "year", "all"] as const).map((r) => (
            <Link
              key={r}
              href={rangeHref(r, 0)}
              className={`focus-ring rounded-full px-3.5 py-1.5 text-[13.5px] font-semibold ${
                r === range ? "bg-accent text-white" : "text-ink-soft hover:bg-paper-dim hover:text-ink"
              }`}
            >
              {RANGE_LABELS[r]}
            </Link>
          ))}
        </nav>

        {bounds && (
          <div className="flex items-center gap-3">
            <Link
              href={rangeHref(range, offset - 1)}
              className="focus-ring rounded-lg border border-line px-4 py-2 text-[14px] font-semibold hover:bg-paper-dim"
            >
              ← Previous
            </Link>
            <span className="text-[14px] font-semibold text-ink">{bounds.label}</span>
            {nextIsFuture ? (
              <span className="rounded-lg border border-line px-4 py-2 text-[14px] text-ink-faint">Next →</span>
            ) : (
              <Link
                href={rangeHref(range, offset + 1)}
                className="focus-ring rounded-lg border border-line px-4 py-2 text-[14px] font-semibold hover:bg-paper-dim"
              >
                Next →
              </Link>
            )}
          </div>
        )}
      </div>

      <div className="mt-6 overflow-x-auto rounded-xl border border-line shadow-card">
        <table className="w-full min-w-[900px] text-left text-[14.5px]">
          <thead className="bg-paper-dim text-ink-faint">
            <tr>
              <th className="px-4 py-3 text-[11.5px] font-bold uppercase tracking-wide">Book</th>
              <th className="px-4 py-3 text-[11.5px] font-bold uppercase tracking-wide">Borrower</th>
              <th className="px-4 py-3 text-[11.5px] font-bold uppercase tracking-wide">Checked out</th>
              <th className="px-4 py-3 text-[11.5px] font-bold uppercase tracking-wide">Due date</th>
              <th className="px-4 py-3 text-[11.5px] font-bold uppercase tracking-wide">Returned</th>
              <th className="px-4 py-3 text-[11.5px] font-bold uppercase tracking-wide">Status</th>
            </tr>
          </thead>
          <tbody>
            {loans.map((loan) => {
              const status = statusLabel(loan);
              return (
                <tr key={loan.id} className="border-t border-line">
                  <td className="px-4 py-3 font-medium text-ink">
                    {loan.books ? (
                      <Link href={`/catalog/${loan.books.id}`} className="hover:text-accent hover:underline">
                        {loan.books.title}
                      </Link>
                    ) : (
                      "Unknown book"
                    )}
                  </td>
                  <td className="px-4 py-3 text-ink-soft">
                    {loan.profiles?.full_name ?? loan.borrower_name ?? "Unknown"}
                    {loan.profiles?.email && (
                      <span className="block text-sm text-ink-soft">{loan.profiles.email}</span>
                    )}
                    {!loan.profiles && loan.borrower_contact && (
                      <span className="block text-sm text-ink-soft">{loan.borrower_contact}</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-ink-soft">{format(new Date(loan.checked_out_at), "MMM d, yyyy")}</td>
                  <td className="px-4 py-3 text-ink-soft">{format(new Date(loan.due_date), "MMM d, yyyy")}</td>
                  <td className="px-4 py-3 text-ink-soft">
                    {loan.returned_at ? format(new Date(loan.returned_at), "MMM d, yyyy") : "—"}
                  </td>
                  <td className="px-4 py-3">
                    {status === "Overdue" ? (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-critical-soft px-2.5 py-1 text-[12.5px] font-semibold text-critical">
                        <AlertTriangleIcon className="h-3 w-3" />
                        Overdue
                      </span>
                    ) : status === "Active" ? (
                      <span className="inline-flex items-center rounded-full bg-gold-soft px-2.5 py-1 text-[12.5px] font-semibold text-gold">
                        Active
                      </span>
                    ) : (
                      <span className="inline-flex items-center rounded-full bg-good-soft px-2.5 py-1 text-[12.5px] font-semibold text-good">
                        Returned
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
            {loans.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-center text-ink-soft">
                  No borrower records for this period.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
