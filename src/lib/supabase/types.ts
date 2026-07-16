// Hand-written types mirroring supabase/migrations/0001_init.sql.
// If the schema changes, update this file to match.

export type Role = "user" | "admin";
export type BookStatus = "available" | "checked_out";

export interface Profile {
  id: string;
  full_name: string | null;
  email: string | null;
  role: Role;
  created_at: string;
}

export interface Book {
  id: string;
  title: string;
  author: string;
  genre: string | null;
  isbn: string | null;
  shelf_location: string | null;
  cover_image_path: string | null;
  notes: string | null;
  status: BookStatus;
  created_at: string;
  updated_at: string;
}

export interface Loan {
  id: string;
  book_id: string;
  borrower_user_id: string | null;
  borrower_name: string | null;
  borrower_contact: string | null;
  checked_out_at: string;
  due_date: string;
  returned_at: string | null;
  created_by: string | null;
}

export interface ZeroResultSearch {
  id: number;
  query: string;
  searched_at: string;
}

export interface GenreDemandRow {
  genre: string;
  total_books: number;
  available_books: number;
  total_borrows: number;
  demand_ratio: number;
}

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: Partial<Profile> & { id: string };
        Update: Partial<Profile>;
      };
      books: {
        Row: Book;
        Insert: Partial<Book> & { title: string; author: string };
        Update: Partial<Book>;
      };
      loans: {
        Row: Loan;
        Insert: Partial<Loan> & { book_id: string; due_date: string };
        Update: Partial<Loan>;
      };
      zero_result_searches: {
        Row: ZeroResultSearch;
        Insert: { query: string };
        Update: never;
      };
    };
    Views: Record<string, never>;
    Functions: {
      is_admin: {
        Args: { uid: string };
        Returns: boolean;
      };
      get_genre_demand: {
        Args: Record<string, never>;
        Returns: GenreDemandRow[];
      };
    };
  };
}
