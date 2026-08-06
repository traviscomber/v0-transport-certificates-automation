create or replace view public.document_ocr_priority_current as
select
  dte.document_id,
  sd.subcontractor_id as company_ref,
  sd.subcontractor_rut,
  sd.file_name,
  sd.document_period_start as period_start,
  dte.status,
  dte.attempts,
  dte.error_message,
  case
    when lower(translate(coalesce(sd.file_name,''), 'ÁÉÍÓÚÜÑáéíóúüñ','AEIOUUNaeiouun'))
         similar to '%(revision tecnica|certificado de revision|permiso de circulacion|padron|vehiculo|camion|tractocamion|patente|ppu)%'
      then 'vehicle'
    when lower(coalesce(sd.file_name,'')) similar to '%(previred|imposicion|cotizacion)%' then 'previred'
    when lower(coalesce(sd.file_name,'')) similar to '%(liquidacion|sueldo)%' then 'liquidation'
    when lower(coalesce(sd.file_name,'')) similar to '%(contrato|anexo)%' then 'contract'
    when lower(coalesce(sd.file_name,'')) similar to '%(f30|f30-1)%' then 'f30'
    else 'other'
  end as inferred_document_type,
  case
    when lower(translate(coalesce(sd.file_name,''), 'ÁÉÍÓÚÜÑáéíóúüñ','AEIOUUNaeiouun'))
         similar to '%(revision tecnica|certificado de revision|permiso de circulacion|padron|vehiculo|camion|tractocamion|patente|ppu)%'
      then 110
    when lower(coalesce(sd.file_name,'')) similar to '%(previred|imposicion|cotizacion)%' then 100
    when lower(coalesce(sd.file_name,'')) similar to '%(liquidacion|sueldo)%' then 90
    when lower(coalesce(sd.file_name,'')) similar to '%(contrato|anexo)%' then 80
    when lower(coalesce(sd.file_name,'')) similar to '%(f30|f30-1)%' then 70
    else 20
  end as impact_priority,
  case
    when dte.status = 'failed' then 'manual_intervention'
    when dte.status = 'ocr_required' then 'ready_for_ocr'
    else 'not_eligible'
  end as processing_action,
  sd.created_at
from public.document_text_extractions dte
join public.subcontractor_documents sd on sd.id = dte.document_id
where sd.is_current = true
  and dte.status in ('ocr_required','failed');

comment on view public.document_ocr_priority_current is
  'Canonical OCR priority. Current vehicle documents are processed before labor documents during fleet recovery.';
