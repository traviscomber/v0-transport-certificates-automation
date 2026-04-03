-- ============================================================
-- FULL DATABASE MIGRATION - TransporteCL
-- Creates all tables required by the application
-- ============================================================

-- 1. PROFILES (already created in project setup, ensure it exists)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID NOT NULL PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  role TEXT DEFAULT 'driver',
  company_name TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. ORGANIZATIONS
CREATE TABLE IF NOT EXISTS public.organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  rut TEXT,
  address TEXT,
  phone TEXT,
  email TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 3. MANDANTES (companies that contract transport)
CREATE TABLE IF NOT EXISTS public.mandantes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rut TEXT NOT NULL UNIQUE,
  razon_social TEXT NOT NULL,
  nombre_fantasia TEXT,
  email TEXT,
  telefono TEXT,
  direccion TEXT,
  comuna TEXT,
  ciudad TEXT,
  contacto_nombre TEXT,
  contacto_email TEXT,
  contacto_telefono TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 4. TRANSPORTISTAS (transport companies)
CREATE TABLE IF NOT EXISTS public.transportistas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rut TEXT NOT NULL UNIQUE,
  razon_social TEXT NOT NULL,
  nombre_fantasia TEXT,
  email TEXT,
  telefono TEXT,
  direccion TEXT,
  comuna TEXT,
  ciudad TEXT,
  representante_legal TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 5. MANDANTE-TRANSPORTISTA relationship
CREATE TABLE IF NOT EXISTS public.mandante_transportista (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mandante_id UUID NOT NULL REFERENCES public.mandantes(id) ON DELETE CASCADE,
  transportista_id UUID NOT NULL REFERENCES public.transportistas(id) ON DELETE CASCADE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(mandante_id, transportista_id)
);

-- 6. CONDUCTORES (drivers)
CREATE TABLE IF NOT EXISTS public.conductores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transportista_id UUID REFERENCES public.transportistas(id) ON DELETE SET NULL,
  rut TEXT NOT NULL UNIQUE,
  nombres TEXT NOT NULL,
  apellido_paterno TEXT NOT NULL,
  apellido_materno TEXT,
  fecha_nacimiento DATE,
  direccion TEXT,
  comuna TEXT,
  ciudad TEXT,
  telefono TEXT,
  email TEXT,
  clase_licencia TEXT,
  numero_licencia TEXT,
  vencimiento_licencia DATE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 7. VEHICULOS (vehicles)
CREATE TABLE IF NOT EXISTS public.vehiculos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transportista_id UUID REFERENCES public.transportistas(id) ON DELETE SET NULL,
  patente TEXT NOT NULL UNIQUE,
  tipo TEXT NOT NULL,
  marca TEXT,
  modelo TEXT,
  ano INTEGER,
  color TEXT,
  numero_chasis TEXT,
  numero_motor TEXT,
  capacidad_carga NUMERIC,
  unidad_carga TEXT DEFAULT 'kg',
  tiene_gps BOOLEAN DEFAULT false,
  gps_id TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 8. VEHICLES (English API alias)
CREATE TABLE IF NOT EXISTS public.vehicles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.organizations(id) ON DELETE SET NULL,
  plate TEXT NOT NULL UNIQUE,
  type TEXT NOT NULL,
  brand TEXT,
  model TEXT,
  year INTEGER,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 9. DRIVERS (English API alias)
CREATE TABLE IF NOT EXISTS public.drivers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.organizations(id) ON DELETE SET NULL,
  rut TEXT NOT NULL UNIQUE,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  license_class TEXT,
  license_expiry DATE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 10. DOCUMENT_TYPES
CREATE TABLE IF NOT EXISTS public.document_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL DEFAULT 'general',
  applies_to TEXT[] DEFAULT '{}',
  is_mandatory BOOLEAN DEFAULT false,
  validity_days INTEGER,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 11. UPLOADED_DOCUMENTS
