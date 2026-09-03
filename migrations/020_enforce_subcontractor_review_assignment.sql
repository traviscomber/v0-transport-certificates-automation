-- Defense-in-depth for payment-critical subcontractor approvals.
-- Normal reviewers may approve/reject only documents belonging to the
-- transportista assigned to them. Only a persisted profiles.role=super_admin
-- can bypass the assignment boundary.

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
  reviewer_first_name text;
  assigned_id uuid;
  assigned_email text;
  assigned_name text;
  assigned_first_name text;
  legacy_assigned_name text;
begin
  -- Pending/reset operations are handled by the application audit workflow.
  -- This guard is specifically for decisions that affect compliance/payment.
  if new.status not in ('approved', 'rejected') then
    return new;
  end if;

  reviewer_email := lower(trim(coalesce(new.reviewed_by_ejecutiva, '')));
  if reviewer_email = '' then
    raise exception using
      errcode = '42501',
      message = 'Reviewer identity is required for approved/rejected subcontractor documents';
  end if;

  select lower(trim(p.role)), p.full_name
    into reviewer_role, reviewer_name
  from public.profiles p
  where lower(trim(p.email)) = reviewer_email
    and coalesce(p.is_active, true) = true
  limit 1;

  if reviewer_role is null then
    raise exception using
      errcode = '42501',
      message = 'Active reviewer profile not found';
  end if;

  if reviewer_role = 'super_admin' then
    return new;
  end if;

  if reviewer_role not in ('ejecutiva', 'admin', 'administrador', 'mandante') then
    raise exception using
      errcode = '42501',
      message = 'Reviewer role is not allowed to approve or reject subcontractor documents';
  end if;

  select coalesce(t.assigned_executive_id, t.ejecutivo_asignado), t.ejecutivo_nombre
    into assigned_id, legacy_assigned_name
  from public.transportistas t
  where t.id = new.subcontractor_id;

  if not found then
    raise exception using
      errcode = '42501',
      message = 'Transportista assignment could not be resolved';
  end if;

  reviewer_first_name := lower(split_part(trim(coalesce(reviewer_name, '')), ' ', 1));

  if assigned_id is not null then
    select lower(trim(es.email)), es.full_name
      into assigned_email, assigned_name
    from public.executive_staff es
    where es.id = assigned_id
      and coalesce(es.is_active, true) = true
    limit 1;

    if assigned_email is null and assigned_name is null then
      raise exception using
        errcode = '42501',
        message = 'Assigned executive is missing or inactive';
    end if;

    assigned_first_name := lower(split_part(trim(coalesce(assigned_name, '')), ' ', 1));

    if reviewer_email <> coalesce(assigned_email, '')
       and (reviewer_first_name = '' or reviewer_first_name <> assigned_first_name) then
      raise exception using
        errcode = '42501',
        message = 'Reviewer is not assigned to this transportista';
    end if;

    return new;
  end if;

  if trim(coalesce(legacy_assigned_name, '')) <> '' then
    assigned_first_name := lower(split_part(trim(legacy_assigned_name), ' ', 1));
    if reviewer_first_name = '' or reviewer_first_name <> assigned_first_name then
      raise exception using
        errcode = '42501',
        message = 'Reviewer is not assigned to this transportista';
    end if;
    return new;
  end if;

  -- Fail closed: a normal executive cannot approve an unassigned portfolio.
  raise exception using
    errcode = '42501',
    message = 'Transportista has no assigned executive';
end;
$$;

drop trigger if exists trg_enforce_subcontractor_review_assignment
  on public.subcontractor_documents;

create trigger trg_enforce_subcontractor_review_assignment
before insert or update of status, reviewed_by_ejecutiva
on public.subcontractor_documents
for each row
execute function public.enforce_subcontractor_review_assignment();
