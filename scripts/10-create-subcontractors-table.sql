-- Create subcontratos/subcontractors table
CREATE TABLE IF NOT EXISTS public.subcontractors (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  transportista_id UUID REFERENCES public.transportistas(id) ON DELETE CASCADE,
  
  -- Company info
  rut TEXT NOT NULL,
  razon_social TEXT NOT NULL,
  nombre_fantasia TEXT,
  
  -- Legal representative
  representante_legal TEXT,
  representante_rut TEXT,
  
  -- Contact info
  email TEXT,
  telefono TEXT,
  direccion TEXT,
  comuna TEXT,
  region TEXT,
  
  -- Assignment
  ejecutiva TEXT, -- Name of executive responsible
  
  -- Certifications
  has_ariztia BOOLEAN DEFAULT false,
  has_lts BOOLEAN DEFAULT false,
  has_rendic BOOLEAN DEFAULT false,
  has_interpolar BOOLEAN DEFAULT false,
  
  -- Status
  is_active BOOLEAN DEFAULT true,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_subcontractors_transportista_id ON public.subcontractors(transportista_id);
CREATE INDEX IF NOT EXISTS idx_subcontractors_rut ON public.subcontractors(rut);

-- Enable RLS
ALTER TABLE public.subcontractors ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Allow all authenticated users to view subcontractors
CREATE POLICY "Allow authenticated users to view subcontractors" 
  ON public.subcontractors FOR SELECT 
  USING (true);
