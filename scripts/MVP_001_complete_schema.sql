-- =====================================================
-- MVP COMPLETE DATABASE SCHEMA
-- Transport Certificate Management Platform
-- =====================================================
-- Run this script in Supabase SQL Editor to set up
-- all tables required for the MVP
-- =====================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- 1. ORGANIZATIONS (Mandantes y Transportistas)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.organizations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  rut TEXT UNIQUE,
  type TEXT NOT NULL CHECK (type IN ('mandante', 'transportista')),
  address TEXT,
  city TEXT,
  region TEXT,
  phone TEXT,
  email TEXT,
  logo_url TEXT,
  is_active BOOLEAN DEFAULT true,
  compliance_score INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 2. PROFILES (Users with roles)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  full_name TEXT,
  role TEXT NOT NULL CHECK (role IN ('admin', 'dispatcher', 'driver', 'mandante', 'transportista')) DEFAULT 'driver',
  organization_id UUID REFERENCES public.organizations(id) ON DELETE SET NULL,
  rut TEXT,
  phone TEXT,
  avatar_url TEXT,
  is_active BOOLEAN DEFAULT true,
  last_login TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 3. VEHICLES (Vehiculos)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.vehicles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  plate TEXT NOT NULL,
  brand TEXT,
  model TEXT,
  year INTEGER,
  type TEXT CHECK (type IN ('camion', 'furgon', 'trailer', 'semi', 'otro')),
  vin TEXT,
  is_active BOOLEAN DEFAULT true,
  compliance_score INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 4. DRIVERS (Conductores)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.drivers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  rut TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  license_number TEXT,
  license_type TEXT,
  license_expiry DATE,
  is_active BOOLEAN DEFAULT true,
  compliance_score INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 5. DOCUMENT TYPES (Tipos de Documentos)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.document_types (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT CHECK (category IN ('empresa', 'conductor', 'vehiculo', 'operacional', 'seguridad', 'subcontratacion')),
  is_mandatory BOOLEAN DEFAULT true,
  validity_days INTEGER, -- NULL means no expiry
  required_fields JSONB DEFAULT '[]',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 6. CERTIFICATES/DOCUMENTS (Certificados)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.certificates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  document_type_id UUID REFERENCES public.document_types(id),
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  driver_id UUID REFERENCES public.drivers(id) ON DELETE CASCADE,
  vehicle_id UUID REFERENCES public.vehicles(id) ON DELETE CASCADE,
  uploaded_by UUID REFERENCES public.profiles(id),
  
  -- Document info
  document_number TEXT,
  file_url TEXT NOT NULL,
  file_name TEXT,
  file_size INTEGER,
  mime_type TEXT,
  
  -- Dates
  issue_date DATE,
  expiry_date DATE,
  
  -- Status
  status TEXT CHECK (status IN ('pending', 'approved', 'rejected', 'expired')) DEFAULT 'pending',
  rejection_reason TEXT,
  reviewed_by UUID REFERENCES public.profiles(id),
  reviewed_at TIMESTAMPTZ,
  
  -- OCR Data
  ocr_data JSONB,
  ocr_confidence DECIMAL(5,2),
  ocr_processed_at TIMESTAMPTZ,
  
  -- Metadata
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 7. ALERTS (Sistema de Alertas)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.alerts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  certificate_id UUID REFERENCES public.certificates(id) ON DELETE CASCADE,
  driver_id UUID REFERENCES public.drivers(id) ON DELETE CASCADE,
  vehicle_id UUID REFERENCES public.vehicles(id) ON DELETE CASCADE,
  
  type TEXT NOT NULL CHECK (type IN ('expiry', 'missing', 'rejected', 'compliance', 'system')),
  priority TEXT CHECK (priority IN ('low', 'normal', 'high', 'critical')) DEFAULT 'normal',
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  
  is_read BOOLEAN DEFAULT false,
  read_at TIMESTAMPTZ,
  is_dismissed BOOLEAN DEFAULT false,
  dismissed_at TIMESTAMPTZ,
  
  -- For scheduled alerts
  scheduled_for TIMESTAMPTZ,
  sent_email BOOLEAN DEFAULT false,
  sent_push BOOLEAN DEFAULT false,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 8. REPORTS (Reportes Generados)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  generated_by UUID REFERENCES public.profiles(id),
  
  report_type TEXT NOT NULL CHECK (report_type IN ('compliance', 'certificates', 'activity', 'audit', 'custom')),
  title TEXT NOT NULL,
  description TEXT,
  
  -- Report data
  parameters JSONB,
  data JSONB,
  file_url TEXT,
  file_format TEXT CHECK (file_format IN ('pdf', 'xlsx', 'csv')),
  
  -- Period
  date_from DATE,
  date_to DATE,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 9. AUDIT LOG (Historial de Acciones)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.audit_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id),
  organization_id UUID REFERENCES public.organizations(id),
  
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id UUID,
  
  old_data JSONB,
  new_data JSONB,
  ip_address TEXT,
  user_agent TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 10. ORGANIZATION RELATIONSHIPS (Mandante-Transportista)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.organization_relationships (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  mandante_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  transportista_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  
  status TEXT CHECK (status IN ('pending', 'active', 'suspended', 'terminated')) DEFAULT 'pending',
  compliance_required INTEGER DEFAULT 100, -- minimum compliance score required
  
  started_at TIMESTAMPTZ DEFAULT NOW(),
  ended_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(mandante_id, transportista_id)
);

