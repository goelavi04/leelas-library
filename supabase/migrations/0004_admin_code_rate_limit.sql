-- Leela's Library — rate limit guesses against ADMIN_SIGNUP_CODE.
--
-- The signup form lets anyone attempt the admin code with no throttling.
-- Vercel functions are stateless between invocations, so an in-memory
-- counter wouldn't survive across requests — this needs to live in the
-- database instead. Locked down with RLS and no policies at all: only the
-- service-role key (used server-side in signup/actions.ts) can touch it.

create table public.admin_code_attempts (
  id bigint generated always as identity primary key,
  ip text not null,
  attempted_at timestamptz not null default now()
);

create index idx_admin_code_attempts_ip_time on public.admin_code_attempts (ip, attempted_at desc);

alter table public.admin_code_attempts enable row level security;
-- No policies created — RLS with zero policies denies all access to
-- anon/authenticated roles by default. Service role bypasses RLS entirely.

-- Old rows are harmless (just a rate-limit ledger) but there's no reason
-- to keep them forever.
create or replace function public.prune_admin_code_attempts()
returns void
language sql
security definer
set search_path = public
as $$
  delete from public.admin_code_attempts where attempted_at < now() - interval '1 day';
$$;
