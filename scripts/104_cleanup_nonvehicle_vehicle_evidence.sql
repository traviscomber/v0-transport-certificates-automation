-- Non-vehicle documents may have optional advanced validation, but their
-- absence of vehicle evidence must never invalidate the client or leave a
-- false vehicle badge behind.

create or replace function public.cleanup_nonvehicle_vehicle_evidence()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if coalesce(new.is_current, true) = true
     and not (
       coalesce(new.file_name, '') ~* '(patente|placa|matrícula|matricula|camión|camion|vehículo|vehiculo|padrón|padron|revisión técnica|revision tecnica)'
       or coalesce(new.ai_document_type, '') ~* '(PATENTE|PLACA|VEHICULO|VEHÍCULO|PADRON|PADRÓN|REVISION_TECNICA)'
     ) then
    delete from public.vehicle_document_facts
    where document_id = new.id;

    delete from public.vehicle_document_scans
    where document_id = new.id;
  end if;

  return new;
end;
$$;

drop trigger if exists trg_cleanup_nonvehicle_vehicle_evidence
on public.subcontractor_documents;

create trigger trg_cleanup_nonvehicle_vehicle_evidence
after insert or update of file_name, ai_document_type, ai_extracted_text, ai_analyzed_at, is_current
on public.subcontractor_documents
for each row
execute function public.cleanup_nonvehicle_vehicle_evidence();

-- One-time cleanup for canonical current documents that are clearly not
-- vehicle-related. This never deletes evidence from vehicle documents.
delete from public.vehicle_document_facts f
using public.subcontractor_documents d
where f.document_id = d.id
  and coalesce(d.is_current, true) = true
  and not (
    coalesce(d.file_name, '') ~* '(patente|placa|matrícula|matricula|camión|camion|vehículo|vehiculo|padrón|padron|revisión técnica|revision tecnica)'
    or coalesce(d.ai_document_type, '') ~* '(PATENTE|PLACA|VEHICULO|VEHÍCULO|PADRON|PADRÓN|REVISION_TECNICA)'
  );

delete from public.vehicle_document_scans s
using public.subcontractor_documents d
where s.document_id = d.id
  and coalesce(d.is_current, true) = true
  and not (
    coalesce(d.file_name, '') ~* '(patente|placa|matrícula|matricula|camión|camion|vehículo|vehiculo|padrón|padron|revisión técnica|revision tecnica)'
    or coalesce(d.ai_document_type, '') ~* '(PATENTE|PLACA|VEHICULO|VEHÍCULO|PADRON|PADRÓN|REVISION_TECNICA)'
  );
