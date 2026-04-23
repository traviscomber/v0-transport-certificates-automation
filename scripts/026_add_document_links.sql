-- Add new columns to documents table for linking to drivers and subcontractors
ALTER TABLE IF EXISTS public.documents ADD COLUMN IF NOT EXISTS driver_id UUID;
ALTER TABLE IF EXISTS public.documents ADD COLUMN IF NOT EXISTS subcontractor_id UUID;
ALTER TABLE IF EXISTS public.documents ADD COLUMN IF NOT EXISTS document_category TEXT;
ALTER TABLE IF EXISTS public.documents ADD COLUMN IF NOT EXISTS uploaded_by_user_id UUID;
ALTER TABLE IF EXISTS public.documents ADD COLUMN IF NOT EXISTS verification_status TEXT DEFAULT 'pending' CHECK (verification_status IN ('pending', 'approved', 'rejected'));
ALTER TABLE IF EXISTS public.documents ADD COLUMN IF NOT EXISTS expiry_date DATE;
ALTER TABLE IF EXISTS public.documents ADD COLUMN IF NOT EXISTS storage_path TEXT;

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS documents_driver_id_idx ON public.documents(driver_id);
CREATE INDEX IF NOT EXISTS documents_subcontractor_id_idx ON public.documents(subcontractor_id);
CREATE INDEX IF NOT EXISTS documents_category_idx ON public.documents(document_category);
CREATE INDEX IF NOT EXISTS documents_verification_status_idx ON public.documents(verification_status);
