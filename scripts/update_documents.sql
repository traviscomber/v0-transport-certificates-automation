-- Update document types: Remove 2 yellow documents, add 1 green document
-- Script to update subcontractor document types

-- Remove Certificado de afiliaciones (if it exists)
DELETE FROM subcontractor_document_types 
WHERE code = 'CERT_AFILIACIONES' 
OR nombre = 'Certificado de afiliaciones';

-- Remove Certificado de vacunaciones (if it exists)
DELETE FROM subcontractor_document_types 
WHERE code = 'CERT_VACUNACIONES' 
OR nombre = 'Certificado de vacunaciones';

-- Add Planilla de SEGURO SOCIAL if not already present
INSERT INTO subcontractor_document_types (code, nombre, descripcion, periodicidad, es_obligatorio) 
VALUES (
  'SEGURO_SOCIAL',
  'Planilla de SEGURO SOCIAL',
  'Planilla mensual de Seguro Social de los trabajadores',
  'Mensual',
  true
)
ON CONFLICT (code) DO NOTHING;

-- Verify changes
SELECT code, nombre, descripcion FROM subcontractor_document_types 
ORDER BY created_at DESC LIMIT 20;
