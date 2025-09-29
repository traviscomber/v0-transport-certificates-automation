-- Create documents table for storing uploaded documents
CREATE TABLE IF NOT EXISTS public.documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  file_name TEXT NOT NULL,
  file_size TEXT NOT NULL,
  file_type TEXT NOT NULL,
  document_type TEXT NOT NULL,
  upload_date DATE NOT NULL DEFAULT CURRENT_DATE,
  ocr_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create transporters table for storing transporter information
CREATE TABLE IF NOT EXISTS public.transporters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID REFERENCES public.documents(id) ON DELETE CASCADE,
  rut TEXT,
  name TEXT,
  license_number TEXT,
  license_class TEXT,
  issue_date DATE,
  expiry_date DATE,
  restrictions TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create machines table for storing machine/vehicle information  
CREATE TABLE IF NOT EXISTS public.machines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID REFERENCES public.documents(id) ON DELETE CASCADE,
  patent TEXT,
  transporter_name TEXT,
  transporter_rut TEXT,
  document_number TEXT,
  issue_date DATE,
  expiry_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security (RLS) - for now allow all operations
-- In a production app, you would add proper user-based policies
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transporters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.machines ENABLE ROW LEVEL SECURITY;

-- Create policies to allow all operations for now
-- In production, these should be restricted to authenticated users
CREATE POLICY "Allow all operations on documents" ON public.documents
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all operations on transporters" ON public.transporters
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all operations on machines" ON public.machines
  FOR ALL USING (true) WITH CHECK (true);
