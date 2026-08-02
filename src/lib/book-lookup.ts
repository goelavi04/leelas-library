import "server-only";

export interface BookLookupResult {
  title: string;
  author: string | null;
  genre: string | null;
  coverDataUrl: string | null;
}

const FETCH_TIMEOUT_MS = 6000;

async function fetchWithTimeout(url: string): Promise<Response | null> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    const res = await fetch(url, { signal: controller.signal, headers: { Accept: "application/json" } });
    if (!res.ok) return null;
    return res;
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

async function imageUrlToDataUrl(url: string): Promise<string | null> {
  const res = await fetchWithTimeout(url);
  if (!res) return null;
  const contentType = res.headers.get("content-type") ?? "image/jpeg";
  if (!contentType.startsWith("image/")) return null;
  const buffer = Buffer.from(await res.arrayBuffer());
  if (buffer.byteLength === 0) return null;
  return `data:${contentType};base64,${buffer.toString("base64")}`;
}

interface OpenLibraryBook {
  title?: string;
  authors?: { name: string }[];
  subjects?: { name: string }[];
  cover?: { large?: string; medium?: string };
}

async function lookupOpenLibrary(isbn: string): Promise<BookLookupResult | null> {
  const res = await fetchWithTimeout(
    `https://openlibrary.org/api/books?bibkeys=ISBN:${isbn}&jscmd=data&format=json`
  );
  if (!res) return null;

  const data = (await res.json()) as Record<string, OpenLibraryBook>;
  const book = data[`ISBN:${isbn}`];
  if (!book?.title) return null;

  const coverUrl = book.cover?.large ?? book.cover?.medium ?? null;

  return {
    title: book.title,
    author: book.authors?.map((a) => a.name).join(", ") ?? null,
    genre: book.subjects?.[0]?.name ?? null,
    coverDataUrl: coverUrl ? await imageUrlToDataUrl(coverUrl) : null,
  };
}

interface GoogleVolumeInfo {
  title?: string;
  authors?: string[];
  categories?: string[];
  imageLinks?: { thumbnail?: string; smallThumbnail?: string };
}

async function lookupGoogleBooks(isbn: string): Promise<BookLookupResult | null> {
  const res = await fetchWithTimeout(
    `https://www.googleapis.com/books/v1/volumes?q=isbn:${isbn}`
  );
  if (!res) return null;

  const data = (await res.json()) as { items?: { volumeInfo?: GoogleVolumeInfo }[] };
  const info = data.items?.[0]?.volumeInfo;
  if (!info?.title) return null;

  const thumbnail = info.imageLinks?.thumbnail ?? info.imageLinks?.smallThumbnail ?? null;
  // Google serves these over http:// by default; force https to avoid a
  // mixed-content fetch failure from our server.
  const coverUrl = thumbnail ? thumbnail.replace(/^http:/, "https:") : null;

  return {
    title: info.title,
    author: info.authors?.join(", ") ?? null,
    genre: info.categories?.[0] ?? null,
    coverDataUrl: coverUrl ? await imageUrlToDataUrl(coverUrl) : null,
  };
}

/** Normalizes a scanned barcode to a bare ISBN-10/13 (digits and a trailing X only). */
export function normalizeIsbn(raw: string): string | null {
  const cleaned = raw.replace(/[^0-9Xx]/g, "").toUpperCase();
  if (cleaned.length !== 10 && cleaned.length !== 13) return null;
  return cleaned;
}

/** Converts ISBN-13 <-> ISBN-10 so a book indexed under only one format still resolves. */
function alternateIsbn(isbn: string): string | null {
  if (isbn.length === 13) {
    if (!isbn.startsWith("978")) return null;
    const core = isbn.slice(3, 12);
    let sum = 0;
    for (let i = 0; i < 9; i++) sum += (10 - i) * Number(core[i]);
    const check = (11 - (sum % 11)) % 11;
    return core + (check === 10 ? "X" : String(check));
  }

  if (isbn.length === 10) {
    const core = "978" + isbn.slice(0, 9);
    let sum = 0;
    for (let i = 0; i < 12; i++) sum += (i % 2 === 0 ? 1 : 3) * Number(core[i]);
    return core + String((10 - (sum % 10)) % 10);
  }

  return null;
}

async function lookupByExactIsbn(isbn: string): Promise<BookLookupResult | null> {
  return (await lookupOpenLibrary(isbn)) ?? (await lookupGoogleBooks(isbn));
}

/** Looks up a book by ISBN, trying Open Library then Google Books, then the same
 * two providers again under the equivalent ISBN-10/13 in case the book is only
 * indexed under the other format. */
export async function lookupBook(isbn: string): Promise<BookLookupResult | null> {
  const direct = await lookupByExactIsbn(isbn);
  if (direct) return direct;

  const alternate = alternateIsbn(isbn);
  if (!alternate) return null;
  return lookupByExactIsbn(alternate);
}
