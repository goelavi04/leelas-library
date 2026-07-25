"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { memberSchema } from "@/lib/validation";

export interface MemberFormState {
  error?: string;
  fieldErrors?: Record<string, string>;
}

function readMemberFields(formData: FormData) {
  return {
    fullName: String(formData.get("fullName") ?? ""),
    email: String(formData.get("email") ?? ""),
    phone: String(formData.get("phone") ?? ""),
    notes: String(formData.get("notes") ?? ""),
  };
}

function firstFieldErrors(issues: { path: PropertyKey[]; message: string }[]) {
  const out: Record<string, string> = {};
  for (const issue of issues) {
    const key = String(issue.path[0]);
    if (!out[key]) out[key] = issue.message;
  }
  return out;
}

export async function createMember(
  _prevState: MemberFormState,
  formData: FormData
): Promise<MemberFormState> {
  const session = await requireAdmin();

  const parsed = memberSchema.safeParse(readMemberFields(formData));
  if (!parsed.success) {
    return { error: "Please fix the highlighted fields.", fieldErrors: firstFieldErrors(parsed.error.issues) };
  }

  const supabase = await createClient();

  const { error } = await supabase.from("members").insert({
    full_name: parsed.data.fullName,
    email: parsed.data.email,
    phone: parsed.data.phone,
    notes: parsed.data.notes,
    created_by: session.userId,
  });

  if (error) {
    return { error: "Something went wrong saving this member. Please try again." };
  }

  revalidatePath("/admin/members");
  redirect("/admin/members");
}

export async function updateMember(
  memberId: string,
  _prevState: MemberFormState,
  formData: FormData
): Promise<MemberFormState> {
  await requireAdmin();

  const parsed = memberSchema.safeParse(readMemberFields(formData));
  if (!parsed.success) {
    return { error: "Please fix the highlighted fields.", fieldErrors: firstFieldErrors(parsed.error.issues) };
  }

  const supabase = await createClient();

  const { error } = await supabase
    .from("members")
    .update({
      full_name: parsed.data.fullName,
      email: parsed.data.email,
      phone: parsed.data.phone,
      notes: parsed.data.notes,
    })
    .eq("id", memberId);

  if (error) {
    return { error: "Something went wrong saving this member. Please try again." };
  }

  revalidatePath("/admin/members");
  redirect("/admin/members");
}

export interface DeleteMemberState {
  error?: string;
}

export async function deleteMember(memberId: string): Promise<DeleteMemberState> {
  await requireAdmin();

  const supabase = await createClient();

  const { error } = await supabase.from("members").delete().eq("id", memberId);

  if (error) {
    if (error.message.toLowerCase().includes("checked out")) {
      return { error: error.message };
    }
    return { error: "Something went wrong deleting this member. Please try again." };
  }

  revalidatePath("/admin/members");
  redirect("/admin/members");
}

/** Wrapper matching the (prevState, formData) shape useActionState expects. */
export async function confirmDeleteMember(
  memberId: string,
  _prevState: DeleteMemberState,
  _formData: FormData
): Promise<DeleteMemberState> {
  return deleteMember(memberId);
}
