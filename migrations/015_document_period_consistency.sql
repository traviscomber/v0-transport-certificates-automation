-- Document period consistency migration
-- This migration ensures data consistency for document period tracking

-- Populate approved_at from approval_date if not set
UPDATE public.documents
SET approved_at = approval_date
WHERE approved_at IS NULL AND approval_date IS NOT NULL;

-- Calculate and set expires_at based on validity_end_date
UPDATE public.documents
SET expires_at = validity_end_date::timestamp WITH TIME ZONE
WHERE expires_at IS NULL AND validity_end_date IS NOT NULL;

-- Set status to 'approved' for documents with approval_date
UPDATE public.documents
SET status = 'approved'
WHERE status = 'pending' AND approval_date IS NOT NULL;

-- Set status to 'expired' for documents where expires_at has passed
UPDATE public.documents
SET status = 'expired'
WHERE status = 'approved' AND expires_at IS NOT NULL AND expires_at < NOW();

-- Set is_active to false for expired documents
UPDATE public.documents
SET is_active = false
WHERE status = 'expired' OR (expires_at IS NOT NULL AND expires_at < NOW());

-- Create trigger to automatically set approved_at when status changes to approved
CREATE OR REPLACE FUNCTION public.set_approved_at()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'approved' AND OLD.status != 'approved' THEN
    NEW.approved_at := NOW();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop trigger if exists (to avoid errors on re-run)
DROP TRIGGER IF EXISTS documents_set_approved_at_trigger ON public.documents;

-- Create trigger for approved_at
CREATE TRIGGER documents_set_approved_at_trigger
BEFORE UPDATE ON public.documents
FOR EACH ROW
EXECUTE FUNCTION public.set_approved_at();

-- Create trigger to automatically set expires_at based on validity_end_date
CREATE OR REPLACE FUNCTION public.set_expires_at()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.validity_end_date IS NOT NULL THEN
    NEW.expires_at := NEW.validity_end_date::timestamp WITH TIME ZONE;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop trigger if exists
DROP TRIGGER IF EXISTS documents_set_expires_at_trigger ON public.documents;

-- Create trigger for expires_at
CREATE TRIGGER documents_set_expires_at_trigger
BEFORE INSERT OR UPDATE ON public.documents
FOR EACH ROW
EXECUTE FUNCTION public.set_expires_at();

-- Add RLS policies if not exists (for documents table access control)
-- Allow authenticated users to view their own approved documents
CREATE POLICY IF NOT EXISTS "Users can view approved documents"
  ON public.documents
  FOR SELECT
  USING (
    status = 'approved' 
    OR (auth.uid() = approved_by)
    OR EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'prevencionista')
    )
  );

-- Allow prevencionistas to approve/reject documents
CREATE POLICY IF NOT EXISTS "Prevencionistas can manage documents"
  ON public.documents
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() AND profiles.role = 'prevencionista'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() AND profiles.role = 'prevencionista'
    )
  );
