-- ============================================================
-- CREATE EXECUTIVE STAFF TABLE
-- Stores executives and HR personnel for transport companies
-- ============================================================

-- Create executive staff table
CREATE TABLE IF NOT EXISTS public.executive_staff (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transportista_id UUID REFERENCES public.transportistas(id) ON DELETE CASCADE,
  nombre_completo TEXT NOT NULL,
  rut TEXT NOT NULL UNIQUE,
  cargo TEXT NOT NULL,
  telefono TEXT,
  email TEXT,
  direccion TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_executive_staff_transportista ON public.executive_staff(transportista_id);
CREATE INDEX IF NOT EXISTS idx_executive_staff_rut ON public.executive_staff(rut);

-- Add RLS policies for executive_staff table
ALTER TABLE public.executive_staff ENABLE ROW LEVEL SECURITY;

-- Allow read access to authenticated users
CREATE POLICY "Allow authenticated users to view executive staff"
  ON public.executive_staff
  FOR SELECT
  TO authenticated
  USING (true);

-- Allow company admins to manage their own executive staff
CREATE POLICY "Allow company admins to manage executive staff"
  ON public.executive_staff
  FOR ALL
  TO authenticated
  USING (
    transportista_id IN (
      SELECT id FROM public.transportistas 
      WHERE id = transportista_id
    )
  );

-- Grant permissions
GRANT SELECT ON public.executive_staff TO authenticated;
GRANT INSERT, UPDATE, DELETE ON public.executive_staff TO authenticated;