-- =====================================================
-- 11. DRIVER ASSIGNMENTS (Asignacion Conductor-Vehiculo)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.driver_assignments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  driver_id UUID NOT NULL REFERENCES public.drivers(id) ON DELETE CASCADE,
  vehicle_id UUID NOT NULL REFERENCES public.vehicles(id) ON DELETE CASCADE,
  
  is_primary BOOLEAN DEFAULT false,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  ended_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_profiles_organization ON public.profiles(organization_id);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_vehicles_organization ON public.vehicles(organization_id);
CREATE INDEX IF NOT EXISTS idx_drivers_organization ON public.drivers(organization_id);
CREATE INDEX IF NOT EXISTS idx_certificates_organization ON public.certificates(organization_id);
CREATE INDEX IF NOT EXISTS idx_certificates_driver ON public.certificates(driver_id);
CREATE INDEX IF NOT EXISTS idx_certificates_vehicle ON public.certificates(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_certificates_status ON public.certificates(status);
CREATE INDEX IF NOT EXISTS idx_certificates_expiry ON public.certificates(expiry_date);
CREATE INDEX IF NOT EXISTS idx_alerts_user ON public.alerts(user_id);
CREATE INDEX IF NOT EXISTS idx_alerts_organization ON public.alerts(organization_id);
CREATE INDEX IF NOT EXISTS idx_alerts_unread ON public.alerts(user_id, is_read) WHERE is_read = false;
CREATE INDEX IF NOT EXISTS idx_audit_log_user ON public.audit_log(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_entity ON public.audit_log(entity_type, entity_id);

-- =====================================================
-- ENABLE ROW LEVEL SECURITY
-- =====================================================
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.drivers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.document_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.certificates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organization_relationships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.driver_assignments ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- RLS POLICIES
-- =====================================================

-- Profiles: Users can see/edit their own profile
CREATE POLICY "profiles_select_own" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "profiles_update_own" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "profiles_insert_own" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Organizations: Members can view their organization
CREATE POLICY "organizations_select" ON public.organizations FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.organization_id = organizations.id)
  OR EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
);

-- Document Types: Everyone can read (public catalog)
CREATE POLICY "document_types_select" ON public.document_types FOR SELECT USING (true);

-- Vehicles: Organization members can view
CREATE POLICY "vehicles_select" ON public.vehicles FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.organization_id = vehicles.organization_id)
);

-- Drivers: Organization members can view
CREATE POLICY "drivers_select" ON public.drivers FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.organization_id = drivers.organization_id)
);

-- Certificates: Organization members can view
CREATE POLICY "certificates_select" ON public.certificates FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.organization_id = certificates.organization_id)
);

-- Alerts: Users see their own alerts
CREATE POLICY "alerts_select" ON public.alerts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "alerts_update" ON public.alerts FOR UPDATE USING (auth.uid() = user_id);

-- Reports: Organization members can view
CREATE POLICY "reports_select" ON public.reports FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.organization_id = reports.organization_id)
);

