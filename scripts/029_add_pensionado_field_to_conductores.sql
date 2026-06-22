-- Add es_pensionado field to conductores table
-- This field indicates whether a driver is retired/pensioned (true) or not (false)

BEGIN;

-- Add the column if it doesn't exist
ALTER TABLE public.conductores
ADD COLUMN IF NOT EXISTS es_pensionado BOOLEAN DEFAULT false;

-- Add comment to explain the field
COMMENT ON COLUMN public.conductores.es_pensionado IS 'Indicates if the driver is pensioned/retired (true) or active working (false)';

COMMIT;
