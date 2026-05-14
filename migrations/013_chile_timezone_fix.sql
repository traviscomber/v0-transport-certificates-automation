-- ============================================================
-- Migration 013: Chile Timezone Fix
-- Converts all timestamps to Chile timezone (UTC-8)
-- ============================================================

-- Create a function to get current time in Chile timezone
CREATE OR REPLACE FUNCTION now_chile()
RETURNS TIMESTAMP WITH TIME ZONE AS $$
  SELECT NOW() AT TIME ZONE 'America/Santiago';
$$ LANGUAGE SQL;

-- Create a function to convert UTC to Chile timezone
CREATE OR REPLACE FUNCTION to_chile_time(utc_time TIMESTAMP WITH TIME ZONE)
RETURNS TIMESTAMP WITH TIME ZONE AS $$
  SELECT utc_time AT TIME ZONE 'America/Santiago';
$$ LANGUAGE SQL;

-- Update alerts_log table to use Chile timezone
ALTER TABLE IF EXISTS alerts_log
  ALTER COLUMN created_at SET DEFAULT now_chile();

-- Update conductor_documents table to use Chile timezone
ALTER TABLE IF EXISTS conductor_documents
  ALTER COLUMN created_at SET DEFAULT now_chile();

-- Update subcontractor_documents table to use Chile timezone  
ALTER TABLE IF EXISTS subcontractor_documents
  ALTER COLUMN created_at SET DEFAULT now_chile();

-- Update all other created_at columns to use Chile timezone
ALTER TABLE IF EXISTS profiles
  ALTER COLUMN created_at SET DEFAULT now_chile();

ALTER TABLE IF EXISTS organizations
  ALTER COLUMN created_at SET DEFAULT now_chile();

ALTER TABLE IF EXISTS conductores
  ALTER COLUMN created_at SET DEFAULT now_chile();

ALTER TABLE IF EXISTS transportistas
  ALTER COLUMN created_at SET DEFAULT now_chile();

ALTER TABLE IF EXISTS executive_staff
  ALTER COLUMN created_at SET DEFAULT now_chile();

-- Note: This fix ensures all new records are created with Chile timezone
-- For existing records, they are already in UTC and the frontend conversion
-- can be kept in place temporarily
