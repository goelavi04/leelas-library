import "server-only";
import * as XLSX from "xlsx";
import { getDocumentProxy, extractText } from "unpdf";

export interface ParsedRow {
  title: string;
  author: string;
  genre: string;
  isbn: string;
  shelfLocation: string;
  notes: string;
}

export interface ParseResult {
  rows: ParsedRow[];
  warning?: string;
}

// Case-insensitive column name variants we recognize, keyed by our field name.
const COLUMN_ALIASES: Record<keyof ParsedRow, string[]> = {
  title: ["title", "booktitle", "book title", "name"],
  author: ["author", "authors", "authorname", "author name", "writer"],
  genre: ["genre", "category", "genres", "type"],
  isbn: ["isbn", "isbn13", "isbn-13", "isbn10", "isbn-10"],
  shelfLocation: ["shelflocation", "shelf location", "shelf", "location"],
  notes: ["notes", "note", "comments", "comment", "description"],
};

function normalizeHeader(header: string): string {
  return header.trim().toLowerCase();
}

function matchColumn(header: string): keyof ParsedRow | null {
  const normalized = normalizeHeader(header);
  for (const [field, aliases] of Object.entries(COLUMN_ALIASES)) {
    if (aliases.includes(normalized)) return field as keyof ParsedRow;
  }
  return null;
}

function emptyRow(): ParsedRow {
  return { title: "", author: "", genre: "", isbn: "", shelfLocation: "", notes: "" };
}

/** Parses a .csv or .xlsx file using real spreadsheet columns. */
export function parseSpreadsheet(buffer: Buffer): ParseResult {
  const workbook = XLSX.read(buffer, { type: "buffer" });
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];
  const raw: unknown[][] = XLSX.utils.sheet_to_json(sheet, { header: 1, blankrows: false });

  if (raw.length === 0) return { rows: [] };

  const headerRow = raw[0].map((cell) => String(cell ?? ""));
  const columnMap = new Map<number, keyof ParsedRow>();
  headerRow.forEach((header, index) => {
    const field = matchColumn(header);
    if (field) columnMap.set(index, field);
  });

  const rows: ParsedRow[] = [];
  for (let i = 1; i < raw.length; i++) {
    const dataRow = raw[i];
    const row = emptyRow();
    let hasAnyValue = false;
    for (const [index, field] of columnMap) {
      const value = dataRow[index];
      if (value !== undefined && value !== null && String(value).trim() !== "") {
        row[field] = String(value).trim();
        hasAnyValue = true;
      }
    }
    if (hasAnyValue) rows.push(row);
  }

  return { rows };
}

/**
 * Best-effort PDF parsing: PDFs are just text, so we split each line into
 * title/author by common separators. Never guaranteed to be perfect —
 * callers must show the admin a clear warning and a preview to fix by hand.
 */
export async function parsePdf(buffer: Buffer): Promise<ParseResult> {
  const pdf = await getDocumentProxy(new Uint8Array(buffer));
  const { text } = await extractText(pdf, { mergePages: true });

  const lines = text
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0);

  const rows: ParsedRow[] = lines.map((line) => {
    const row = emptyRow();

    let parts: string[] | null = null;
    if (line.includes(" | ")) {
      parts = line.split(" | ");
    } else if (line.includes(" - ")) {
      parts = line.split(" - ");
    } else if (line.includes("\t")) {
      parts = line.split("\t");
    } else if (/\s{2,}/.test(line)) {
      parts = line.split(/\s{2,}/);
    }

    if (parts && parts.length >= 2) {
      row.title = parts[0].trim();
      row.author = parts.slice(1).join(" ").trim();
    } else {
      row.title = line;
    }

    return row;
  });

  return {
    rows,
    warning:
      "PDF parsing is best-effort: each line was split into title/author using spacing and punctuation. Please check every row below before importing — some may need manual correction.",
  };
}

export async function parseImportFile(filename: string, buffer: Buffer): Promise<ParseResult> {
  const lower = filename.toLowerCase();
  if (lower.endsWith(".csv") || lower.endsWith(".xlsx") || lower.endsWith(".xls")) {
    return parseSpreadsheet(buffer);
  }
  if (lower.endsWith(".pdf")) {
    return parsePdf(buffer);
  }
  throw new Error("Unsupported file type. Please upload a .csv, .xlsx, or .pdf file.");
}