-- =====================================================
-- INSERT DEFAULT DOCUMENT TYPES
-- =====================================================
INSERT INTO public.document_types (code, name, description, category, is_mandatory, validity_days) VALUES
-- Empresa
('rut_empresa', 'RUT Empresa', 'Rol Unico Tributario de la empresa', 'empresa', true, NULL),
('inicio_actividades', 'Inicio de Actividades', 'Documento de inicio de actividades SII', 'empresa', true, NULL),
('patente_comercial', 'Patente Comercial', 'Patente municipal de comercio', 'empresa', true, 365),
('cert_antecedentes_laborales', 'Certificado Antecedentes Laborales', 'F30-1 Direccion del Trabajo', 'empresa', true, 30),
('cert_deuda_isapre', 'Certificado Deuda ISAPRE', 'Sin deuda previsional', 'empresa', true, 30),

-- Conductor
('licencia_conducir', 'Licencia de Conducir', 'Licencia profesional clase A', 'conductor', true, 365),
('cedula_identidad', 'Cedula de Identidad', 'Documento de identidad vigente', 'conductor', true, 3650),
('hoja_vida_conductor', 'Hoja de Vida Conductor', 'Registro de infracciones y accidentes', 'conductor', true, 180),
('cert_antecedentes', 'Certificado de Antecedentes', 'Antecedentes penales', 'conductor', true, 90),
('examen_psicosensometrico', 'Examen Psicosensometrico', 'Evaluacion psicologica y sensorial', 'conductor', true, 365),

-- Vehiculo
('revision_tecnica', 'Revision Tecnica', 'Certificado de revision tecnica vehicular', 'vehiculo', true, 365),
('permiso_circulacion', 'Permiso de Circulacion', 'Permiso anual de circulacion', 'vehiculo', true, 365),
('soap', 'SOAP', 'Seguro obligatorio accidentes personales', 'vehiculo', true, 365),
('seguro_responsabilidad', 'Seguro Responsabilidad Civil', 'Poliza de responsabilidad civil', 'vehiculo', true, 365),
('padron_vehiculo', 'Padron del Vehiculo', 'Inscripcion en registro de vehiculos', 'vehiculo', true, NULL),

-- Seguridad
('reglamento_interno', 'Reglamento Interno', 'Reglamento interno de seguridad', 'seguridad', true, NULL),
('charla_seguridad', 'Charla de Seguridad', 'Registro de charla de seguridad', 'seguridad', false, 30),
('epp', 'Entrega EPP', 'Registro de entrega de elementos de proteccion', 'seguridad', true, 365),

-- Subcontratacion
('contrato_transporte', 'Contrato de Transporte', 'Contrato de prestacion de servicios', 'subcontratacion', true, NULL),
('cert_ley_subcontratacion', 'Certificado Ley Subcontratacion', 'Certificado Ley 20.123', 'subcontratacion', true, 30)

ON CONFLICT (code) DO NOTHING;

-- =====================================================
-- FUNCTIONS
-- =====================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply triggers
CREATE TRIGGER update_organizations_updated_at BEFORE UPDATE ON public.organizations FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_vehicles_updated_at BEFORE UPDATE ON public.vehicles FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_drivers_updated_at BEFORE UPDATE ON public.drivers FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_certificates_updated_at BEFORE UPDATE ON public.certificates FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Function to calculate compliance score
CREATE OR REPLACE FUNCTION calculate_compliance_score(p_organization_id UUID)
RETURNS INTEGER AS $$
DECLARE
  total_required INTEGER;
  total_valid INTEGER;
  score INTEGER;
BEGIN
  SELECT COUNT(*) INTO total_required
  FROM public.document_types
  WHERE is_mandatory = true AND is_active = true;
  
  SELECT COUNT(*) INTO total_valid
  FROM public.certificates c
  JOIN public.document_types dt ON c.document_type_id = dt.id
  WHERE c.organization_id = p_organization_id
    AND c.status = 'approved'
    AND (c.expiry_date IS NULL OR c.expiry_date > CURRENT_DATE)
    AND dt.is_mandatory = true;
  
  IF total_required > 0 THEN
    score := (total_valid * 100) / total_required;
  ELSE
    score := 100;
  END IF;
  
  RETURN score;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- STORAGE BUCKET
-- =====================================================
-- Run in Supabase Dashboard > Storage > Create Bucket
-- Name: certificates
-- Public: false
-- File size limit: 10MB
-- Allowed MIME types: image/*, application/pdf

SELECT 'MVP Schema created successfully!' as status;
