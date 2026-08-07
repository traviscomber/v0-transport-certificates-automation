create table if not exists public.ocr_manual_reviews (
  id uuid primary key default gen_random_uuid(),
  document_id uuid not null references public.subcontractor_documents(id) on delete cascade,
  action text not null check (action in ('approve','correct','retry','reject')),
  original_status text,
  original_text text,
  corrected_text text,
  notes text,
  reviewed_by uuid,
  created_at timestamptz not null default now()
);

create index if not exists idx_ocr_manual_reviews_document_created
  on public.ocr_manual_reviews(document_id, created_at desc);

alter table public.ocr_manual_reviews enable row level security;
revoke all on public.ocr_manual_reviews from anon, authenticated;
grant all on public.ocr_manual_reviews to service_role;
