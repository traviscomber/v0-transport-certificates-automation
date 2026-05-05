-- Document Status Audit Log Table
-- Tracks all document status changes with full audit trail

CREATE TABLE IF NOT EXISTS public.document_status_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID NOT NULL REFERENCES public.uploaded_documents(id) ON DELETE CASCADE,
  previous_status TEXT NOT NULL,
  new_status TEXT NOT NULL,
  changed_by UUID NOT NULL, -- user_id from auth
  reason TEXT, -- For rejections or other status changes
  changed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  details JSONB DEFAULT NULL, -- Extra metadata (document_type_id, conductor_id, etc.)
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_document_status_audit_document_id 
  ON public.document_status_audit_log(document_id);

CREATE INDEX IF NOT EXISTS idx_document_status_audit_changed_at 
  ON public.document_status_audit_log(changed_at DESC);

CREATE INDEX IF NOT EXISTS idx_document_status_audit_new_status 
  ON public.document_status_audit_log(new_status);

-- Enable RLS (Row Level Security)
ALTER TABLE public.document_status_audit_log ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to view audit logs for their company's documents
CREATE POLICY "Users can view audit logs for their company documents"
  ON public.document_status_audit_log
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.uploaded_documents ud
      JOIN public.conductores c ON ud.conductor_id = c.id
      JOIN public.companies com ON c.company_id = com.id
      JOIN public.company_admins ca ON com.id = ca.company_id
      WHERE ud.id = document_status_audit_log.document_id
      AND ca.user_id = auth.uid()
    )
  );

-- Service role can insert audit logs
CREATE POLICY "Service role can insert audit logs"
  ON public.document_status_audit_log
  FOR INSERT
  WITH CHECK (true); -- Service role bypasses RLS anyway

-- Document Status Consistency Check Views
-- View to find inconsistencies between documents and uploads

CREATE OR REPLACE VIEW public.document_status_inconsistencies AS
SELECT 
  ud.id,
  ud.conductor_id,
  ud.document_type_id,
  ud.validation_status,
  ud.rejection_reason,
  COUNT(dsal.id) as audit_log_count,
  MAX(dsal.changed_at) as last_status_change,
  MAX(dsal.new_status) as last_recorded_status,
  CASE 
    WHEN ud.validation_status IS NULL THEN 'STATUS_NULL'
    WHEN ud.validation_status NOT IN ('approved', 'rejected', 'pending', 'expired') THEN 'INVALID_STATUS'
    WHEN ud.validation_status = 'rejected' AND ud.rejection_reason IS NULL THEN 'REJECTED_NO_REASON'
    ELSE 'OK'
  END as status_check
FROM public.uploaded_documents ud
LEFT JOIN public.document_status_audit_log dsal ON ud.id = dsal.document_id
GROUP BY ud.id, ud.conductor_id, ud.document_type_id, ud.validation_status, ud.rejection_reason;

-- Add comment to document_status_audit_log table
COMMENT ON TABLE public.document_status_audit_log IS 
  'Audit trail for document status changes. Used for compliance tracking and debugging status inconsistencies.';
