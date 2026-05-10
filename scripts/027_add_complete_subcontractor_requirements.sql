-- Complete Document Requirements for Subcontractors
-- Includes all required documents for subcontractor compliance in Chilean transport
-- Categories: Empresa (Company), Subcontratación (Subcontracting), certificaciones (Certifications)

BEGIN;

-- EMPRESA (Company Documents) - 5 documents
INSERT INTO public.document_requirements (
  code, nombre, descripcion, category, applicable_to, is_active, dias_vigencia, created_at, updated_at
) VALUES
  ('CEDULA_IDENTIDAD', 'Cédula de Identidad', 'Documento de identidad vigente del representante legal', 'Empresa', ARRAY['subcontratacion'], true, 2555, NOW(), NOW()),
  ('RUT_CERTIFICADO', 'Certificado RUT', 'Certificado de RUT del SII (Estado tributario)', 'Empresa', ARRAY['subcontratacion'], true, 365, NOW(), NOW()),
  ('CERTIFICADO_ANTECEDENTES', 'Certificado de Antecedentes', 'Certificado de antecedentes de la empresa del SII', 'Empresa', ARRAY['subcontratacion'], true, 365, NOW(), NOW()),
  ('CONTRATO_VIGENTE', 'Contrato con Mandante', 'Copia del contrato vigente con el mandante/transportista principal', 'Empresa', ARRAY['subcontratacion'], true, 0, NOW(), NOW()),
  ('ESCRITURA_CONSTITUCION', 'Escritura de Constitución', 'Escritura pública de constitución de la empresa (si aplica)', 'Empresa', ARRAY['subcontratacion'], true, 0, NOW(), NOW())
ON CONFLICT (code) DO NOTHING;

-- SUBCONTRATACIÓN (Subcontracting/Vehicle Documents) - 6 documents
INSERT INTO public.document_requirements (
  code, nombre, descripcion, category, applicable_to, is_active, dias_vigencia, created_at, updated_at
) VALUES
  ('PERMISO_CIRCULACION', 'Permiso de Circulación', 'Permiso de Circulación vigente del vehículo', 'Subcontratación', ARRAY['subcontratacion'], true, 365, NOW(), NOW()),
  ('REVISION_TECNICA', 'Revisión Técnica del Vehículo', 'Certificado de Revisión Técnica vigente (Gas, Electricidad, etc.)', 'Subcontratación', ARRAY['subcontratacion'], true, 365, NOW(), NOW()),
  ('LICENCIA_CONDUCTOR', 'Licencia de Conducir', 'Licencia de Conducir vigente del conductor profesional', 'Subcontratación', ARRAY['subcontratacion'], true, 730, NOW(), NOW()),
  ('PASAPORTE_CONDUCTOR', 'Pasaporte Conducción', 'Pasaporte de Conducción (si aplica - transporte internacional)', 'Subcontratación', ARRAY['subcontratacion'], true, 730, NOW(), NOW()),
  ('CERTIFICADO_SEGURO', 'Certificado de Seguro', 'Póliza de Seguro de Responsabilidad Civil vigente', 'Subcontratación', ARRAY['subcontratacion'], true, 365, NOW(), NOW()),
  ('DECLARACION_CARGA', 'Declaración de Carga', 'Declaración de compatibilidad de carga según tipo de vehículo', 'Subcontratación', ARRAY['subcontratacion'], true, 0, NOW(), NOW())
ON CONFLICT (code) DO NOTHING;

-- CERTIFICACIONES (Professional Certifications) - 4 documents
INSERT INTO public.document_requirements (
  code, nombre, descripcion, category, applicable_to, is_active, dias_vigencia, created_at, updated_at
) VALUES
  ('ARIZTIA', 'Certificación Ariztia', 'Certificación de membresía en Ariztia (Asociación del Transporte)', 'certificaciones', ARRAY['subcontratacion'], true, 365, NOW(), NOW()),
  ('LTS', 'Certificación LTS', 'Certificación LTS (Logística y Transporte Sustentable)', 'certificaciones', ARRAY['subcontratacion'], true, 365, NOW(), NOW()),
  ('RENDIC', 'Certificación Rendic', 'Certificación Rendic (Red Nacional de Distribuidores)', 'certificaciones', ARRAY['subcontratacion'], true, 365, NOW(), NOW()),
  ('INTERPOLAR', 'Certificación Interpolar', 'Certificación Interpolar (Asociación Empresarial)', 'certificaciones', ARRAY['subcontratacion'], true, 365, NOW(), NOW())
ON CONFLICT (code) DO NOTHING;

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_document_requirements_category ON public.document_requirements(category);
CREATE INDEX IF NOT EXISTS idx_document_requirements_code ON public.document_requirements(code);
CREATE INDEX IF NOT EXISTS idx_document_requirements_is_active ON public.document_requirements(is_active);

COMMIT;
