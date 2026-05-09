-- Add Certifications as Document Requirements
-- Integrates Ariztia, LTS, Rendic, Interpolar as manageable documents

BEGIN;

INSERT INTO public.document_requirements (
  code, nombre, descripcion, category, applicable_to, is_active, dias_vigencia, created_at, updated_at
) VALUES
  -- CERTIFICATIONS (4) - New category for transportista/subcontractor certifications
  ('ARIZTIA', 'Certificación Ariztia', 'Certificación de membresía en Ariztia (Asociación del Transporte)', 'certificaciones', ARRAY['transportista', 'subcontratacion'], true, 365, NOW(), NOW()),
  ('LTS', 'Certificación LTS', 'Certificación LTS (Logística y Transporte Sustentable)', 'certificaciones', ARRAY['transportista', 'subcontratacion'], true, 365, NOW(), NOW()),
  ('RENDIC', 'Certificación Rendic', 'Certificación Rendic (Red Nacional de Distribuidores)', 'certificaciones', ARRAY['transportista', 'subcontratacion'], true, 365, NOW(), NOW()),
  ('INTERPOLAR', 'Certificación Interpolar', 'Certificación Interpolar (Asociación Empresarial)', 'certificaciones', ARRAY['transportista', 'subcontratacion'], true, 365, NOW(), NOW())
ON CONFLICT (code) DO NOTHING;

COMMIT;
