"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { bookSchema } from "@/lib/validation";
import { uploadCoverImage, deleteCoverImage } from "@/lib/storage";
import { lookupBook, normalizeIsbn, type BookLookupResult } from "@/lib/book-lookup";

export interface BookFormState {
  error?: string;
  fieldErrors?: Record<string, string>;
}

function readBookFields(formData: FormData) {
  return {
    title: String(formData.get("title") ?? ""),
    author: String(formData.get("author") ?? ""),
    genre: String(formData.get("genre") ?? ""),
    isbn: String(formData.get("isbn") ?? ""),
    shelfLocation: String(formData.get("shelfLocation") ?? ""),
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

export async function createBook(
  _prevState: BookFormState,
  formData: FormData
): Promise<BookFormState> {
  await requireAdmin();

  const parsed = bookSchema.safeParse(readBookFields(formData));
  if (!parsed.success) {
    return { error: "Please fix the highlighted fields.", fieldErrors: firstFieldErrors(parsed.error.issues) };
  }

  const supabase = await createClient();

  let coverPath: string | null = null;
  const cover = formData.get("cover");
  if (cover instanceof File && cover.size > 0) {
    try {
      coverPath = await uploadCoverImage(supabase, cover);
    } catch (err) {
      return { error: err instanceof Error ? err.message : "Couldn't upload the cover image." };
    }
  }

  const { error } = await supabase.from("books").insert({
    title: parsed.data.title,
    author: parsed.data.author,
    genre: parsed.data.genre,
    isbn: parsed.data.isbn,
    shelf_location: parsed.data.shelfLocation,
    notes: parsed.data.notes,
    cover_image_path: coverPath,
  });

  if (error) {
    return { error: "Something went wrong saving this book. Please try again." };
  }

  revalidatePath("/admin/books");
  revalidatePath("/catalog");
  redirect("/admin/books");
}

export async function updateBook(
  bookId: string,
  _prevState: BookFormState,
  formData: FormData
): Promise<BookFormState> {
  await requireAdmin();

  const parsed = bookSchema.safeParse(readBookFields(formData));
  if (!parsed.success) {
    return { error: "Please fix the highlighted fields.", fieldErrors: firstFieldErrors(parsed.error.issues) };
  }

  const supabase = await createClient();

  const { data: existing } = await supabase
    .from("books")
    .select("cover_image_path")
    .eq("id", bookId)
    .single();

  let coverPath = existing?.cover_image_path ?? null;
  const cover = formData.get("cover");
  const removeCover = formData.get("removeCover") === "1";

  if (cover instanceof File && cover.size > 0) {
    try {
      const newPath = await uploadCoverImage(supabase, cover);
      await deleteCoverImage(supabase, coverPath);
      coverPath = newPath;
    } catch (err) {
      return { error: err instanceof Error ? err.message : "Couldn't upload the cover image." };
    }
  } else if (removeCover && coverPath) {
    await deleteCoverImage(supabase, coverPath);
    coverPath = null;
  }

  const { error } = await supabase
    .from("books")
    .update({
      title: parsed.data.title,
      author: parsed.data.author,
      genre: parsed.data.genre,
      isbn: parsed.data.isbn,
      shelf_location: parsed.data.shelfLocation,
      notes: parsed.data.notes,
      cover_image_path: coverPath,
    })
    .eq("id", bookId);

  if (error) {
    return { error: "Something went wrong saving this book. Please try again." };
  }

  revalidatePath("/admin/books");
  revalidatePath("/catalog");
  revalidatePath(`/catalog/${bookId}`);
  redirect("/admin/books");
}

export interface DeleteState {
  error?: string;
}

export async function deleteBook(bookId: string): Promise<DeleteState> {
  await requireAdmin();

  const supabase = await createClient();

  const { data: existing } = await supabase
    .from("books")
    .select("cover_image_path")
    .eq("id", bookId)
    .single();

  const { error } = await supabase.from("books").delete().eq("id", bookId);

  if (error) {
    if (error.message.toLowerCase().includes("checked out")) {
      return { error: error.message };
    }
    return { error: "Something went wrong deleting this book. Please try again." };
  }

  if (existing?.cover_image_path) {
    await deleteCoverImage(supabase, existing.cover_image_path);
  }

  revalidatePath("/admin/books");
  revalidatePath("/catalog");
  redirect("/admin/books");
}

export interface IsbnLookupState {
  data?: BookLookupResult;
  isbn?: string;
  error?: string;
}

export async function lookupBookByIsbn(rawIsbn: string): Promise<IsbnLookupState> {
  await requireAdmin();

  const isbn = normalizeIsbn(rawIsbn);
  if (!isbn) {
    return { error: "That doesn't look like a valid ISBN barcode." };
  }

  const result = await lookupBook(isbn);
  if (!result) {
    return { error: "No match found for this barcode — you can still enter the details manually.", isbn };
  }

  return { data: result, isbn };
}

/** Wrapper matching the (prevState, formData) shape useActionState expects. */
export async function confirmDeleteBook(
  bookId: string,
  _prevState: DeleteState,
  _formData: FormData
): Promise<DeleteState> {
  return deleteBook(bookId);
}
