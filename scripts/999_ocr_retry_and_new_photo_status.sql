begin;

alter table public.document_text_extractions
  drop constraint if exists document_text_extractions_status_check;

alter table public.document_text_extractions
  add constraint document_text_extractions_status_check
  check (status = any (array[
    'pending'::text,
    'processing'::text,
    'text_extracted'::text,
    'ocr_required'::text,
    'queued_retry'::text,
    'requires_new_photo'::text,
    'failed'::text
  ]));

alter table public.ocr_batch_documents
  drop constraint if exists ocr_batch_documents_status_check;

alter table public.ocr_batch_documents
  add constraint ocr_batch_documents_status_check
  check (status = any (array[
    'processing'::text,
    'extracted'::text,
    'canonicalized'::text,
    'queued_retry'::text,
    'requires_new_photo'::text,
    'failed'::text
  ]));

create or replace function public.normalize_ocr_retry_status()
returns trigger
language plpgsql
as $$
begin
  if new.status = 'ocr_required' and coalesce(new.attempts, 0) >= 2 then
    new.status := 'requires_new_photo';
  elsif new.status = 'ocr_required' and coalesce(new.attempts, 0) < 2 then
    new.status := 'queued_retry';
  end if;
  return new;
end;
$$;

drop trigger if exists trg_normalize_ocr_retry_status on public.document_text_extractions;
create trigger trg_normalize_ocr_retry_status
before insert or update of status, attempts
on public.document_text_extractions
for each row
execute function public.normalize_ocr_retry_status();

commit;
