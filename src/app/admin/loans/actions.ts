"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { checkoutSchema } from "@/lib/validation";

export interface CheckoutFormState {
  error?: string;
  fieldErrors?: Record<string, string>;
}

export async function createLoan(
  _prevState: CheckoutFormState,
  formData: FormData
): Promise<CheckoutFormState> {
  const session = await requireAdmin();

  const parsed = checkoutSchema.safeParse({
    bookId: String(formData.get("bookId") ?? ""),
    memberId: String(formData.get("memberId") ?? ""),
    dueDate: String(formData.get("dueDate") ?? ""),
  });

  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = String(issue.path[0]);
      if (!fieldErrors[key]) fieldErrors[key] = issue.message;
    }
    return { error: "Please fix the highlighted fields.", fieldErrors };
  }

  const supabase = await createClient();

  const { error } = await supabase.from("loans").insert({
    book_id: parsed.data.bookId,
    member_id: parsed.data.memberId,
    due_date: parsed.data.dueDate,
    created_by: session.userId,
  });

  if (error) {
    if (error.code === "23505") {
      return { error: "This book is already checked out to someone else." };
    }
    return { error: "Something went wrong checking out this book. Please try again." };
  }

  revalidatePath("/admin/loans");
  revalidatePath("/admin/books");
  revalidatePath("/catalog");
  revalidatePath(`/catalog/${parsed.data.bookId}`);
  redirect("/admin/loans");
}

export async function markReturned(loanId: string): Promise<void> {
  await requireAdmin();
  const supabase = await createClient();

  const { data: loan } = await supabase.from("loans").select("book_id").eq("id", loanId).single();

  await supabase
    .from("loans")
    .update({ returned_at: new Date().toISOString() })
    .eq("id", loanId)
    .is("returned_at", null);

  revalidatePath("/admin/loans");
  revalidatePath("/admin/books");
  revalidatePath("/catalog");
  if (loan?.book_id) revalidatePath(`/catalog/${loan.book_id}`);
}
