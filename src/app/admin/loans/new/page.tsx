import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createLoan } from "@/app/admin/loans/actions";
import { defaultDueDate } from "@/lib/loans";
import { CheckoutForm } from "@/components/checkout-form";
import { BackButton } from "@/components/back-button";

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
        <div className="max-w-lg rounded-xl border border-line shadow-card bg-paper p-8">
          <h1 className="text-xl font-bold tracking-tight text-ink">Already checked out</h1>
          <p className="mt-3 text-[15px] text-ink-soft">
            &ldquo;{book.title}&rdquo; is already checked out to someone else.
          </p>
          <div className="mt-6">
            <BackButton
              fallbackHref="/admin/loans"
              label="Back to Borrow & Return"
              className="focus-ring text-[13.5px] font-semibold text-accent hover:underline"
            />
          </div>
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
      <BackButton fallbackHref="/admin/loans" label="Back to Borrow & Return" />
      <h1 className="mt-3 text-2xl font-bold tracking-tight text-ink">Check Out a Book</h1>

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
