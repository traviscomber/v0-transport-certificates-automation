-- Add is_active column to subcontractor_document_types if it doesn't exist
ALTER TABLE subcontractor_document_types
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- Deactivate old document types (requested to be removed)
UPDATE subcontractor_document_types
SET is_active = false
WHERE code IN ('AFP', 'SALUD', 'MUTUAL', 'SEGURO_SOCIAL');

-- Verify the changes
SELECT code, nombre, is_active FROM subcontractor_document_types ORDER BY code;
