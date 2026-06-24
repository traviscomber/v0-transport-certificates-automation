-- Migration: Mark old document types as deprecated (June 24, 2026)
-- These types have been replaced with new equivalents:
-- AFP → PLANILLAS_IMPOSICIONES (monthly payroll deductions)
-- SALUD → CERT_AFIL_MUTUAL (mutual insurance affiliation certificate)
-- MUTUAL → CERT_TASAS_MUTUAL (mutual insurance rates certificate)
-- SEGURO_SOCIAL → PLANILLAS_IMPOSICIONES (social security payroll)

-- Step 1: Add is_active column if it doesn't exist
ALTER TABLE subcontractor_document_types
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- Step 2: Mark old types as inactive
UPDATE subcontractor_document_types
SET is_active = false
WHERE code IN ('AFP', 'SALUD', 'MUTUAL', 'SEGURO_SOCIAL');

-- Step 3: Verify the changes
SELECT code, nombre, is_active FROM subcontractor_document_types 
WHERE code IN ('AFP', 'SALUD', 'MUTUAL', 'SEGURO_SOCIAL', 'PLANILLAS_IMPOSICIONES', 'PENSION')
ORDER BY code;
