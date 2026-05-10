-- Unify alerts_log table to support ejecutiva-based filtering and CTAs
-- Production-ready schema enhancement
-- May 2026

BEGIN;

-- Add ejecutiva and entity association columns
ALTER TABLE IF EXISTS public.alerts_log 
ADD COLUMN IF NOT EXISTS ejecutiva_nombre VARCHAR(255),
ADD COLUMN IF NOT EXISTS transportista_id UUID,
ADD COLUMN IF NOT EXISTS subcontratista_id UUID,
ADD COLUMN IF NOT EXISTS driver_id VARCHAR(255),
ADD COLUMN IF NOT EXISTS document_id UUID,
ADD COLUMN IF NOT EXISTS document_type VARCHAR(100),
ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'pendiente',
ADD COLUMN IF NOT EXISTS action_type VARCHAR(50),
ADD COLUMN IF NOT EXISTS action_notes TEXT,
ADD COLUMN IF NOT EXISTS actioned_by VARCHAR(255),
ADD COLUMN IF NOT EXISTS actioned_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS message TEXT,
ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'::jsonb;

-- Backfill: copy description to message for backward compatibility
UPDATE public.alerts_log 
SET message = description 
WHERE message IS NULL AND description IS NOT NULL;

-- Create indexes for fast filtering
CREATE INDEX IF NOT EXISTS idx_alerts_log_ejecutiva ON public.alerts_log(ejecutiva_nombre);
CREATE INDEX IF NOT EXISTS idx_alerts_log_status ON public.alerts_log(status);
CREATE INDEX IF NOT EXISTS idx_alerts_log_ejecutiva_status ON public.alerts_log(ejecutiva_nombre, status);
CREATE INDEX IF NOT EXISTS idx_alerts_log_transportista ON public.alerts_log(transportista_id);
CREATE INDEX IF NOT EXISTS idx_alerts_log_subcontratista ON public.alerts_log(subcontratista_id);
CREATE INDEX IF NOT EXISTS idx_alerts_log_driver ON public.alerts_log(driver_id);
CREATE INDEX IF NOT EXISTS idx_alerts_log_document ON public.alerts_log(document_id);

COMMIT;
