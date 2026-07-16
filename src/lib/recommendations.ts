import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database, Book } from "@/lib/supabase/types";

/**
 * Rules-based "you might also like": looks at genres/authors the user has
 * actually borrowed before, and surfaces other currently-available books
 * that share one of those, ranked by how often that genre/author shows up
 * in their history. No ML — just an explainable overlap query.
 */
export async function getYouMightLike(
  supabase: SupabaseClient<Database>,
  userId: string,
  limit = 8
): Promise<Book[]> {
  const { data: history } = await supabase
    .from("loans")
    .select("book_id, books:book_id (id, genre, author)")
    .eq("borrower_user_id", userId);

  const borrowedBookIds = new Set<string>();
  const genreCounts = new Map<string, number>();
  const authorCounts = new Map<string, number>();

  for (const row of (history ?? []) as unknown as {
    book_id: string;
    books: { id: string; genre: string | null; author: string | null } | null;
  }[]) {
    borrowedBookIds.add(row.book_id);
    if (row.books?.genre) genreCounts.set(row.books.genre, (genreCounts.get(row.books.genre) ?? 0) + 1);
    if (row.books?.author) authorCounts.set(row.books.author, (authorCounts.get(row.books.author) ?? 0) + 1);
  }

  const genres = [...genreCounts.keys()];
  const authors = [...authorCounts.keys()];

  if (genres.length === 0 && authors.length === 0) return [];

  const orParts: string[] = [];
  if (genres.length > 0) orParts.push(`genre.in.(${genres.map((g) => `"${g.replace(/"/g, "")}"`).join(",")})`);
  if (authors.length > 0) orParts.push(`author.in.(${authors.map((a) => `"${a.replace(/"/g, "")}"`).join(",")})`);

  const { data: candidates } = await supabase
    .from("books")
    .select("*")
    .eq("status", "available")
    .or(orParts.join(","))
    .limit(200);

  const scored = (candidates ?? [])
    .filter((book) => !borrowedBookIds.has(book.id))
    .map((book) => ({
      book,
      score: (book.genre ? genreCounts.get(book.genre) ?? 0 : 0) + (authorCounts.get(book.author) ?? 0),
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((entry) => entry.book);

  return scored;
}
