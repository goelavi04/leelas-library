"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { parseImportFile, type ParsedRow } from "@/lib/import";

export interface ParseState {
  rows?: ParsedRow[];
  warning?: string;
  error?: string;
}

const MAX_FILE_BYTES = 10 * 1024 * 1024; // 10 MB

export async function parseImportAction(_prevState: ParseState, formData: FormData): Promise<ParseState> {
  await requireAdmin();

  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return { error: "Choose a .csv, .xlsx, or .pdf file first." };
  }
  if (file.size > MAX_FILE_BYTES) {
    return { error: "That file is too large. Please use a file under 10 MB." };
  }

  try {
    const buffer = Buffer.from(await file.arrayBuffer());
    const result = await parseImportFile(file.name, buffer);

    if (result.rows.length === 0) {
      return { error: "No rows could be read from that file. Please check the file and try again." };
    }

    return { rows: result.rows, warning: result.warning };
  } catch (err) {
    return {
      error:
        err instanceof Error
          ? err.message
          : "Couldn't read that file. Please check it's a valid .csv, .xlsx, or .pdf.",
    };
  }
}

export interface ConfirmImportResult {
  error?: string;
  insertedCount?: number;
}

export async function confirmImportAction(rows: ParsedRow[]): Promise<ConfirmImportResult> {
  await requireAdmin();

  const validRows = rows
    .map((row) => ({
      title: row.title.trim(),
      author: row.author.trim(),
      genre: row.genre.trim() || null,
      isbn: row.isbn.trim() || null,
      shelf_location: row.shelfLocation.trim() || null,
      notes: row.notes.trim() || null,
    }))
    .filter((row) => row.title.length > 0 && row.author.length > 0);

  if (validRows.length === 0) {
    return { error: "Every row needs at least a title and an author." };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("books").insert(validRows);

  if (error) {
    return { error: "Something went wrong saving these books. Please try again." };
  }

  revalidatePath("/admin/books");
  revalidatePath("/catalog");

  return { insertedCount: validRows.length };
}
