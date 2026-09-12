-- Fixes migration 0029: the cast `requested_role::user_role` fails with
-- "type user_role does not exist" (42704) when this trigger fires from
-- the auth.users insert -- the unqualified type name doesn't resolve in
-- that execution context. Schema-qualifying it as public.user_role fixes
-- this regardless of search_path.

create or replace function public.handle_new_user()
returns trigger as $$
declare
  requested_role text := new.raw_user_meta_data->>'role';
begin
  insert into public.profiles (id, full_name, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', new.email),
    case when requested_role in ('nurse', 'chw') then requested_role::public.user_role else 'nurse'::public.user_role end
  );
  return new;
end;
$$ language plpgsql security definer set search_path = public;