CREATE TABLE IF NOT EXISTS public.uploaded_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_type_id UUID REFERENCES public.document_types(id) ON DELETE SET NULL,
  transportista_id UUID REFERENCES public.transportistas(id) ON DELETE SET NULL,
  conductor_id UUID REFERENCES public.conductores(id) ON DELETE SET NULL,
  vehiculo_id UUID REFERENCES public.vehiculos(id) ON DELETE SET NULL,
  uploaded_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  original_filename TEXT,
  file_url TEXT,
  file_path TEXT,
  file_size INTEGER,
  mime_type TEXT,
  ocr_raw_text TEXT,
  ocr_structured_data JSONB,
  confidence_score NUMERIC(4,3),
  validation_status TEXT DEFAULT 'pending' CHECK (validation_status IN ('pending', 'validated', 'rejected', 'review')),
  validation_notes TEXT,
  validated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  validated_at TIMESTAMPTZ,
  expiry_date DATE,
  issue_date DATE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 12. CERTIFICATES
CREATE TABLE IF NOT EXISTS public.certificates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  uploaded_document_id UUID REFERENCES public.uploaded_documents(id) ON DELETE SET NULL,
  driver_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  certificate_type TEXT NOT NULL,
  file_url TEXT,
  file_path TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 13. NOTIFICATIONS
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT DEFAULT 'info',
  is_read BOOLEAN DEFAULT false,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 14. DOCUMENTS (generic)
CREATE TABLE IF NOT EXISTS public.documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.organizations(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  type TEXT,
  status TEXT DEFAULT 'active',
  file_url TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 15. TRANSPORTERS (English alias for documents API)
CREATE TABLE IF NOT EXISTS public.transporters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  rut TEXT,
  email TEXT,
  phone TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 16. MACHINES
CREATE TABLE IF NOT EXISTS public.machines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transporter_id UUID REFERENCES public.transporters(id) ON DELETE SET NULL,
  plate TEXT,
  type TEXT,
  brand TEXT,
  model TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 17. ALERTS
CREATE TABLE IF NOT EXISTS public.alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL,
  severity TEXT DEFAULT 'medium' CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  title TEXT NOT NULL,
  message TEXT,
  entity_type TEXT,
  entity_id UUID,
  is_resolved BOOLEAN DEFAULT false,
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 18. REPORTS
CREATE TABLE IF NOT EXISTS public.reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  parameters JSONB,
  result_data JSONB,
  generated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 19. AUDIT_LOGS
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  entity_type TEXT,
  entity_id TEXT,
  old_data JSONB,
  new_data JSONB,
  ip_address TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 20. USER_ROLES
CREATE TABLE IF NOT EXISTS public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL,
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, role, organization_id)
);

-- 21. PENDING_REVIEWS
CREATE TABLE IF NOT EXISTS public.pending_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID REFERENCES public.uploaded_documents(id) ON DELETE CASCADE,
  reviewer_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_review', 'completed')),
  priority TEXT DEFAULT 'normal',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 22. REVIEW_QUEUE
CREATE TABLE IF NOT EXISTS public.review_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID REFERENCES public.uploaded_documents(id) ON DELETE CASCADE,
  assigned_to UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  status TEXT DEFAULT 'pending',
  priority INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 23. REVIEW_DECISIONS
