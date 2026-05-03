-- Phase 1: New tables for operational requirements
-- Created based on meeting requirements

-- 1. APPLICANTS TABLE - Postulantes
CREATE TABLE IF NOT EXISTS public.applicants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES organizations(id),
  first_name VARCHAR(255) NOT NULL,
  last_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(20),
  rut VARCHAR(12) UNIQUE NOT NULL,
  license_type VARCHAR(10), -- A1, A2, A5, etc
  status VARCHAR(50) DEFAULT 'new', -- new, background_check_pending, background_check_passed, background_check_failed, documents_pending, documents_submitted, approved, rejected
  background_check_status VARCHAR(50), -- pending, passed, failed, not_checked
  background_check_url TEXT, -- URL de sitio de chequeo
  background_check_date TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  approved_by UUID REFERENCES profiles(id),
  approved_at TIMESTAMP WITH TIME ZONE
);

-- 2. LICENSES TABLE - Licencias de conducir
CREATE TABLE IF NOT EXISTS public.driver_licenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  driver_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  license_type VARCHAR(10) NOT NULL, -- A1, A2, A5, etc
  license_number VARCHAR(50) UNIQUE NOT NULL,
  issue_date DATE NOT NULL,
  expiry_date DATE NOT NULL,
  law_change_date DATE, -- Fecha cuando cambió de A2 a A5 por cambio de ley
  status VARCHAR(50) DEFAULT 'active', -- active, expired, suspended, pending_renewal
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 3. CERTIFICATIONS TABLE - Certificaciones profesionales
CREATE TABLE IF NOT EXISTS public.driver_certifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  driver_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  certification_type VARCHAR(100) NOT NULL, -- ADR, DEFENSIVO, SEGURIDAD, etc
  certification_name VARCHAR(255),
  issue_date DATE NOT NULL,
  expiry_date DATE NOT NULL,
  certificate_number VARCHAR(100),
  issuing_organization VARCHAR(255),
  file_url TEXT,
  status VARCHAR(50) DEFAULT 'active', -- active, expired, pending_renewal
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 4. LIQUIDATIONS TABLE - Liquidaciones
CREATE TABLE IF NOT EXISTS public.driver_liquidations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  driver_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  company_id UUID NOT NULL REFERENCES organizations(id),
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  total_amount DECIMAL(12, 2) NOT NULL,
  status VARCHAR(50) DEFAULT 'draft', -- draft, pending, in_review, approved, rejected, paid
  payment_date DATE,
  notes TEXT,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  approved_by UUID REFERENCES profiles(id),
  approved_at TIMESTAMP WITH TIME ZONE
);

-- 5. SUBCONTRACTOR_DRIVERS TABLE - Conductores de subcontratistas
CREATE TABLE IF NOT EXISTS public.subcontractor_drivers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subcontractor_id UUID NOT NULL REFERENCES organizations(id),
  driver_id UUID NOT NULL REFERENCES profiles(id),
  contract_number VARCHAR(100),
  contract_start_date DATE,
  contract_end_date DATE,
  status VARCHAR(50) DEFAULT 'active', -- active, inactive, suspended
  vehicle_type VARCHAR(100), -- TRACTO, TAXI, BUS, etc
  vehicle_plate VARCHAR(20),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(subcontractor_id, driver_id)
);

-- UPDATE organizations table to include new fields
ALTER TABLE public.organizations ADD COLUMN IF NOT EXISTS 
  provider_rut VARCHAR(12);
ALTER TABLE public.organizations ADD COLUMN IF NOT EXISTS 
  service_type VARCHAR(100); -- TRANSPORTE, PRESTACION_SERVICIOS, SUBCONTRATA, etc
ALTER TABLE public.organizations ADD COLUMN IF NOT EXISTS 
  is_active BOOLEAN DEFAULT true;

-- UPDATE reports table to include payment status
ALTER TABLE public.reports ADD COLUMN IF NOT EXISTS 
  enabled BOOLEAN DEFAULT true;
ALTER TABLE public.reports ADD COLUMN IF NOT EXISTS 
  requires_payment BOOLEAN DEFAULT false;
ALTER TABLE public.reports ADD COLUMN IF NOT EXISTS 
  payment_status VARCHAR(50) DEFAULT 'unpaid'; -- unpaid, paid, pending

-- CREATE INDEXES for performance
CREATE INDEX IF NOT EXISTS idx_applicants_company_id ON public.applicants(company_id);
CREATE INDEX IF NOT EXISTS idx_applicants_status ON public.applicants(status);
CREATE INDEX IF NOT EXISTS idx_applicants_rut ON public.applicants(rut);
CREATE INDEX IF NOT EXISTS idx_driver_licenses_driver_id ON public.driver_licenses(driver_id);
CREATE INDEX IF NOT EXISTS idx_driver_licenses_status ON public.driver_licenses(status);
CREATE INDEX IF NOT EXISTS idx_driver_certifications_driver_id ON public.driver_certifications(driver_id);
CREATE INDEX IF NOT EXISTS idx_driver_certifications_expiry ON public.driver_certifications(expiry_date);
CREATE INDEX IF NOT EXISTS idx_liquidations_driver_id ON public.driver_liquidations(driver_id);
CREATE INDEX IF NOT EXISTS idx_liquidations_status ON public.driver_liquidations(status);
CREATE INDEX IF NOT EXISTS idx_liquidations_period ON public.driver_liquidations(period_start, period_end);
CREATE INDEX IF NOT EXISTS idx_subcontractor_drivers_subcontractor ON public.subcontractor_drivers(subcontractor_id);
CREATE INDEX IF NOT EXISTS idx_subcontractor_drivers_driver ON public.subcontractor_drivers(driver_id);

-- ENABLE RLS
ALTER TABLE public.applicants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.driver_licenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.driver_certifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.driver_liquidations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subcontractor_drivers ENABLE ROW LEVEL SECURITY;

-- RLS POLICIES
CREATE POLICY "applicants_view_own_company" ON public.applicants
  FOR SELECT USING (auth.uid() IN (SELECT id FROM profiles WHERE company_id = applicants.company_id));

CREATE POLICY "applicants_create" ON public.applicants
  FOR INSERT WITH CHECK (auth.uid() IN (SELECT id FROM profiles WHERE role IN ('admin', 'manager')));

CREATE POLICY "licenses_view" ON public.driver_licenses
  FOR SELECT USING (true);

CREATE POLICY "certifications_view" ON public.driver_certifications
  FOR SELECT USING (true);

CREATE POLICY "liquidations_view_own" ON public.driver_liquidations
  FOR SELECT USING (
    auth.uid() IN (SELECT id FROM profiles WHERE company_id = driver_liquidations.company_id)
    OR auth.uid() = driver_id
  );

CREATE POLICY "subcontractor_drivers_view" ON public.subcontractor_drivers
  FOR SELECT USING (true);

-- STANDARDIZE FILE NAMING - Add constraint for documents
ALTER TABLE public.certificates ADD COLUMN IF NOT EXISTS 
  standardized_filename VARCHAR(255);
  
-- Format: {driver_id}_{document_type}_{date}_{sequence}.{ext}
-- Example: UUID_LICENCIA_2024-01-15_001.pdf
