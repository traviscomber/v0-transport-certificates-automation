begin;

create table if not exists public.vehicle_document_scans (
  document_id uuid primary key references public.subcontractor_documents(id) on delete cascade,
  transportista_id uuid not null references public.transportistas(id) on delete cascade,
  source_signature text not null,
  status text not null check (status in ('matched', 'no_candidate', 'queued_ocr', 'unmatched_prt', 'owner_conflict', 'failed')),
  candidate_count integer not null default 0,
  matched_count integer not null default 0,
  error_message text,
  scanned_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.vehicle_document_facts (
  id uuid primary key default gen_random_uuid(),
  document_id uuid not null references public.subcontractor_documents(id) on delete cascade,
  transportista_id uuid not null references public.transportistas(id) on delete cascade,
  vehicle_id uuid references public.vehiculos(id) on delete set null,
  plate_normalized text not null,
  extraction_source text not null check (extraction_source in ('file_name', 'ocr_text')),
  confidence numeric(5,4) not null check (confidence >= 0 and confidence <= 1),
  prt_matched boolean not null default false,
  prt_record_id bigint references public.prt_vehicle_records(id) on delete set null,
  prt_snapshot jsonb not null default '{}'::jsonb,
  context jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (document_id, plate_normalized)
);

create index if not exists vehicle_document_scans_status_idx
  on public.vehicle_document_scans(status, scanned_at desc);

create index if not exists vehicle_document_facts_plate_idx
  on public.vehicle_document_facts(plate_normalized);

create index if not exists vehicle_document_facts_transportista_idx
  on public.vehicle_document_facts(transportista_id, created_at desc);

alter table public.vehicle_document_scans enable row level security;
alter table public.vehicle_document_facts enable row level security;

comment on table public.vehicle_document_scans is
  'Canonical scan state for recovering fleet records from existing subcontractor documents and OCR output.';
comment on table public.vehicle_document_facts is
  'Auditable plate evidence extracted from documents and validated against canonical PRT records.';

commit;
