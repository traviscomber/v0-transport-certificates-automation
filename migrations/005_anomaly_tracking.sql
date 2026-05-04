-- Create anomaly_tracking table to track actions on detected anomalies
CREATE TABLE IF NOT EXISTS public.anomaly_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID NOT NULL REFERENCES public.documents(id) ON DELETE CASCADE,
  anomaly_type TEXT NOT NULL, -- 'fraud', 'alteration', 'expiration', 'invalid_format', etc.
  severity TEXT NOT NULL DEFAULT 'medium', -- 'low', 'medium', 'high', 'critical'
  description TEXT,
  detected_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  
  -- Action tracking
  action_taken TEXT, -- 'approved', 'rejected', 'investigated', 'pending'
  action_taken_by UUID REFERENCES auth.users(id),
  action_taken_at TIMESTAMP WITH TIME ZONE,
  action_notes TEXT,
  
  -- Metadata
  raw_anomaly_data JSONB, -- Store full vision API response for reference
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_anomaly_tracking_document_id ON public.anomaly_tracking(document_id);
CREATE INDEX IF NOT EXISTS idx_anomaly_tracking_severity ON public.anomaly_tracking(severity);
CREATE INDEX IF NOT EXISTS idx_anomaly_tracking_action_taken ON public.anomaly_tracking(action_taken);
CREATE INDEX IF NOT EXISTS idx_anomaly_tracking_detected_at ON public.anomaly_tracking(detected_at DESC);

-- Enable RLS
ALTER TABLE public.anomaly_tracking ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Allow company users to view and update anomalies for their documents
CREATE POLICY "Companies can view and update their anomalies"
  ON public.anomaly_tracking
  FOR ALL
  USING (
    document_id IN (
      SELECT id FROM public.documents
      WHERE company_id = (
        SELECT company_id FROM public.users WHERE id = auth.uid()
      )
    )
  );

-- RLS Policy: Allow admin to view all anomalies
CREATE POLICY "Admin can manage all anomalies"
  ON public.anomaly_tracking
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Create view for easy anomaly queries
CREATE OR REPLACE VIEW public.anomalies_with_document_details AS
SELECT 
  at.id,
  at.document_id,
  at.anomaly_type,
  at.severity,
  at.description,
  at.detected_at,
  at.action_taken,
  at.action_taken_by,
  at.action_taken_at,
  at.action_notes,
  d.document_type,
  d.ocr_text,
  d.extracted_data,
  d.status,
  c.id as company_id,
  c.name as company_name,
  dr.full_name as driver_name,
  dr.rut as driver_rut
FROM public.anomaly_tracking at
JOIN public.documents d ON at.document_id = d.id
JOIN public.companies c ON d.company_id = c.id
LEFT JOIN public.drivers dr ON d.driver_id = dr.id;

-- Create email_queue table for async email processing
CREATE TABLE IF NOT EXISTS public.email_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipient TEXT NOT NULL,
  subject TEXT NOT NULL,
  html_body TEXT NOT NULL,
  reply_to TEXT DEFAULT 'noreply@transporteslabe.cl',
  status TEXT DEFAULT 'pending', -- 'pending', 'sent', 'failed'
  error_message TEXT,
  sent_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create index for querying pending emails
CREATE INDEX IF NOT EXISTS idx_email_queue_status ON public.email_queue(status);
CREATE INDEX IF NOT EXISTS idx_email_queue_created_at ON public.email_queue(created_at DESC);
