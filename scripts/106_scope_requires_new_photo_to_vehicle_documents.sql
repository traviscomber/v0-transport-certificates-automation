-- Keep advanced vehicle verification optional.
-- Only vehicle-related OCR failures may request a new photo after repeated attempts.
-- Non-vehicle documents remain OCR-reviewable and must not be treated as invalid solely because OCR failed.

create or replace function public.normalize_ocr_retry_status()
returns trigger
language plpgsql
as $$
declare
  v_file_name text;
  v_document_type text;
  v_vehicle_related boolean := false;
begin
  select sd.file_name, dt.code
    into v_file_name, v_document_type
  from public.subcontractor_documents sd
  left join public.document_types dt on dt.id = sd.document_type_id
  where sd.id = new.document_id;

  v_vehicle_related := concat_ws(' ', coalesce(v_file_name, ''), coalesce(v_document_type, ''))
    ~* '(patente|placa|matr[ií]cula|cam[ií]on|veh[ií]culo|padr[oó]n|revisi[oó]n[[:space:]]*t[eé]cnica)';

  if new.status = 'ocr_required' then
    if v_vehicle_related and coalesce(new.attempts, 0) >= 2 then
      new.status := 'requires_new_photo';
    elsif coalesce(new.attempts, 0) < 2 then
      new.status := 'queued_retry';
    end if;
  end if;

  return new;
end;
$$;

-- Repair historical rows that were incorrectly promoted to requires_new_photo.
update public.document_text_extractions dte
set status = 'ocr_required',
    updated_at = now()
from public.subcontractor_documents sd
left join public.document_types dt on dt.id = sd.document_type_id
where dte.document_id = sd.id
  and dte.status = 'requires_new_photo'
  and not (
    concat_ws(' ', coalesce(sd.file_name, ''), coalesce(dt.code, ''))
      ~* '(patente|placa|matr[ií]cula|cam[ií]on|veh[ií]culo|padr[oó]n|revisi[oó]n[[:space:]]*t[eé]cnica)'
  );
