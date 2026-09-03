-- Transfer the executive-section global administrator from departed Cecilia Farias
-- to Katherine Canales. This migration is idempotent and safe to apply after the
-- earlier Cecilia-specific hardening migrations.

alter table public.profiles
  drop constraint if exists profiles_super_admin_identity_check;

alter table public.profiles
  drop constraint if exists profiles_cecilia_canonical_admin_check;

alter table public.profiles
  drop constraint if exists profiles_katherine_canonical_admin_check;

alter table public.profiles
  drop constraint if exists profiles_departed_cecilia_disabled_check;

-- Remove any prior global privilege before assigning the new canonical admin.
update public.profiles
set role = 'ejecutiva'
where role = 'super_admin';

-- Cecilia no longer works at Labbe. Disable every known identity so stale
-- credentials/cookies cannot resolve to an active persisted profile.
update public.profiles
set role = 'ejecutiva',
    is_active = false,
    updated_at = now()
where lower(trim(email)) in (
  'cfarias@labbe.cl',
  'cecilia.farias@labbe.cl',
  'cecilia.farias@transporteslabbe.cl'
);

-- Katherine is the sole global administrator for the executive workflow.
update public.profiles
set role = 'super_admin',
    is_active = true,
    updated_at = now()
where lower(trim(email)) = 'kcanales@labbe.cl';

-- Fail loudly if the canonical Katherine profile is missing.
do $$
begin
  if not exists (
    select 1
    from public.profiles
    where lower(trim(email)) = 'kcanales@labbe.cl'
      and role = 'super_admin'
      and coalesce(is_active, true) = true
  ) then
    raise exception 'Canonical Katherine Canales profile not found or could not be promoted';
  end if;
end;
$$;

alter table public.profiles
  add constraint profiles_super_admin_identity_check
  check (
    role <> 'super_admin'
    or (
      lower(trim(email)) = 'kcanales@labbe.cl'
      and coalesce(is_active, true) = true
    )
  );

alter table public.profiles
  add constraint profiles_katherine_canonical_admin_check
  check (
    lower(trim(email)) <> 'kcanales@labbe.cl'
    or (role = 'super_admin' and coalesce(is_active, true) = true)
  );

alter table public.profiles
  add constraint profiles_departed_cecilia_disabled_check
  check (
    lower(trim(email)) not in (
      'cfarias@labbe.cl',
      'cecilia.farias@labbe.cl',
      'cecilia.farias@transporteslabbe.cl'
    )
    or coalesce(is_active, true) = false
  );

create unique index if not exists profiles_single_super_admin_idx
  on public.profiles ((role))
  where role = 'super_admin';
