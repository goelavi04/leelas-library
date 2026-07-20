import Link from "next/link";
import { format } from "date-fns";
import { createClient } from "@/lib/supabase/server";
import { isOverdue, isDueSoon } from "@/lib/loans";
import { markReturned } from "@/app/admin/loans/actions";
import { AlertTriangleIcon, ClockIcon, PlusIcon, TrendingUpIcon } from "@/components/icons";

export const metadata = { title: "Borrow & Return" };

type ActiveLoanRow = {
  id: string;
  due_date: string;
  checked_out_at: string;
  returned_at: string | null;
  borrower_name: string | null;
  borrower_contact: string | null;
  books: { id: string; title: string; author: string; genre: string | null; shelf_location: string | null } | null;
  profiles: { full_name: string | null; email: string | null } | null;
};

export default async function AdminLoansPage() {
  const supabase = await createClient();

  const { data } = await supabase
    .from("loans")
    .select(
      "id, due_date, checked_out_at, returned_at, borrower_name, borrower_contact, books:book_id (id, title, author, genre, shelf_location), profiles:borrower_user_id (full_name, email)"
    )
    .is("returned_at", null)
    .order("due_date", { ascending: true });

  const loans = (data as unknown as ActiveLoanRow[]) ?? [];

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-ink">Borrow &amp; Return</h1>
          <p className="mt-2 text-ink-soft">
            {loans.length} {loans.length === 1 ? "book" : "books"} currently out
          </p>
        </div>
        <Link
          href="/admin/loans/new"
          className="focus-ring flex items-center gap-2 rounded-lg bg-accent px-5 py-2.5 text-[14.5px] font-semibold text-white shadow-card hover:bg-accent-hover"
        >
          <PlusIcon className="h-4 w-4" />
          Check Out a Book
        </Link>
      </div>

      <div className="mt-8 overflow-x-auto rounded-xl border border-line shadow-card">
        <table className="w-full min-w-[900px] text-left text-[14.5px]">
          <thead className="bg-paper-dim text-ink-faint">
            <tr>
              <th className="px-4 py-3 text-[11.5px] font-bold uppercase tracking-wide">Book</th>
              <th className="px-4 py-3 text-[11.5px] font-bold uppercase tracking-wide">Shelf</th>
              <th className="px-4 py-3 text-[11.5px] font-bold uppercase tracking-wide">Borrower</th>
              <th className="px-4 py-3 text-[11.5px] font-bold uppercase tracking-wide">Checked out</th>
              <th className="px-4 py-3 text-[11.5px] font-bold uppercase tracking-wide">Due date</th>
              <th className="px-4 py-3 text-right text-[11.5px] font-bold uppercase tracking-wide">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loans.map((loan) => {
              const overdue = isOverdue(loan.due_date, loan.returned_at);
              const dueSoon = isDueSoon(loan.due_date, loan.returned_at);
              const bound = markReturned.bind(null, loan.id);
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
                    {loan.books?.genre && (
                      <span className="block text-sm font-normal text-ink-soft">{loan.books.genre}</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-ink-soft">{loan.books?.shelf_location ?? "—"}</td>
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
                  <td className="px-4 py-3">
                    {overdue ? (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-critical-soft px-2.5 py-1 text-[12.5px] font-semibold text-critical">
                        <AlertTriangleIcon className="h-3 w-3" />
                        Overdue — {format(new Date(loan.due_date), "MMM d, yyyy")}
                      </span>
                    ) : dueSoon ? (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-gold-soft px-2.5 py-1 text-[12.5px] font-semibold text-gold">
                        <ClockIcon className="h-3 w-3" />
                        Due soon — {format(new Date(loan.due_date), "MMM d, yyyy")}
                      </span>
                    ) : (
                      format(new Date(loan.due_date), "MMM d, yyyy")
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <form action={bound} className="flex justify-end">
                      <button
                        type="submit"
                        className="focus-ring flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[13px] font-semibold text-good hover:bg-good-soft"
                      >
                        <TrendingUpIcon className="h-3.5 w-3.5" />
                        Mark returned
                      </button>
                    </form>
                  </td>
                </tr>
              );
            })}
            {loans.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-center text-ink-soft">
                  No books are currently checked out.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
