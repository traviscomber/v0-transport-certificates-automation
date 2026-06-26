-- Create reminder_logs table for tracking automated reminders sent to subcontractors
CREATE TABLE IF NOT EXISTS public.reminder_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  subcontractor_id UUID NOT NULL REFERENCES public.subcontratistas(id) ON DELETE CASCADE,
  phone TEXT NOT NULL,
  pending_count INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL CHECK (status IN ('sent', 'failed', 'pending')) DEFAULT 'pending',
  error_message TEXT,
  sent_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_reminder_logs_subcontractor_id 
  ON public.reminder_logs(subcontractor_id);

CREATE INDEX IF NOT EXISTS idx_reminder_logs_sent_at 
  ON public.reminder_logs(sent_at DESC);

CREATE INDEX IF NOT EXISTS idx_reminder_logs_status 
  ON public.reminder_logs(status);

-- Add RLS policy
ALTER TABLE public.reminder_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow authenticated users to read reminder logs"
  ON public.reminder_logs
  FOR SELECT
  TO authenticated
  USING (true);

-- Comment
COMMENT ON TABLE public.reminder_logs IS 'Audit trail for automated reminders sent to subcontractors about pending documents';
