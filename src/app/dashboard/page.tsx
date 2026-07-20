import Link from "next/link";
import { format } from "date-fns";
import { requireUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { isOverdue } from "@/lib/loans";
import { getYouMightLike } from "@/lib/recommendations";
import { coverImageUrl } from "@/lib/books";
import { BookCard } from "@/components/book-card";
import { AlertTriangleIcon, ClockIcon, TrendingUpIcon } from "@/components/icons";

export const metadata = { title: "My Books" };

type LoanRow = {
  id: string;
  due_date: string;
  checked_out_at: string;
  returned_at: string | null;
  books: { id: string; title: string; author: string } | null;
};

export default async function DashboardPage() {
  const session = await requireUser();
  const supabase = await createClient();

  const { data } = await supabase
    .from("loans")
    .select("id, due_date, checked_out_at, returned_at, books:book_id (id, title, author)")
    .eq("borrower_user_id", session.userId)
    .order("checked_out_at", { ascending: false });

  const loans = (data as unknown as LoanRow[]) ?? [];
  const active = loans.filter((l) => !l.returned_at);
  const past = loans.filter((l) => l.returned_at);

  const recommendations = await getYouMightLike(supabase, session.userId);

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <h1 className="text-3xl font-bold tracking-tight text-ink">
        Hello, {session.profile.full_name?.split(" ")[0] ?? "there"}
      </h1>

      <div className="mt-8 grid grid-cols-2 gap-4 sm:max-w-md">
        <div className="rounded-xl border border-line shadow-card bg-paper p-5">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent-soft text-accent">
            <ClockIcon className="h-4 w-4" />
          </span>
          <p className="mt-3 text-2xl font-bold text-ink">{active.length}</p>
          <p className="text-[13px] text-ink-soft">Currently borrowed</p>
        </div>
        <div className="rounded-xl border border-line shadow-card bg-paper p-5">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gold-soft text-gold">
            <TrendingUpIcon className="h-4 w-4" />
          </span>
          <p className="mt-3 text-2xl font-bold text-ink">{loans.length}</p>
          <p className="text-[13px] text-ink-soft">Books borrowed all time</p>
        </div>
      </div>

      <section className="mt-12">
        <h2 className="text-xl font-semibold tracking-tight text-ink">Currently borrowed</h2>
        {active.length === 0 ? (
          <p className="mt-3 text-ink-soft">You don&rsquo;t have any books checked out right now.</p>
        ) : (
          <div className="mt-4 overflow-x-auto rounded-xl border border-line shadow-card">
            <table className="w-full min-w-[500px] text-left text-[14.5px]">
              <thead className="bg-paper-dim text-ink-faint">
                <tr>
                  <th className="px-4 py-3 text-[11.5px] font-bold uppercase tracking-wide">Book</th>
                  <th className="px-4 py-3 text-[11.5px] font-bold uppercase tracking-wide">Due date</th>
                </tr>
              </thead>
              <tbody>
                {active.map((loan) => (
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
                    <td className="px-4 py-3">
                      {isOverdue(loan.due_date, loan.returned_at) ? (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-critical-soft px-2.5 py-1 text-[12.5px] font-semibold text-critical">
                          <AlertTriangleIcon className="h-3 w-3" />
                          Overdue — {format(new Date(loan.due_date), "MMM d, yyyy")}
                        </span>
                      ) : (
                        <span className="text-ink-soft">{format(new Date(loan.due_date), "MMM d, yyyy")}</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {recommendations.length > 0 && (
        <section className="mt-12">
          <h2 className="text-xl font-semibold tracking-tight text-ink">You might also like</h2>
          <p className="mt-1 text-[14.5px] text-ink-soft">
            Based on the genres and authors you&rsquo;ve borrowed before.
          </p>
          <div className="mt-4 grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
            {recommendations.map((book) => (
              <BookCard key={book.id} book={book} coverUrl={coverImageUrl(supabase, book.cover_image_path)} />
            ))}
          </div>
        </section>
      )}

      <section className="mt-12">
        <h2 className="text-xl font-semibold tracking-tight text-ink">Borrowing history</h2>
        {past.length === 0 ? (
          <p className="mt-3 text-ink-soft">No past borrows yet.</p>
        ) : (
          <div className="mt-4 overflow-x-auto rounded-xl border border-line shadow-card">
            <table className="w-full min-w-[500px] text-left text-[14.5px]">
              <thead className="bg-paper-dim text-ink-faint">
                <tr>
                  <th className="px-4 py-3 text-[11.5px] font-bold uppercase tracking-wide">Book</th>
                  <th className="px-4 py-3 text-[11.5px] font-bold uppercase tracking-wide">Checked out</th>
                  <th className="px-4 py-3 text-[11.5px] font-bold uppercase tracking-wide">Returned</th>
                </tr>
              </thead>
              <tbody>
                {past.map((loan) => (
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
                    <td className="px-4 py-3 text-ink-soft">{format(new Date(loan.checked_out_at), "MMM d, yyyy")}</td>
                    <td className="px-4 py-3 text-ink-soft">
                      {loan.returned_at ? format(new Date(loan.returned_at), "MMM d, yyyy") : ""}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
