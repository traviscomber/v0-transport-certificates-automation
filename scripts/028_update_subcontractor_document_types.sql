-- Migration: Update Subcontractor Document Types
-- Goal: Remove AFP, SALUD, MUTUAL, SEGURO_SOCIAL and add PLANILLAS_IMPOSICIONES and PENSIÓN
-- Date: June 2026

BEGIN;

-- Delete old document type records (soft delete by marking as inactive)
UPDATE subcontractor_document_types
SET es_obligatorio = false
WHERE code IN ('AFP', 'SALUD', 'MUTUAL', 'SEGURO_SOCIAL');

-- Add new document types
INSERT INTO subcontractor_document_types (code, nombre, descripcion, periodicidad, es_obligatorio)
VALUES
  ('PLANILLAS_IMPOSICIONES', 'Planillas de Imposiciones', 'Planillas mensuales de imposiciones de los trabajadores', 'Mensual', true),
  ('PENSION', 'Pensión', 'Comprobantes de pensión y/o jubilación', 'Mensual', true)
ON CONFLICT (code) DO NOTHING;

-- Note: Documents already uploaded with old types will remain in the system
-- New uploads will use the updated types

COMMIT;
