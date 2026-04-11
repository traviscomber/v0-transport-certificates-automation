-- Create executive_staff table for storing executive login credentials
CREATE TABLE IF NOT EXISTS public.executive_staff (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  transportista_id UUID NOT NULL REFERENCES public.transportistas(id) ON DELETE CASCADE,
  full_name VARCHAR(255) NOT NULL,
  rut VARCHAR(20) UNIQUE NOT NULL,
  email_auth VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  email VARCHAR(255),
  cargo VARCHAR(100),
  login_enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT executive_staff_rut_unique UNIQUE (rut)
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_executive_staff_transportista_id ON public.executive_staff(transportista_id);
CREATE INDEX IF NOT EXISTS idx_executive_staff_email_auth ON public.executive_staff(email_auth);
CREATE INDEX IF NOT EXISTS idx_executive_staff_rut ON public.executive_staff(rut);

-- Enable RLS if needed
ALTER TABLE public.executive_staff ENABLE ROW LEVEL SECURITY;

-- Create a simple policy that allows public read (for login purposes)
DROP POLICY IF EXISTS "Allow public read for login" ON public.executive_staff;
CREATE POLICY "Allow public read for login" ON public.executive_staff
  FOR SELECT USING (true);
