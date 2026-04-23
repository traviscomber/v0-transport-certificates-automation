-- Add new columns to documents table for linking to drivers and subcontractors
ALTER TABLE public.documents ADD COLUMN IF NOT EXISTS driver_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE;
ALTER TABLE public.documents ADD COLUMN IF NOT EXISTS subcontractor_id UUID REFERENCES public.transporters(id) ON DELETE CASCADE;
ALTER TABLE public.documents ADD COLUMN IF NOT EXISTS document_category TEXT;
ALTER TABLE public.documents ADD COLUMN IF NOT EXISTS uploaded_by_user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL;
ALTER TABLE public.documents ADD COLUMN IF NOT EXISTS verification_status TEXT DEFAULT 'pending' CHECK (verification_status IN ('pending', 'approved', 'rejected'));
ALTER TABLE public.documents ADD COLUMN IF NOT EXISTS expiry_date DATE;
ALTER TABLE public.documents ADD COLUMN IF NOT EXISTS storage_path TEXT;

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS documents_driver_id_idx ON public.documents(driver_id);
CREATE INDEX IF NOT EXISTS documents_subcontractor_id_idx ON public.documents(subcontractor_id);
CREATE INDEX IF NOT EXISTS documents_category_idx ON public.documents(document_category);
CREATE INDEX IF NOT EXISTS documents_verification_status_idx ON public.documents(verification_status);

-- Create document_categories table
CREATE TABLE IF NOT EXISTS public.document_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  for_drivers BOOLEAN DEFAULT true,
  for_subcontractors BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default document categories
INSERT INTO public.document_categories (name, description, for_drivers, for_subcontractors) VALUES
  ('License', 'Driver license or certification', true, false),
  ('Insurance', 'Insurance documentation', true, true),
  ('Certification', 'Professional certification', true, true),
  ('Contract', 'Service or employment contract', false, true),
  ('Inspection Report', 'Vehicle or equipment inspection', true, true),
  ('Medical Certificate', 'Health or medical certification', true, false),
  ('Training Certificate', 'Training or course completion', true, true),
  ('Other', 'Other documents', true, true)
ON CONFLICT (name) DO NOTHING;

-- Enable RLS on document_categories
ALTER TABLE public.document_categories ENABLE ROW LEVEL SECURITY;

-- Create policy for document_categories
CREATE POLICY "Allow all read on document_categories" ON public.document_categories
  FOR SELECT USING (true);
