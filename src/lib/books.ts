import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database, Book } from "@/lib/supabase/types";

export const PAGE_SIZE = 24;

/** Strips characters that have special meaning in a PostgREST .or() filter string. */
export function sanitizeSearchTerm(term: string): string {
  return term.replace(/[,()%_]/g, "").trim();
}

export function coverImageUrl(
  supabase: SupabaseClient<Database>,
  path: string | null
): string | null {
  if (!path) return null;
  return supabase.storage.from("book-covers").getPublicUrl(path).data.publicUrl;
}

export async function searchBooks(
  supabase: SupabaseClient<Database>,
  {
    query,
    availableOnly,
    page,
  }: { query: string; availableOnly: boolean; page: number }
): Promise<{ books: Book[]; total: number }> {
  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  let builder = supabase.from("books").select("*", { count: "exact" });

  const term = sanitizeSearchTerm(query);
  if (term) {
    builder = builder.or(
      `title.ilike.%${term}%,author.ilike.%${term}%,genre.ilike.%${term}%,isbn.ilike.%${term}%`
    );
  }
  if (availableOnly) {
    builder = builder.eq("status", "available");
  }

  const { data, count, error } = await builder
    .order("title", { ascending: true })
    .range(from, to);

  if (error) {
    // A transient failure here (network blip, upstream WAF blocking an
    // unusual query string, etc.) shouldn't crash the whole catalog page —
    // degrade to "no results" instead of a 500.
    console.error("searchBooks failed:", error);
    return { books: [], total: 0 };
  }

  return { books: data ?? [], total: count ?? 0 };
}
