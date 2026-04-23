-- Create document_categories table first (simpler, no dependencies)
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
ALTER TABLE IF EXISTS public.document_categories ENABLE ROW LEVEL SECURITY;

-- Create policy for document_categories
CREATE POLICY IF NOT EXISTS "Allow all read on document_categories" ON public.document_categories
  FOR SELECT USING (true);
