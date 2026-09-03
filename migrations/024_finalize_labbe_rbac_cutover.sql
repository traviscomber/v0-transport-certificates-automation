-- Final production cutover after the authorization code is deployed.
-- Katherine Canales' canonical identity is the sole global administrator.
-- Cecilia Farias has left the company and all of her known identities are disabled.
-- All other named operational identities become normal executives.

update public.profiles
set role = case
  when lower(trim(email)) = 'kcanales@labbe.cl' then 'super_admin'
  else 'ejecutiva'
end,
is_active = case
  when lower(trim(email)) in (
    'cfarias@labbe.cl',
    'cecilia.farias@labbe.cl',
    'cecilia.farias@transporteslabbe.cl'
  ) then false
  else coalesce(is_active, true)
end
where lower(trim(email)) in (
  'kcanales@labbe.cl',
  'cfarias@labbe.cl',
  'cecilia.farias@labbe.cl',
  'cecilia.farias@transporteslabbe.cl',
  'carolina.sepulveda@labbe.cl',
  'carolina.sepulveda@transporteslabbe.cl',
  'csepulveda@labbe.cl',
  'jayala@labbe.cl',
  'ocarrasco@labbe.cl',
  'olga.carrasco@labbe.cl',
  'olga.carrasco@transporteslabbe.cl'
);

alter table public.profiles
  drop constraint if exists profiles_cecilia_canonical_admin_check;

alter table public.profiles
  drop constraint if exists profiles_katherine_canonical_admin_check;

alter table public.profiles
  add constraint profiles_katherine_canonical_admin_check
  check (
    lower(trim(email)) <> 'kcanales@labbe.cl'
    or (role = 'super_admin' and coalesce(is_active, true) = true)
  );

alter table public.profiles
  drop constraint if exists profiles_departed_cecilia_disabled_check;

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

-- After the cutover, legacy admin/mandante labels no longer authorize
-- subcontractor approval. Only normal executives and Katherine may decide.
create or replace function public.enforce_subcontractor_review_assignment()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  reviewer_email text;
  reviewer_role text;
  reviewer_name text;
  reviewer_full_name text;
  reviewer_first_name text;
  assigned_id uuid;
  assigned_email text;
  assigned_name text;
  assigned_full_name text;
  assigned_first_name text;
  legacy_assigned_name text;
begin
  if new.status not in ('approved', 'rejected') then
    return new;
  end if;

  reviewer_email := lower(trim(coalesce(new.reviewed_by_ejecutiva, '')));
  if reviewer_email = '' then
    raise exception using errcode = '42501', message = 'Reviewer identity is required for approved/rejected subcontractor documents';
  end if;

  select lower(trim(p.role)), p.full_name
    into reviewer_role, reviewer_name
  from public.profiles p
  where lower(trim(p.email)) = reviewer_email
    and coalesce(p.is_active, true) = true
  limit 1;

  if reviewer_role is null then
    raise exception using errcode = '42501', message = 'Active reviewer profile not found';
  end if;

  if reviewer_role = 'super_admin' then
    return new;
  end if;

  if reviewer_role <> 'ejecutiva' then
    raise exception using errcode = '42501', message = 'Only assigned executives may approve or reject subcontractor documents';
  end if;

  select coalesce(t.assigned_executive_id, t.ejecutivo_asignado), t.ejecutivo_nombre
    into assigned_id, legacy_assigned_name
  from public.transportistas t
  where t.id = new.subcontractor_id;

  if not found then
    raise exception using errcode = '42501', message = 'Transportista assignment could not be resolved';
  end if;

  reviewer_full_name := lower(trim(coalesce(reviewer_name, '')));
  reviewer_first_name := lower(split_part(trim(coalesce(reviewer_name, '')), ' ', 1));

  if assigned_id is not null then
    select lower(trim(es.email)), es.full_name
      into assigned_email, assigned_name
    from public.executive_staff es
    where es.id = assigned_id
      and coalesce(es.is_active, true) = true
    limit 1;

    if assigned_email is null and assigned_name is null then
      raise exception using errcode = '42501', message = 'Assigned executive is missing or inactive';
    end if;

    assigned_full_name := lower(trim(coalesce(assigned_name, '')));

    if reviewer_email <> coalesce(assigned_email, '')
       and (reviewer_full_name = '' or reviewer_full_name <> assigned_full_name) then
      raise exception using errcode = '42501', message = 'Reviewer is not assigned to this transportista';
    end if;

    return new;
  end if;

  if trim(coalesce(legacy_assigned_name, '')) <> '' then
    assigned_first_name := lower(split_part(trim(legacy_assigned_name), ' ', 1));
    if reviewer_first_name = '' or reviewer_first_name <> assigned_first_name then
      raise exception using errcode = '42501', message = 'Reviewer is not assigned to this transportista';
    end if;
    return new;
  end if;

  raise exception using errcode = '42501', message = 'Transportista has no assigned executive';
end;
$$;

revoke all on function public.enforce_subcontractor_review_assignment() from public;
revoke all on function public.enforce_subcontractor_review_assignment() from anon;
revoke all on function public.enforce_subcontractor_review_assignment() from authenticated;
