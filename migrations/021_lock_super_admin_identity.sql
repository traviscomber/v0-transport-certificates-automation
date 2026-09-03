-- The global bypass is a named break-glass identity, not a domain privilege.
-- Only Cecilia's canonical account may ever carry profiles.role=super_admin.

update public.profiles
set role = 'ejecutiva'
where role = 'super_admin'
  and lower(trim(email)) <> 'cfarias@labbe.cl';

alter table public.profiles
  drop constraint if exists profiles_super_admin_identity_check;

alter table public.profiles
  add constraint profiles_super_admin_identity_check
  check (
    role <> 'super_admin'
    or (
      lower(trim(email)) = 'cfarias@labbe.cl'
      and coalesce(is_active, true) = true
    )
  );

create unique index if not exists profiles_single_super_admin_idx
  on public.profiles ((role))
  where role = 'super_admin';
