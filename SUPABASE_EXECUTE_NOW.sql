-- =====================================================
-- EXECUTE THIS SQL IN SUPABASE SQL EDITOR
-- 
-- Steps:
-- 1. Go to https://app.supabase.com
-- 2. Select your project
-- 3. Go to "SQL Editor" in left menu
-- 4. Click "+ New query"
-- 5. Paste ALL the SQL below
-- 6. Click "Run"
-- =====================================================

-- Add es_pensionado field to conductores table
-- This field indicates if a driver is retired/pensioned (true) or still working (false)

ALTER TABLE public.conductores
ADD COLUMN IF NOT EXISTS es_pensionado BOOLEAN DEFAULT false;

-- Add column comment
COMMENT ON COLUMN public.conductores.es_pensionado IS 
'Indicates if the driver is pensioned/retired (true) or active working (false)';

-- Verify the field was added
SELECT 
  column_name, 
  data_type, 
  is_nullable, 
  column_default
FROM information_schema.columns
WHERE table_name = 'conductores' 
AND column_name IN ('id', 'nombres', 'es_pensionado')
ORDER BY ordinal_position;
