// Hand-written types mirroring supabase/migrations/0001_init.sql.
// If the schema changes, update this file to match.
//
// NOTE: these must be `type` aliases, not `interface` declarations — the
// installed @supabase/postgrest-js version's type-level select parser
// resolves array-returning queries (anything without .single()) to `never`
// when the Row/Database shapes are declared as interfaces. Type aliases
// work correctly. Verified with an isolated repro before adopting this.

export type Role = "user" | "admin";
export type BookStatus = "available" | "checked_out";

export type Profile = {
  id: string;
  full_name: string | null;
  email: string | null;
  role: Role;
  created_at: string;
};

export type Member = {
  id: string;
  full_name: string;
  email: string | null;
  phone: string | null;
  notes: string | null;
  created_at: string;
  created_by: string | null;
};

export type Book = {
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
};

export type Loan = {
  id: string;
  book_id: string;
  member_id: string | null;
  borrower_name: string | null;
  borrower_contact: string | null;
  checked_out_at: string;
  due_date: string;
  returned_at: string | null;
  created_by: string | null;
};

export type ZeroResultSearch = {
  id: number;
  query: string;
  searched_at: string;
};

export type AdminCodeAttempt = {
  id: number;
  ip: string;
  attempted_at: string;
};

export type GenreDemandRow = {
  genre: string;
  total_books: number;
  available_books: number;
  total_borrows: number;
  demand_ratio: number;
};

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: Partial<Profile> & { id: string };
        Update: Partial<Profile>;
        Relationships: [];
      };
      books: {
        Row: Book;
        Insert: Partial<Book> & { title: string; author: string };
        Update: Partial<Book>;
        Relationships: [];
      };
      members: {
        Row: Member;
        Insert: Partial<Member> & { full_name: string };
        Update: Partial<Member>;
        Relationships: [];
      };
      loans: {
        Row: Loan;
        Insert: Partial<Loan> & { book_id: string; due_date: string };
        Update: Partial<Loan>;
        Relationships: [
          {
            foreignKeyName: "loans_member_id_fkey";
            columns: ["member_id"];
            isOneToOne: false;
            referencedRelation: "members";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "loans_book_id_fkey";
            columns: ["book_id"];
            isOneToOne: false;
            referencedRelation: "books";
            referencedColumns: ["id"];
          }
        ];
      };
      zero_result_searches: {
        Row: ZeroResultSearch;
        Insert: { query: string };
        Update: Partial<ZeroResultSearch>;
        Relationships: [];
      };
      admin_code_attempts: {
        Row: AdminCodeAttempt;
        Insert: { ip: string };
        Update: Partial<AdminCodeAttempt>;
        Relationships: [];
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
};