CREATE TABLE IF NOT EXISTS public.review_decisions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  review_id UUID REFERENCES public.review_queue(id) ON DELETE CASCADE,
  reviewer_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  decision TEXT NOT NULL CHECK (decision IN ('approved', 'rejected', 'needs_more_info')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 24. OCR_FEEDBACK
CREATE TABLE IF NOT EXISTS public.ocr_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID REFERENCES public.uploaded_documents(id) ON DELETE CASCADE,
  field_name TEXT NOT NULL,
  original_value TEXT,
  corrected_value TEXT,
  reviewer_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 25. NOTIFICATION_JOBS
CREATE TABLE IF NOT EXISTS public.notification_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL,
  payload JSONB,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  attempts INTEGER DEFAULT 0,
  error_message TEXT,
  scheduled_at TIMESTAMPTZ DEFAULT now(),
  processed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- SEED: Default document types for Chile transport compliance
-- ============================================================
INSERT INTO public.document_types (code, name, description, category, applies_to, is_mandatory, validity_days) VALUES
  ('LICENCIA_CONDUCIR', 'Licencia de Conducir', 'Licencia profesional del conductor', 'conductor', ARRAY['conductor'], true, 365),
  ('REVISION_TECNICA', 'Revisión Técnica', 'Revisión técnica del vehículo', 'vehiculo', ARRAY['vehiculo'], true, 365),
  ('SEGURO_OBLIGATORIO', 'Seguro Obligatorio (SOAP)', 'Seguro obligatorio de accidentes personales', 'vehiculo', ARRAY['vehiculo'], true, 365),
  ('PERMISO_CIRCULACION', 'Permiso de Circulación', 'Permiso municipal de circulación', 'vehiculo', ARRAY['vehiculo'], true, 365),
  ('CERTIFICADO_PESAJE', 'Certificado de Pesaje', 'Certificado de peso máximo autorizado', 'vehiculo', ARRAY['vehiculo'], false, 365),
  ('HOJA_VIDA_CONDUCTOR', 'Hoja de Vida del Conductor', 'Registro de infracciones y accidentes', 'conductor', ARRAY['conductor'], true, 90),
  ('CONTRATO_TRABAJO', 'Contrato de Trabajo', 'Contrato laboral del conductor', 'conductor', ARRAY['conductor'], true, NULL),
  ('CERTIFICADO_SALUD', 'Certificado Médico', 'Certificado de aptitud médica para conducir', 'conductor', ARRAY['conductor'], true, 365),
  ('SEGURO_CARGA', 'Seguro de Carga', 'Seguro para la mercancía transportada', 'transportista', ARRAY['transportista'], false, 365),
  ('PATENTE_COMERCIAL', 'Patente Comercial', 'Patente de funcionamiento de la empresa', 'transportista', ARRAY['transportista'], true, 365),
  ('RUT_EMPRESA', 'RUT Empresa / Inicio de Actividades', 'Certificado SII de inicio de actividades', 'transportista', ARRAY['transportista'], true, NULL),
  ('CERTIFICADO_ANTECEDENTES', 'Certificado de Antecedentes', 'Certificado de antecedentes penales del conductor', 'conductor', ARRAY['conductor'], true, 90),
  ('GUIA_DESPACHO', 'Guía de Despacho', 'Documento de despacho de mercancía', 'documento', ARRAY['operacion'], false, NULL),
  ('CARTA_PORTE', 'Carta de Porte', 'Contrato de transporte de mercancías', 'documento', ARRAY['operacion'], false, NULL),
  ('DECLARACION_JURADA', 'Declaración Jurada', 'Declaración jurada del conductor o empresa', 'documento', ARRAY['conductor', 'transportista'], false, NULL)
ON CONFLICT (code) DO NOTHING;

-- ============================================================
-- TRIGGER: Auto-update updated_at
-- ============================================================
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$ 
DECLARE
  tbl TEXT;
BEGIN
  FOREACH tbl IN ARRAY ARRAY['profiles','organizations','mandantes','transportistas','conductores','vehiculos','vehicles','drivers','document_types','uploaded_documents','certificates','documents','transporters','machines','pending_reviews','review_queue']
  LOOP
    EXECUTE format('
      DROP TRIGGER IF EXISTS trg_updated_at ON public.%I;
      CREATE TRIGGER trg_updated_at
        BEFORE UPDATE ON public.%I
        FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
    ', tbl, tbl);
  END LOOP;
END $$;
