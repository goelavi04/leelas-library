-- Leela's Library — allow bootstrapping the first admin.
--
-- prevent_role_self_escalation (0001_init.sql) blocks any role change made
-- by a non-admin, which is correct once an admin exists — but with zero
-- admins in the table, nobody could ever pass that check, including the
-- library's own owner. This carves out a single exception: a user may
-- promote themselves to 'admin' only while the profiles table has no
-- admin at all. Once one admin exists, this path closes and every
-- further promotion must go through an existing admin, same as before.

create or replace function public.prevent_role_self_escalation()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.role <> old.role and not public.is_admin(auth.uid()) then
    if new.role = 'admin'
       and new.id = auth.uid()
       and not exists (select 1 from public.profiles where role = 'admin') then
      return new;
    end if;
    new.role := old.role;
  end if;
  return new;
end;
$$;
