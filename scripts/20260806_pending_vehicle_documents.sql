create or replace function public.get_pending_vehicle_documents(p_limit integer default 20)
returns table (
  id uuid,
  subcontractor_id uuid,
  document_type_id uuid,
  file_name varchar,
  ai_extracted_text text,
  ai_analyzed_at timestamp without time zone,
  updated_at timestamp without time zone
)
language sql
stable
security invoker
set search_path = public
as $$
  select
    d.id,
    d.subcontractor_id,
    d.document_type_id,
    d.file_name,
    d.ai_extracted_text,
    d.ai_analyzed_at,
    d.updated_at
  from public.subcontractor_documents d
  left join public.vehicle_document_scans s on s.document_id = d.id
  where s.document_id is null
     or s.source_signature <> encode(
       extensions.digest(
         coalesce(d.file_name, '') || '|' ||
         coalesce(d.ai_extracted_text, '') || '|' ||
         coalesce(d.ai_analyzed_at::text, '') || '|' ||
         coalesce(d.updated_at::text, ''),
         'sha256'
       ),
       'hex'
     )
  order by d.updated_at asc nulls first, d.id
  limit greatest(1, least(coalesce(p_limit, 20), 100));
$$;

revoke all on function public.get_pending_vehicle_documents(integer) from public;
revoke all on function public.get_pending_vehicle_documents(integer) from anon;
revoke all on function public.get_pending_vehicle_documents(integer) from authenticated;
grant execute on function public.get_pending_vehicle_documents(integer) to service_role;

comment on function public.get_pending_vehicle_documents(integer) is
  'Returns only subcontractor documents that have never been scanned for fleet evidence or whose canonical source signature changed.';
