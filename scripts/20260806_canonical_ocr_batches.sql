begin;

create table if not exists public.ocr_processing_batches (
  id uuid primary key default gen_random_uuid(),
  source text not null default 'document_ocr_cron',
  status text not null default 'processing' check (status in ('processing', 'completed', 'partial', 'failed')),
  total_documents integer not null default 0,
  processed_documents integer not null default 0,
  successful_documents integer not null default 0,
  failed_documents integer not null default 0,
  started_at timestamptz not null default now(),
  completed_at timestamptz,
  error_message text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.ocr_batch_documents (
  id uuid primary key default gen_random_uuid(),
  batch_id uuid not null references public.ocr_processing_batches(id) on delete cascade,
  document_id uuid not null references public.subcontractor_documents(id) on delete cascade,
  status text not null default 'processing' check (status in ('processing', 'extracted', 'canonicalized', 'failed')),
  semaphore text not null default 'processing' check (semaphore in ('processing', 'green', 'yellow', 'red')),
  extraction_status text,
  canonical_status text,
  error_message text,
  started_at timestamptz not null default now(),
  completed_at timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (batch_id, document_id)
);

create index if not exists ocr_processing_batches_status_idx
  on public.ocr_processing_batches(status, started_at desc);

create index if not exists ocr_batch_documents_document_idx
  on public.ocr_batch_documents(document_id, created_at desc);

create index if not exists ocr_batch_documents_semaphore_idx
  on public.ocr_batch_documents(semaphore, status, created_at desc);

alter table public.ocr_processing_batches enable row level security;
alter table public.ocr_batch_documents enable row level security;

comment on table public.ocr_processing_batches is
  'Canonical execution batches for production OCR processing.';
comment on table public.ocr_batch_documents is
  'Per-document OCR batch state and canonical semaphore derived only from persisted extraction and validation evidence.';

commit;
