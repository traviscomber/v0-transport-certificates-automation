-- Atomic PDF OCR queue claims and stale-processing recovery.
-- A repeated plate is valid evidence across different document_id values;
-- this queue only protects the exact same document_id from concurrent work.

create or replace function public.recover_stale_pdf_ocr_processing(
  p_stale_minutes integer default 20
)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  v_cutoff timestamptz := now() - make_interval(mins => greatest(coalesce(p_stale_minutes, 20), 5));
  v_recovered integer := 0;
begin
  update public.ocr_batch_documents obd
  set status = 'queued_retry',
      semaphore = 'yellow',
      extraction_status = 'queued_retry',
      canonical_status = 'not_run',
      error_message = coalesce(obd.error_message, 'Recovered stale PDF OCR processing state'),
      completed_at = coalesce(obd.completed_at, now()),
      updated_at = now()
  from public.ocr_processing_batches opb,
       public.subcontractor_documents sd
  where obd.batch_id = opb.id
    and obd.document_id = sd.id
    and obd.status = 'processing'
    and obd.updated_at < v_cutoff
    and opb.source in ('document_pdf_ocr_targeted', 'document_pdf_ocr_backfill')
    and lower(coalesce(sd.file_name, '')) like '%.pdf';

  update public.ocr_processing_batches opb
  set status = 'failed',
      processed_documents = greatest(coalesce(opb.processed_documents, 0), 1),
      failed_documents = greatest(coalesce(opb.failed_documents, 0), 1),
      error_message = coalesce(opb.error_message, 'Recovered stale PDF OCR processing state'),
      completed_at = coalesce(opb.completed_at, now()),
      updated_at = now()
  where opb.status = 'processing'
    and opb.updated_at < v_cutoff
    and opb.source in ('document_pdf_ocr_targeted', 'document_pdf_ocr_backfill');

  update public.document_text_extractions dte
  set status = 'queued_retry',
      error_message = coalesce(dte.error_message, 'Recovered stale PDF OCR processing state'),
      processed_at = null,
      updated_at = now()
  from public.subcontractor_documents sd
  where dte.document_id = sd.id
    and dte.status = 'processing'
    and dte.updated_at < v_cutoff
    and coalesce(sd.is_current, true) = true
    and lower(coalesce(sd.file_name, '')) like '%.pdf';

  get diagnostics v_recovered = row_count;
  return v_recovered;
end;
$$;

create or replace function public.claim_pdf_ocr_documents(
  p_limit integer default 1
)
returns table(document_id uuid, attempts integer)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_limit integer := least(greatest(coalesce(p_limit, 1), 1), 3);
begin
  return query
  with candidates as (
    select sd.id
    from public.subcontractor_documents sd
    left join public.document_text_extractions dte
      on dte.document_id = sd.id
    where coalesce(sd.is_current, true) = true
      and lower(coalesce(sd.file_name, '')) like '%.pdf'
      and coalesce(dte.status, 'pending') in ('pending', 'ocr_required', 'queued_retry')
      and coalesce(dte.attempts, 0) < 5
      and not exists (
        select 1
        from public.ocr_batch_documents obd
        join public.ocr_processing_batches opb on opb.id = obd.batch_id
        where obd.document_id = sd.id
          and (obd.status = 'processing' or opb.status = 'processing')
      )
    order by coalesce(dte.updated_at, sd.created_at), sd.created_at, sd.id
    for update of sd skip locked
    limit v_limit
  ), claimed as (
    insert into public.document_text_extractions as current_row (
      document_id,
      status,
      attempts,
      text_length,
      error_message,
      processed_at,
      updated_at
    )
    select
      candidates.id,
      'processing',
      0,
      0,
      null,
      null,
      now()
    from candidates
    on conflict (document_id) do update
    set status = 'processing',
        text_length = 0,
        error_message = null,
        processed_at = null,
        updated_at = now()
    returning current_row.document_id, current_row.attempts
  )
  select claimed.document_id, claimed.attempts
  from claimed;
end;
$$;

revoke all on function public.recover_stale_pdf_ocr_processing(integer) from public;
revoke all on function public.claim_pdf_ocr_documents(integer) from public;
grant execute on function public.recover_stale_pdf_ocr_processing(integer) to service_role;
grant execute on function public.claim_pdf_ocr_documents(integer) to service_role;
