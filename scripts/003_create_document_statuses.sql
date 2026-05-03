-- Create document_statuses table to track document approval/rejection states
CREATE TABLE IF NOT EXISTS public.document_statuses (
  id BIGSERIAL PRIMARY KEY,
  document_id TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  reason TEXT,
  changed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  changed_by TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  UNIQUE(document_id)
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_document_statuses_document_id ON public.document_statuses(document_id);
CREATE INDEX IF NOT EXISTS idx_document_statuses_status ON public.document_statuses(status);
