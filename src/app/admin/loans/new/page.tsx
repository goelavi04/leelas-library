import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createLoan } from "@/app/admin/loans/actions";
import { defaultDueDate } from "@/lib/loans";
import { CheckoutForm } from "@/components/checkout-form";

export const metadata = { title: "Check Out a Book" };

export default async function NewLoanPage({
  searchParams,
}: {
  searchParams: Promise<{ bookId?: string }>;
}) {
  const { bookId } = await searchParams;
  const supabase = await createClient();

  let bookLabel: string | undefined;
  if (bookId) {
    const { data: book } = await supabase
      .from("books")
      .select("id, title, author, status")
      .eq("id", bookId)
      .single();
    if (!book) notFound();
    if (book.status !== "available") {
      return (
        <div className="max-w-lg rounded-lg border border-line bg-white/60 p-8">
          <h1 className="font-serif text-2xl font-semibold text-green-deep">Already checked out</h1>
          <p className="mt-3 text-[17px] text-ink">
            “{book.title}” is already checked out to someone else.
          </p>
          <Link href="/admin/loans" className="mt-6 inline-block focus-ring font-medium text-green-deep underline">
            Back to Borrow &amp; Return
          </Link>
        </div>
      );
    }
    bookLabel = `${book.title} — ${book.author}`;
  }

  const [{ data: availableBooks }, { data: users }] = await Promise.all([
    bookId
      ? Promise.resolve({ data: [] })
      : supabase.from("books").select("id, title, author").eq("status", "available").order("title"),
    supabase.from("profiles").select("id, full_name, email").order("full_name"),
  ]);

  return (
    <div className="max-w-2xl">
      <Link href="/admin/loans" className="focus-ring text-[15px] font-medium text-green-deep underline">
        ← Back to Borrow &amp; Return
      </Link>
      <h1 className="mt-4 font-serif text-4xl font-semibold text-green-deep">Check Out a Book</h1>

      <div className="mt-8">
        <CheckoutForm
          action={createLoan}
          bookId={bookId}
          bookLabel={bookLabel}
          availableBooks={availableBooks ?? []}
          users={users ?? []}
          defaultDueDate={defaultDueDate()}
        />
      </div>
    </div>
  );
}
