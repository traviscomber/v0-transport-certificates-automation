-- Enhance alerts table to support ejecutiva filtering and document tracking
-- Schema Enhancement for Alerts System - May 2026

BEGIN;

-- Add columns to track document and ejecutiva association
ALTER TABLE IF EXISTS public.alerts 
ADD COLUMN IF NOT EXISTS transportista_id UUID REFERENCES public.transportistas(id) ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS subcontratista_id UUID REFERENCES public.subcontratistas(id) ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS ejecutiva_nombre VARCHAR(255),
ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'pendiente',
ADD COLUMN IF NOT EXISTS action_type VARCHAR(50),
ADD COLUMN IF NOT EXISTS action_notes TEXT,
ADD COLUMN IF NOT EXISTS actioned_by VARCHAR(255),
ADD COLUMN IF NOT EXISTS actioned_at TIMESTAMP;

-- Create indexes for fast filtering by ejecutiva
CREATE INDEX IF NOT EXISTS idx_alerts_ejecutiva ON public.alerts(ejecutiva_nombre);
CREATE INDEX IF NOT EXISTS idx_alerts_transportista ON public.alerts(transportista_id);
CREATE INDEX IF NOT EXISTS idx_alerts_subcontratista ON public.alerts(subcontratista_id);
CREATE INDEX IF NOT EXISTS idx_alerts_status ON public.alerts(status);
CREATE INDEX IF NOT EXISTS idx_alerts_ejecutiva_status ON public.alerts(ejecutiva_nombre, status);

COMMIT;
