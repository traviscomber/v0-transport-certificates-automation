-- Create certificates table
CREATE TABLE IF NOT EXISTS public.certificates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  driver_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  certificate_type TEXT NOT NULL CHECK (certificate_type IN ('f30', 'license', 'medical', 'vehicle_registration', 'insurance')),
  certificate_number TEXT,
  issue_date DATE,
  expiry_date DATE,
  issuing_authority TEXT,
  status TEXT NOT NULL CHECK (status IN ('pending', 'approved', 'rejected', 'expired')) DEFAULT 'pending',
  file_url TEXT,
  file_name TEXT,
  file_size INTEGER,
  validation_notes TEXT,
  validated_by UUID REFERENCES public.profiles(id),
  validated_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.certificates ENABLE ROW LEVEL SECURITY;

-- RLS Policies for certificates
CREATE POLICY "Drivers can view their own certificates" ON public.certificates
  FOR SELECT USING (driver_id = auth.uid());

CREATE POLICY "Drivers can insert their own certificates" ON public.certificates
  FOR INSERT WITH CHECK (driver_id = auth.uid());

CREATE POLICY "Drivers can update their own certificates" ON public.certificates
  FOR UPDATE USING (driver_id = auth.uid());
