-- Leela's Library — initial schema
-- Run this once in the Supabase SQL editor (see README for step-by-step instructions).

create extension if not exists pgcrypto;
create extension if not exists pg_trgm;

-- ---------------------------------------------------------------------------
-- profiles: one row per auth.users row, holds the app-level role
-- ---------------------------------------------------------------------------
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text,
  email text,
  role text not null default 'user' check (role in ('user', 'admin')),
  created_at timestamptz not null default now()
);

create index idx_profiles_email_trgm on public.profiles using gin (email gin_trgm_ops);
create index idx_profiles_full_name_trgm on public.profiles using gin (full_name gin_trgm_ops);

alter table public.profiles enable row level security;

-- SECURITY DEFINER helper: lets policies check "is this uid an admin" without
-- re-triggering RLS recursion on profiles.
create or replace function public.is_admin(uid uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.profiles where id = uid and role = 'admin'
  );
$$;

-- Auto-create a profile row whenever a new auth user is created.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, email, role)
  values (new.id, new.raw_user_meta_data ->> 'full_name', new.email, 'user');
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Keep profiles.email in sync if a user ever changes their login email.
create or replace function public.handle_user_email_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.email is distinct from old.email then
    update public.profiles set email = new.email where id = new.id;
  end if;
  return new;
end;
$$;

create trigger on_auth_user_email_changed
  after update on auth.users
  for each row execute function public.handle_user_email_change();

-- Prevent a non-admin from granting themselves admin via a direct profile update.
create or replace function public.prevent_role_self_escalation()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.role <> old.role and not public.is_admin(auth.uid()) then
    new.role := old.role;
  end if;
  return new;
end;
$$;

create trigger trg_prevent_role_escalation
  before update on public.profiles
  for each row execute function public.prevent_role_self_escalation();

create policy "profiles_select_own_or_admin"
  on public.profiles for select
  to authenticated
  using (id = auth.uid() or public.is_admin(auth.uid()));

create policy "profiles_update_own_or_admin"
  on public.profiles for update
  to authenticated
  using (id = auth.uid() or public.is_admin(auth.uid()))
  with check (id = auth.uid() or public.is_admin(auth.uid()));

