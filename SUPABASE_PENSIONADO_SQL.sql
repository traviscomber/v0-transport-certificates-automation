-- ==================================================================
-- ADD es_pensionado FIELD TO CONDUCTORES TABLE
-- ==================================================================
-- 
-- INSTRUCTIONS:
-- 1. Go to: https://app.supabase.com
-- 2. Select your project
-- 3. Click "SQL Editor" in the left menu
-- 4. Click "+ New query"
-- 5. Copy and paste this ENTIRE SQL block
-- 6. Click "Run"
--
-- ==================================================================

BEGIN;

-- Add the column if it doesn't exist
ALTER TABLE public.conductores
ADD COLUMN IF NOT EXISTS es_pensionado BOOLEAN DEFAULT false;

-- Add comment to explain the field
COMMENT ON COLUMN public.conductores.es_pensionado IS 'Indicates if the driver is pensioned/retired (true) or active working (false)';

-- Verify the column was created
SELECT column_name, data_type, column_default 
FROM information_schema.columns 
WHERE table_name = 'conductores' 
AND column_name = 'es_pensionado';

COMMIT;

-- ==================================================================
-- EXPECTED RESULT:
-- Query successful ✓
-- 
-- | column_name     | data_type | column_default |
-- |-----------------|-----------|-----------------|
-- | es_pensionado   | boolean   | false           |
-- ==================================================================
