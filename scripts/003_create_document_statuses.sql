-- Create document_statuses table to track document approval/rejection states
CREATE TABLE IF NOT EXISTS public.document_statuses (
  id BIGSERIAL PRIMARY KEY,
  document_id UUID NOT NULL UNIQUE,
  status VARCHAR(50) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'expired')),
  reason TEXT,
  changed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  changed_by VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_document_statuses_document_id ON public.document_statuses(document_id);
CREATE INDEX IF NOT EXISTS idx_document_statuses_status ON public.document_statuses(status);

-- Add comment to table
COMMENT ON TABLE public.document_statuses IS 'Tracks approval/rejection status of uploaded documents';

-- Enable RLS if needed (commented out - adjust per security needs)
-- ALTER TABLE public.document_statuses ENABLE ROW LEVEL SECURITY;
