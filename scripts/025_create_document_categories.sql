CREATE TABLE IF NOT EXISTS public.document_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  for_drivers BOOLEAN DEFAULT true,
  for_subcontractors BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

INSERT INTO public.document_categories (name, description, for_drivers, for_subcontractors) 
SELECT 'License', 'Driver license or certification', true, false
WHERE NOT EXISTS (SELECT 1 FROM public.document_categories WHERE name = 'License');

INSERT INTO public.document_categories (name, description, for_drivers, for_subcontractors) 
SELECT 'Insurance', 'Insurance documentation', true, true
WHERE NOT EXISTS (SELECT 1 FROM public.document_categories WHERE name = 'Insurance');

INSERT INTO public.document_categories (name, description, for_drivers, for_subcontractors) 
SELECT 'Certification', 'Professional certification', true, true
WHERE NOT EXISTS (SELECT 1 FROM public.document_categories WHERE name = 'Certification');

INSERT INTO public.document_categories (name, description, for_drivers, for_subcontractors) 
SELECT 'Contract', 'Service or employment contract', false, true
WHERE NOT EXISTS (SELECT 1 FROM public.document_categories WHERE name = 'Contract');

INSERT INTO public.document_categories (name, description, for_drivers, for_subcontractors) 
SELECT 'Inspection Report', 'Vehicle inspection', true, true
WHERE NOT EXISTS (SELECT 1 FROM public.document_categories WHERE name = 'Inspection Report');

INSERT INTO public.document_categories (name, description, for_drivers, for_subcontractors) 
SELECT 'Medical Certificate', 'Health certification', true, false
WHERE NOT EXISTS (SELECT 1 FROM public.document_categories WHERE name = 'Medical Certificate');

INSERT INTO public.document_categories (name, description, for_drivers, for_subcontractors) 
SELECT 'Training Certificate', 'Training completion', true, true
WHERE NOT EXISTS (SELECT 1 FROM public.document_categories WHERE name = 'Training Certificate');

INSERT INTO public.document_categories (name, description, for_drivers, for_subcontractors) 
SELECT 'Other', 'Other documents', true, true
WHERE NOT EXISTS (SELECT 1 FROM public.document_categories WHERE name = 'Other');

ALTER TABLE IF EXISTS public.document_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY IF NOT EXISTS "Allow all read on document_categories" ON public.document_categories
  FOR SELECT USING (true);
