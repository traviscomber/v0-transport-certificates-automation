-- Create documents table for storing driver documents
create table if not exists public.driver_documents (
  id uuid primary key default gen_random_uuid(),
  driver_id varchar not null,
  document_type varchar not null,
  file_name varchar not null,
  file_url text not null,
  status varchar default 'pendiente' check (status in ('pendiente', 'aprobado', 'rechazado')),
  uploaded_at timestamp default now(),
  uploaded_by varchar,
  notes text,
  created_at timestamp default now(),
  updated_at timestamp default now()
);

-- Create indexes for faster queries
create index if not exists idx_driver_documents_driver_id on public.driver_documents(driver_id);
create index if not exists idx_driver_documents_status on public.driver_documents(status);
create index if not exists idx_driver_documents_created_at on public.driver_documents(created_at);

-- Enable RLS
alter table public.driver_documents enable row level security;

-- Allow all authenticated users to view documents
create policy "Allow all authenticated users to view driver documents" on public.driver_documents
  for select
  to authenticated
  using (true);

-- Allow authenticated users to insert documents
create policy "Allow authenticated users to insert driver documents" on public.driver_documents
  for insert
  to authenticated
  with check (true);

-- Allow authenticated users to update document status
create policy "Allow authenticated users to update driver documents" on public.driver_documents
  for update
  to authenticated
  using (true)
  with check (true);
