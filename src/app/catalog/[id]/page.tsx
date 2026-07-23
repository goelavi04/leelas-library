import Image from "next/image";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getSession } from "@/lib/auth";
import { coverImageUrl } from "@/lib/books";
import { StatusBadge } from "@/components/status-badge";
import { BackButton } from "@/components/back-button";
import { ExportPdfButton } from "@/components/export-pdf-button";
import { format } from "date-fns";

export default async function BookDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  // Independent — run in parallel instead of one after the other.
  const [{ data: book }, session] = await Promise.all([
    supabase.from("books").select("*").eq("id", id).single(),
    getSession(),
  ]);
  if (!book) notFound();

  const isAdmin = session?.profile.role === "admin";

  let loanHistory: {
    id: string;
    checked_out_at: string;
    due_date: string;
    returned_at: string | null;
    borrower_name: string | null;
    borrower_contact: string | null;
    borrower_user_id: string | null;
    profiles: { full_name: string | null; email: string | null } | null;
  }[] = [];

  if (isAdmin) {
    const { data } = await supabase
      .from("loans")
      .select(
        "id, checked_out_at, due_date, returned_at, borrower_name, borrower_contact, borrower_user_id, profiles:borrower_user_id (full_name, email)"
      )
      .eq("book_id", id)
      .order("checked_out_at", { ascending: false });
    loanHistory = (data as typeof loanHistory) ?? [];
  }

  const coverUrl = coverImageUrl(supabase, book.cover_image_path);

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <BackButton fallbackHref="/catalog" label="Back to catalog" />

      <div className="mt-6 flex flex-col gap-8 sm:flex-row">
        <div className="flex w-full max-w-[220px] flex-shrink-0 items-center justify-center overflow-hidden rounded-xl border border-line bg-accent-soft shadow-card">
          {coverUrl ? (
            <Image src={coverUrl} alt="" width={220} height={300} className="h-auto w-full object-cover" />
          ) : (
            <span className="font-display flex aspect-[3/4] w-full items-center justify-center text-5xl font-bold text-accent/70">
              {book.title.charAt(0).toUpperCase()}
            </span>
          )}
        </div>

        <div className="flex-1">
          <h1 className="text-3xl font-bold tracking-tight text-ink sm:text-4xl">{book.title}</h1>
          <p className="mt-1 text-lg text-ink-soft">{book.author}</p>
          <div className="mt-4">
            <StatusBadge status={book.status} />
          </div>

          <dl className="mt-6 grid grid-cols-1 gap-3 text-[15px] sm:grid-cols-2">
            {book.genre && (
              <div>
                <dt className="text-[13px] font-semibold text-ink-faint">Genre</dt>
                <dd className="text-ink">{book.genre}</dd>
              </div>
            )}
            {book.isbn && (
              <div>
                <dt className="text-[13px] font-semibold text-ink-faint">ISBN</dt>
                <dd className="text-ink">{book.isbn}</dd>
              </div>
            )}
            {book.shelf_location && (
              <div>
                <dt className="text-[13px] font-semibold text-ink-faint">Shelf location</dt>
                <dd className="text-ink">{book.shelf_location}</dd>
              </div>
            )}
          </dl>

          {book.notes && (
            <div className="mt-6">
              <h2 className="text-[13px] font-semibold text-ink-faint">Notes</h2>
              <p className="mt-1 whitespace-pre-wrap text-ink">{book.notes}</p>
            </div>
          )}
        </div>
      </div>

      {isAdmin && (
        <div className="mt-12">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <h2 className="text-xl font-semibold tracking-tight text-ink">Borrow history</h2>
            <ExportPdfButton
              title={`Borrow history — ${book.title}`}
              subtitle={`${book.author} · Exported ${format(new Date(), "MMM d, yyyy")}`}
              columns={["Borrower", "Checked out", "Due", "Returned"]}
              rows={loanHistory.map((loan) => [
                loan.profiles?.full_name ?? loan.borrower_name ?? "Unknown",
                format(new Date(loan.checked_out_at), "MMM d, yyyy"),
                format(new Date(loan.due_date), "MMM d, yyyy"),
                loan.returned_at ? format(new Date(loan.returned_at), "MMM d, yyyy") : "Not yet returned",
              ])}
              filename={`borrow-history-${book.title.toLowerCase().replace(/\s+/g, "-")}.pdf`}
            />
          </div>
          {loanHistory.length === 0 ? (
            <p className="mt-3 text-ink-soft">This book has never been borrowed.</p>
          ) : (
            <div className="mt-4 overflow-x-auto rounded-xl border border-line shadow-card">
              <table className="w-full min-w-[600px] text-left text-[14.5px]">
                <thead className="bg-paper-dim text-ink-faint">
                  <tr>
                    <th className="px-4 py-3 text-[11.5px] font-bold uppercase tracking-wide">Borrower</th>
                    <th className="px-4 py-3 text-[11.5px] font-bold uppercase tracking-wide">Checked out</th>
                    <th className="px-4 py-3 text-[11.5px] font-bold uppercase tracking-wide">Due</th>
                    <th className="px-4 py-3 text-[11.5px] font-bold uppercase tracking-wide">Returned</th>
                  </tr>
                </thead>
                <tbody>
                  {loanHistory.map((loan) => (
                    <tr key={loan.id} className="border-t border-line">
                      <td className="px-4 py-3">
                        {loan.profiles?.full_name ?? loan.borrower_name ?? "Unknown"}
                        {loan.profiles?.email && (
                          <span className="block text-sm text-ink-soft">{loan.profiles.email}</span>
                        )}
                        {!loan.borrower_user_id && loan.borrower_contact && (
                          <span className="block text-sm text-ink-soft">{loan.borrower_contact}</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-ink-soft">{format(new Date(loan.checked_out_at), "MMM d, yyyy")}</td>
                      <td className="px-4 py-3 text-ink-soft">{format(new Date(loan.due_date), "MMM d, yyyy")}</td>
                      <td className="px-4 py-3 text-ink-soft">
                        {loan.returned_at ? format(new Date(loan.returned_at), "MMM d, yyyy") : "Not yet returned"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
