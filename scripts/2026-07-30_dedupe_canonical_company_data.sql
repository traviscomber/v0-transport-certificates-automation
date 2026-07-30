begin;

-- 1) Merge exact duplicate transportista by normalized RUT.
update public.conductores
set transportista_id = '1af7da5e-2112-4057-a55d-0f46ba135d29'::uuid
where transportista_id = 'd06173f4-6afc-4ca3-857b-485cc0644b42'::uuid;

update public.executive_staff
set transportista_id = '1af7da5e-2112-4057-a55d-0f46ba135d29'::uuid
where transportista_id = 'd06173f4-6afc-4ca3-857b-485cc0644b42'::uuid;

update public.mandante_transportista
set transportista_id = '1af7da5e-2112-4057-a55d-0f46ba135d29'::uuid
where transportista_id = 'd06173f4-6afc-4ca3-857b-485cc0644b42'::uuid;

update public.subcontractor_document_alerts
set subcontractor_id = '1af7da5e-2112-4057-a55d-0f46ba135d29'::uuid
where subcontractor_id = 'd06173f4-6afc-4ca3-857b-485cc0644b42'::uuid;

update public.subcontractor_documents
set subcontractor_id = '1af7da5e-2112-4057-a55d-0f46ba135d29'::uuid
where subcontractor_id = 'd06173f4-6afc-4ca3-857b-485cc0644b42'::uuid;

update public.transportista_auth
set transportista_id = '1af7da5e-2112-4057-a55d-0f46ba135d29'::uuid
where transportista_id = 'd06173f4-6afc-4ca3-857b-485cc0644b42'::uuid;

update public.uploaded_documents
set transportista_id = '1af7da5e-2112-4057-a55d-0f46ba135d29'::uuid
where transportista_id = 'd06173f4-6afc-4ca3-857b-485cc0644b42'::uuid;

update public.vehiculos
set transportista_id = '1af7da5e-2112-4057-a55d-0f46ba135d29'::uuid
where transportista_id = 'd06173f4-6afc-4ca3-857b-485cc0644b42'::uuid;

update public.company_document_compliance
set transportista_id = '1af7da5e-2112-4057-a55d-0f46ba135d29'::uuid
where transportista_id = 'd06173f4-6afc-4ca3-857b-485cc0644b42'::uuid;

update public.transportistas keeper
set nombre_fantasia = coalesce(keeper.nombre_fantasia, loser.nombre_fantasia),
    updated_at = now()
from public.transportistas loser
where keeper.id = '1af7da5e-2112-4057-a55d-0f46ba135d29'::uuid
  and loser.id = 'd06173f4-6afc-4ca3-857b-485cc0644b42'::uuid;

delete from public.transportistas
where id = 'd06173f4-6afc-4ca3-857b-485cc0644b42'::uuid
  and upper(regexp_replace(coalesce(rut, ''), '[^0-9Kk]', '', 'g')) = '76902431K';

-- 2) Merge same-company duplicate where one RUT is invalid.
update public.conductores
set transportista_id = '7026200a-4ea5-4395-bd9b-ba435bb7897e'::uuid
where transportista_id = '2927bdca-e525-4fcd-b812-644f8038520a'::uuid;

update public.executive_staff
set transportista_id = '7026200a-4ea5-4395-bd9b-ba435bb7897e'::uuid
where transportista_id = '2927bdca-e525-4fcd-b812-644f8038520a'::uuid;

update public.mandante_transportista
set transportista_id = '7026200a-4ea5-4395-bd9b-ba435bb7897e'::uuid
where transportista_id = '2927bdca-e525-4fcd-b812-644f8038520a'::uuid;

update public.subcontractor_document_alerts
set subcontractor_id = '7026200a-4ea5-4395-bd9b-ba435bb7897e'::uuid
where subcontractor_id = '2927bdca-e525-4fcd-b812-644f8038520a'::uuid;

update public.subcontractor_documents
set subcontractor_id = '7026200a-4ea5-4395-bd9b-ba435bb7897e'::uuid
where subcontractor_id = '2927bdca-e525-4fcd-b812-644f8038520a'::uuid;

update public.transportista_auth
set transportista_id = '7026200a-4ea5-4395-bd9b-ba435bb7897e'::uuid
where transportista_id = '2927bdca-e525-4fcd-b812-644f8038520a'::uuid;

update public.uploaded_documents
set transportista_id = '7026200a-4ea5-4395-bd9b-ba435bb7897e'::uuid
where transportista_id = '2927bdca-e525-4fcd-b812-644f8038520a'::uuid;

update public.vehiculos
set transportista_id = '7026200a-4ea5-4395-bd9b-ba435bb7897e'::uuid
where transportista_id = '2927bdca-e525-4fcd-b812-644f8038520a'::uuid;

update public.company_document_compliance
set transportista_id = '7026200a-4ea5-4395-bd9b-ba435bb7897e'::uuid
where transportista_id = '2927bdca-e525-4fcd-b812-644f8038520a'::uuid;

update public.transportistas keeper
set nombre_fantasia = coalesce(keeper.nombre_fantasia, loser.nombre_fantasia),
    updated_at = now()
from public.transportistas loser
where keeper.id = '7026200a-4ea5-4395-bd9b-ba435bb7897e'::uuid
  and loser.id = '2927bdca-e525-4fcd-b812-644f8038520a'::uuid;

delete from public.transportistas
where id = '2927bdca-e525-4fcd-b812-644f8038520a'::uuid
  and razon_social = 'Transportes San Lorenzo Spa'
  and rut = '77302429-2';

-- 3) Merge exact duplicate conductor by normalized RUT.
update public.conductor_document_compliance
set conductor_id = '688c31a4-073c-4f81-a0a1-bd60cb0f20c8'::uuid
where conductor_id = '182ba1ea-8fd9-476d-b8d8-0c091436376b'::uuid;

update public.conductor_vehiculo
set conductor_id = '688c31a4-073c-4f81-a0a1-bd60cb0f20c8'::uuid
where conductor_id = '182ba1ea-8fd9-476d-b8d8-0c091436376b'::uuid;

update public.uploaded_documents
set conductor_id = '688c31a4-073c-4f81-a0a1-bd60cb0f20c8'::uuid
where conductor_id = '182ba1ea-8fd9-476d-b8d8-0c091436376b'::uuid;

update public.conductores keeper
set rut_proveedor = coalesce(keeper.rut_proveedor, loser.rut_proveedor),
    updated_at = now()
from public.conductores loser
where keeper.id = '688c31a4-073c-4f81-a0a1-bd60cb0f20c8'::uuid
  and loser.id = '182ba1ea-8fd9-476d-b8d8-0c091436376b'::uuid;

delete from public.conductor_auth
where conductor_id = '182ba1ea-8fd9-476d-b8d8-0c091436376b'::uuid
  and rut = '12345678-9';

delete from public.conductores
where id = '182ba1ea-8fd9-476d-b8d8-0c091436376b'::uuid
  and upper(regexp_replace(coalesce(rut, ''), '[^0-9Kk]', '', 'g')) = '123456789';

commit;
