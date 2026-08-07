create or replace view public.ocr_operational_summary as
select
  count(*) filter (where dte.status = 'processing')::bigint as processing,
  count(*) filter (where dte.status = 'ocr_required')::bigint as ocr_required,
  count(*) filter (where dte.status = 'queued_retry')::bigint as queued_retry,
  count(*) filter (where dte.status = 'requires_new_photo')::bigint as requires_new_photo,
  count(*) filter (where dte.status = 'failed')::bigint as failed,
  count(*) filter (where dte.status = 'text_extracted')::bigint as text_extracted,
  (
    select count(*)::bigint
    from public.subcontractor_documents sd
    left join public.document_text_extractions x on x.document_id = sd.id
    where coalesce(sd.is_current, true) = true
      and lower(coalesce(sd.file_name, '')) like '%.pdf'
      and coalesce(x.status, 'pending') <> 'text_extracted'
  ) as pending_current_pdfs,
  (
    select count(*)::bigint
    from public.ocr_processing_batches opb
    where opb.source in ('document_pdf_ocr_targeted', 'document_pdf_ocr_backfill')
      and opb.status = 'completed'
  ) as completed_pdf_batches
from public.document_text_extractions dte;

create or replace view public.ocr_review_queue as
select
  sd.id as document_id,
  sd.file_name,
  sd.file_url,
  sd.ai_extracted_text,
  sd.ai_confidence,
  dte.status as extraction_status,
  dte.attempts,
  dte.error_message,
  dte.updated_at,
  vds.status as canonical_status,
  vds.candidate_count,
  vds.matched_count,
  case
    when dte.status in ('failed', 'requires_new_photo') then 'high'
    when dte.status in ('ocr_required', 'queued_retry') then 'medium'
    when vds.status in ('owner_conflict', 'no_candidate', 'unmatched_prt') then 'medium'
    else 'low'
  end as review_priority
from public.subcontractor_documents sd
join public.document_text_extractions dte on dte.document_id = sd.id
left join public.vehicle_document_scans vds on vds.document_id = sd.id
where coalesce(sd.is_current, true) = true
  and (
    dte.status in ('ocr_required', 'queued_retry', 'requires_new_photo', 'failed')
    or vds.status in ('owner_conflict', 'no_candidate', 'unmatched_prt', 'failed')
  );

grant select on public.ocr_operational_summary to service_role;
grant select on public.ocr_review_queue to service_role;
