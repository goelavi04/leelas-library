-- Leela's Library — retire self-signup "users" in favor of admin-managed Members.
--
-- The app no longer lets people create their own borrower account. Instead,
-- admins maintain a `members` directory directly, and loans attach to a
-- member instead of a Supabase-auth user. This migration adds that table,
-- backfills any existing borrower_user_id loans into it (so history stays
-- readable even though nobody signs up as a plain "user" anymore), and then
-- drops the now-unused column.

-- ---------------------------------------------------------------------------
-- members: admin-managed borrower directory. No auth.users row, no login —
-- purely a record the admin creates/edits, same trust level as `books`.
-- ---------------------------------------------------------------------------
create table public.members (
  id uuid primary key default gen_random_uuid(),
  full_name text not null check (char_length(full_name) between 1 and 200),
  email text check (char_length(email) <= 200),
  phone text check (char_length(phone) <= 50),
  notes text check (char_length(notes) <= 2000),
  created_at timestamptz not null default now(),
  created_by uuid references public.profiles (id) on delete set null
);

create index idx_members_full_name_trgm on public.members using gin (full_name gin_trgm_ops);
create index idx_members_email_trgm on public.members using gin (email gin_trgm_ops);
create index idx_members_phone_trgm on public.members using gin (phone gin_trgm_ops);

alter table public.members enable row level security;

create policy "members_select_admin"
  on public.members for select
  to authenticated
  using (public.is_admin(auth.uid()));

create policy "members_insert_admin"
  on public.members for insert
  to authenticated
  with check (public.is_admin(auth.uid()));

create policy "members_update_admin"
  on public.members for update
  to authenticated
  using (public.is_admin(auth.uid()))
  with check (public.is_admin(auth.uid()));

create policy "members_delete_admin"
  on public.members for delete
  to authenticated
  using (public.is_admin(auth.uid()));

-- ---------------------------------------------------------------------------
-- loans: point at members instead of profiles.
-- ---------------------------------------------------------------------------
alter table public.loans add column member_id uuid references public.members (id) on delete set null;
create index idx_loans_member on public.loans (member_id);

-- Backfill: turn every distinct borrower_user_id still referenced by a loan
-- into a member row (copying name/email from their old profile), then point
-- those loans at it via an explicit id mapping table. No-op on a fresh/empty
-- install, and skipped entirely if this migration has already run once
-- (borrower_user_id column already gone).
do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'loans' and column_name = 'borrower_user_id'
  ) then
    create temporary table _member_backfill (profile_id uuid primary key, member_id uuid not null);

    insert into _member_backfill (profile_id, member_id)
    select p.id, gen_random_uuid()
    from (select distinct borrower_user_id from public.loans where borrower_user_id is not null) l
    join public.profiles p on p.id = l.borrower_user_id;

    insert into public.members (id, full_name, email, created_at)
    select b.member_id, coalesce(p.full_name, 'Unknown'), p.email, now()
    from _member_backfill b
    join public.profiles p on p.id = b.profile_id;

    update public.loans l
    set member_id = b.member_id
    from _member_backfill b
    where l.borrower_user_id = b.profile_id;

    drop table _member_backfill;
  end if;
end $$;

-- loans_select_own_or_admin (0001_init.sql) let a borrower see their own
-- loans via `borrower_user_id = auth.uid()`, which blocks dropping the
-- column. There's no more borrower self-login to serve (the dashboard that
-- used this is gone), so replace it with a plain admin-only policy.
drop policy if exists "loans_select_own_or_admin" on public.loans;
drop policy if exists "loans_select_admin" on public.loans;

create policy "loans_select_admin"
  on public.loans for select
  to authenticated
  using (public.is_admin(auth.uid()));

alter table public.loans drop constraint if exists borrower_identified;
alter table public.loans drop column if exists borrower_user_id;

alter table public.loans add constraint borrower_identified check (
  member_id is not null or borrower_name is not null
);

-- Block deleting a member who currently has a book checked out — otherwise
-- the "on delete set null" on loans.member_id would silently orphan the
-- active loan and the book would show as checked out to nobody.
create or replace function public.block_delete_of_member_with_active_loan()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if exists (select 1 from public.loans where member_id = old.id and returned_at is null) then
    raise exception 'This member currently has a book checked out and cannot be deleted until it is returned.'
      using errcode = 'P0001';
  end if;
  return old;
end;
$$;

create trigger trg_block_delete_member_with_active_loan
  before delete on public.members
  for each row execute function public.block_delete_of_member_with_active_loan();