-- ---------------------------------------------------------------------------
-- books
-- ---------------------------------------------------------------------------
create table public.books (
  id uuid primary key default gen_random_uuid(),
  title text not null check (char_length(title) between 1 and 300),
  author text not null check (char_length(author) between 1 and 300),
  genre text check (char_length(genre) <= 100),
  isbn text check (char_length(isbn) <= 50),
  shelf_location text check (char_length(shelf_location) <= 100),
  cover_image_path text,
  notes text check (char_length(notes) <= 2000),
  status text not null default 'available' check (status in ('available', 'checked_out')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

create trigger trg_books_updated_at
  before update on public.books
  for each row execute function public.set_updated_at();

-- Partial-text search: trigram GIN indexes (NOT hash — hash only does exact match).
create index idx_books_title_trgm on public.books using gin (title gin_trgm_ops);
create index idx_books_author_trgm on public.books using gin (author gin_trgm_ops);
create index idx_books_genre_trgm on public.books using gin (genre gin_trgm_ops);
create index idx_books_isbn_trgm on public.books using gin (isbn gin_trgm_ops);

-- Exact-match / sort columns.
create index idx_books_status on public.books (status);
create index idx_books_genre on public.books (genre);
create index idx_books_author on public.books (author);

alter table public.books enable row level security;

create policy "books_select_anyone"
  on public.books for select
  to anon, authenticated
  using (true);

create policy "books_insert_admin"
  on public.books for insert
  to authenticated
  with check (public.is_admin(auth.uid()));

create policy "books_update_admin"
  on public.books for update
  to authenticated
  using (public.is_admin(auth.uid()))
  with check (public.is_admin(auth.uid()));

create policy "books_delete_admin"
  on public.books for delete
  to authenticated
  using (public.is_admin(auth.uid()));

-- ---------------------------------------------------------------------------
-- loans
-- ---------------------------------------------------------------------------
create table public.loans (
  id uuid primary key default gen_random_uuid(),
  book_id uuid not null references public.books (id) on delete cascade,
  borrower_user_id uuid references public.profiles (id) on delete set null,
  borrower_name text check (char_length(borrower_name) <= 200),
  borrower_contact text check (char_length(borrower_contact) <= 200),
  checked_out_at timestamptz not null default now(),
  due_date date not null,
  returned_at timestamptz,
  created_by uuid references public.profiles (id) on delete set null,
  constraint borrower_identified check (
    borrower_user_id is not null or borrower_name is not null
  )
);

-- A book can only have one active (not-yet-returned) loan at a time.
create unique index idx_loans_one_active_per_book
  on public.loans (book_id)
  where returned_at is null;

create index idx_loans_due_date on public.loans (due_date);
create index idx_loans_borrower_user on public.loans (borrower_user_id);
create index idx_loans_book on public.loans (book_id);
create index idx_loans_active on public.loans (returned_at) where returned_at is null;

alter table public.loans enable row level security;

create policy "loans_select_own_or_admin"
  on public.loans for select
  to authenticated
  using (borrower_user_id = auth.uid() or public.is_admin(auth.uid()));

create policy "loans_insert_admin"
  on public.loans for insert
  to authenticated
  with check (public.is_admin(auth.uid()));

create policy "loans_update_admin"
  on public.loans for update
  to authenticated
  using (public.is_admin(auth.uid()))
  with check (public.is_admin(auth.uid()));

-- Keep books.status in sync with loans automatically, and block deleting
-- (or double-checking-out) a book that's currently on loan.
create or replace function public.sync_book_status_on_loan_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if tg_op = 'INSERT' then
    update public.books set status = 'checked_out' where id = new.book_id;
  elsif tg_op = 'UPDATE' then
    if new.returned_at is not null and old.returned_at is null then
      update public.books set status = 'available' where id = new.book_id;
    end if;
  end if;
  return new;
end;
$$;

create trigger trg_sync_book_status
  after insert or update on public.loans
  for each row execute function public.sync_book_status_on_loan_change();

create or replace function public.block_delete_of_checked_out_book()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if old.status = 'checked_out' then
    raise exception 'This book is currently checked out and cannot be deleted until it is returned.'
      using errcode = 'P0001';
  end if;
  return old;
end;
$$;

create trigger trg_block_delete_checked_out
  before delete on public.books
  for each row execute function public.block_delete_of_checked_out_book();

-- ---------------------------------------------------------------------------
-- zero_result_searches: for the admin's "suggested acquisitions" list.
-- No personal data — just the query text and when it happened.
-- ---------------------------------------------------------------------------
create table public.zero_result_searches (
  id bigint generated always as identity primary key,
  query text not null check (char_length(query) between 1 and 200),
  searched_at timestamptz not null default now()
);

create index idx_zero_result_searches_searched_at on public.zero_result_searches (searched_at desc);

alter table public.zero_result_searches enable row level security;

create policy "zero_result_searches_insert_anyone"
  on public.zero_result_searches for insert
  to anon, authenticated
  with check (true);

create policy "zero_result_searches_select_admin"
  on public.zero_result_searches for select
  to authenticated
  using (public.is_admin(auth.uid()));

-- ---------------------------------------------------------------------------
-- Admin-only aggregate function for "high demand, low availability" signal.
-- SECURITY DEFINER so it can read across all loans/books, but it checks
-- admin status itself before returning anything.
-- ---------------------------------------------------------------------------
create or replace function public.get_genre_demand()
returns table (
  genre text,
  total_books bigint,
  available_books bigint,
  total_borrows bigint,
  demand_ratio numeric
)
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_admin(auth.uid()) then
    raise exception 'Admin only.';
  end if;

  return query
  select
    b.genre,
    count(distinct b.id) as total_books,
    count(distinct b.id) filter (where b.status = 'available') as available_books,
    count(l.id) as total_borrows,
    round(
      count(l.id)::numeric / greatest(count(distinct b.id), 1),
      2
    ) as demand_ratio
  from public.books b
  left join public.loans l on l.book_id = b.id
  where b.genre is not null and b.genre <> ''
  group by b.genre
  having count(distinct b.id) >= 1
  order by demand_ratio desc;
end;
$$;
