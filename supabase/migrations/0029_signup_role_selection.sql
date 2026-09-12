-- Extends the existing handle_new_user() trigger (0001_init.sql) to let
-- self-service signup choose their role, restricted to 'nurse' or 'chw'
-- only. Deliberately never allows 'admin' from user-supplied metadata --
-- that's still assigned manually (update profiles set role='admin' ...)
-- rather than self-selectable, since admin has broader permissions
-- (approving Ministry reports, managing facilities) that shouldn't be
-- grantable by anyone who fills out a signup form.

create or replace function public.handle_new_user()
returns trigger as $$
declare
  requested_role text := new.raw_user_meta_data->>'role';
begin
  insert into public.profiles (id, full_name, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', new.email),
    case when requested_role in ('nurse', 'chw') then requested_role::user_role else 'nurse'::user_role end
  );
  return new;
end;
$$ language plpgsql security definer;
