-- Migration: Add document management features (status, custom_code, expiration, audit log)

-- 1. Alter documents table to add new columns
ALTER TABLE public.documents 
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'expired')),
ADD COLUMN IF NOT EXISTS custom_code TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS expiration_date DATE,
ADD COLUMN IF NOT EXISTS changed_by UUID,
ADD COLUMN IF NOT EXISTS changed_at TIMESTAMP WITH TIME ZONE;

-- 2. Create audit log table for tracking document changes
CREATE TABLE IF NOT EXISTS public.document_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID NOT NULL REFERENCES public.documents(id) ON DELETE CASCADE,
  action TEXT NOT NULL CHECK (action IN ('created', 'status_changed', 'renamed', 'expiration_set', 'deleted')),
  old_value JSONB,
  new_value JSONB,
  changed_by TEXT, -- Admin user ID or name
  changed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Create indices for performance
CREATE INDEX IF NOT EXISTS idx_documents_status ON public.documents(status);
CREATE INDEX IF NOT EXISTS idx_documents_custom_code ON public.documents(custom_code);
CREATE INDEX IF NOT EXISTS idx_documents_expiration_date ON public.documents(expiration_date);
CREATE INDEX IF NOT EXISTS idx_documents_driver_rut ON public.documents USING GIN (file_name jsonb_ops);
CREATE INDEX IF NOT EXISTS idx_audit_log_document ON public.document_audit_log(document_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_changed_at ON public.document_audit_log(changed_at);

-- 4. Create alerts table for expiration notifications
CREATE TABLE IF NOT EXISTS public.document_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID NOT NULL REFERENCES public.documents(id) ON DELETE CASCADE,
  driver_rut TEXT NOT NULL,
  alert_type TEXT NOT NULL CHECK (alert_type IN ('expiring_soon', 'expired', 'pending_review')),
  days_until_expiration INT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'dismissed', 'resolved')),
  sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  dismissed_at TIMESTAMP WITH TIME ZONE,
  dismissed_by TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_alerts_driver_rut ON public.document_alerts(driver_rut);
CREATE INDEX IF NOT EXISTS idx_alerts_status ON public.document_alerts(status);
CREATE INDEX IF NOT EXISTS idx_alerts_expiration ON public.document_alerts(alert_type);

-- 5. Enable RLS on new tables
ALTER TABLE public.document_audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.document_alerts ENABLE ROW LEVEL SECURITY;

-- 6. Create policies for new tables (allow all for now - restrict in production)
CREATE POLICY "Allow all operations on audit_log" ON public.document_audit_log
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all operations on alerts" ON public.document_alerts
  FOR ALL USING (true) WITH CHECK (true);
