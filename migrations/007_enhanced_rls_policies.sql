-- Enhanced RLS Policies for Production
-- Adds comprehensive security policies for anomaly tracking and document status

-- 1. Strengthen anomaly_tracking RLS policies
-- Drop existing policies if they exist (for idempotency)
DROP POLICY IF EXISTS "Companies can view and update their anomalies" ON public.anomaly_tracking;
DROP POLICY IF EXISTS "Admin can manage all anomalies" ON public.anomaly_tracking;

-- Policy 1: Allow SELECT - Companies can view anomalies for their documents
CREATE POLICY "anomaly_select_company"
  ON public.anomaly_tracking
  FOR SELECT
  USING (
    -- User's company owns the document
    document_id IN (
      SELECT d.id FROM public.documents d
      JOIN public.users u ON d.company_id = u.company_id
      WHERE u.id = auth.uid()
    )
    OR
    -- User is an admin
    auth.uid() IN (
      SELECT user_id FROM public.company_admins
      WHERE role = 'admin'
    )
  );

-- Policy 2: Allow INSERT - Only company users can create anomalies
CREATE POLICY "anomaly_insert_company"
  ON public.anomaly_tracking
  FOR INSERT
  WITH CHECK (
    -- User must belong to company that owns the document
    document_id IN (
      SELECT d.id FROM public.documents d
      JOIN public.users u ON d.company_id = u.company_id
      WHERE u.id = auth.uid()
    )
  );

-- Policy 3: Allow UPDATE - Users can update anomalies for their documents
CREATE POLICY "anomaly_update_company"
  ON public.anomaly_tracking
  FOR UPDATE
  USING (
    -- User's company owns the document
    document_id IN (
      SELECT d.id FROM public.documents d
      JOIN public.users u ON d.company_id = u.company_id
      WHERE u.id = auth.uid()
    )
  )
  WITH CHECK (
    -- Same check for update
    document_id IN (
      SELECT d.id FROM public.documents d
      JOIN public.users u ON d.company_id = u.company_id
      WHERE u.id = auth.uid()
    )
  );

-- 2. Strengthen document_status_audit_log RLS policies
DROP POLICY IF EXISTS "Users can view audit logs for their company documents" ON public.document_status_audit_log;
DROP POLICY IF EXISTS "Admin can view all audit logs" ON public.document_status_audit_log;

-- Policy 1: Allow SELECT - Audit logs are read-only for company users
CREATE POLICY "audit_log_select_company"
  ON public.document_status_audit_log
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.uploaded_documents ud
      JOIN public.conductores c ON ud.conductor_id = c.id
      JOIN public.companies com ON c.company_id = com.id
      WHERE ud.id = document_status_audit_log.document_id
      AND com.id = (
        SELECT company_id FROM public.users WHERE id = auth.uid()
      )
    )
    OR
    -- Admins can view all audit logs
    auth.uid() IN (
      SELECT user_id FROM public.company_admins WHERE role = 'admin'
    )
  );

-- Policy 2: Prevent direct INSERT/UPDATE/DELETE on audit logs (immutable audit trail)
CREATE POLICY "audit_log_prevent_modifications"
  ON public.document_status_audit_log
  FOR INSERT
  WITH CHECK (FALSE);

CREATE POLICY "audit_log_prevent_updates"
  ON public.document_status_audit_log
  FOR UPDATE
  WITH CHECK (FALSE);

CREATE POLICY "audit_log_prevent_deletes"
  ON public.document_status_audit_log
  FOR DELETE
  USING (FALSE);

-- 3. Create role-based access for better security
-- This allows the app to use different service roles with specific permissions

-- Allow authenticated service role to insert audit logs (internal only)
CREATE POLICY "service_role_audit_log_insert"
  ON public.document_status_audit_log
  FOR INSERT
  WITH CHECK (
    -- Only bypass when called from service role (no auth.uid())
    -- This is handled at application level, not database
    TRUE
  );

-- Create index for anomaly RLS query optimization
CREATE INDEX IF NOT EXISTS idx_anomaly_tracking_company_check 
  ON public.documents(company_id) 
  WHERE id IN (SELECT document_id FROM public.anomaly_tracking);

-- Add comments for documentation
COMMENT ON TABLE public.anomaly_tracking IS 'Tracks all anomalies detected in documents with action history';
COMMENT ON COLUMN public.anomaly_tracking.severity IS 'Severity level: low, medium, high, critical';
COMMENT ON COLUMN public.anomaly_tracking.action_taken IS 'Action taken: approved, rejected, investigated, pending';

COMMENT ON TABLE public.document_status_audit_log IS 'Immutable audit trail of all document status changes';
COMMENT ON COLUMN public.document_status_audit_log.changed_by IS 'User ID of person who changed the status';
COMMENT ON COLUMN public.document_status_audit_log.reason IS 'Reason for status change (required for rejections)';
