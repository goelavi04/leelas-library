import Link from "next/link";
import { format } from "date-fns";
import { createClient } from "@/lib/supabase/server";
import { isOverdue } from "@/lib/loans";
import { markReturned } from "@/app/admin/loans/actions";

export const metadata = { title: "Borrow & Return" };

type ActiveLoanRow = {
  id: string;
  due_date: string;
  checked_out_at: string;
  returned_at: string | null;
  borrower_name: string | null;
  books: { id: string; title: string; author: string } | null;
  profiles: { full_name: string | null; email: string | null } | null;
};

export default async function AdminLoansPage() {
  const supabase = await createClient();

  const { data } = await supabase
    .from("loans")
    .select(
      "id, due_date, checked_out_at, returned_at, borrower_name, books:book_id (id, title, author), profiles:borrower_user_id (full_name, email)"
    )
    .is("returned_at", null)
    .order("due_date", { ascending: true });

  const loans = (data as unknown as ActiveLoanRow[]) ?? [];

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-4xl font-semibold text-green-deep">Borrow &amp; Return</h1>
          <p className="mt-2 text-ink-soft">
            {loans.length} {loans.length === 1 ? "book" : "books"} currently out
          </p>
        </div>
        <Link
          href="/admin/loans/new"
          className="focus-ring rounded-md bg-green-deep px-6 py-3 text-lg font-medium text-paper hover:bg-green-deep-hover"
        >
          + Check Out a Book
        </Link>
      </div>

      <div className="mt-8 overflow-x-auto rounded-lg border border-line">
        <table className="w-full min-w-[700px] text-left text-[15px]">
          <thead className="bg-paper-dim text-ink-soft">
            <tr>
              <th className="px-4 py-3 font-medium">Book</th>
              <th className="px-4 py-3 font-medium">Borrower</th>
              <th className="px-4 py-3 font-medium">Due date</th>
              <th className="px-4 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loans.map((loan) => {
              const overdue = isOverdue(loan.due_date, loan.returned_at);
              const bound = markReturned.bind(null, loan.id);
              return (
                <tr key={loan.id} className="border-t border-line">
                  <td className="px-4 py-3 font-medium text-ink">
                    {loan.books ? (
                      <Link href={`/catalog/${loan.books.id}`} className="underline hover:text-green-deep">
                        {loan.books.title}
                      </Link>
                    ) : (
                      "Unknown book"
                    )}
                  </td>
                  <td className="px-4 py-3 text-ink-soft">
                    {loan.profiles?.full_name ?? loan.borrower_name ?? "Unknown"}
                  </td>
                  <td className="px-4 py-3">
                    {overdue ? (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-terracotta/10 px-3 py-1 text-sm font-medium text-terracotta">
                        Overdue — {format(new Date(loan.due_date), "MMM d, yyyy")}
                      </span>
                    ) : (
                      format(new Date(loan.due_date), "MMM d, yyyy")
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <form action={bound}>
                      <button type="submit" className="focus-ring font-medium text-green-deep underline">
                        Mark returned
                      </button>
                    </form>
                  </td>
                </tr>
              );
            })}
            {loans.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-6 text-center text-ink-soft">
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
