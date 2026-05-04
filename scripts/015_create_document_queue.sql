-- Create document_queue table for managing document review workflow
-- This table tracks documents pending review and assignment to executives

CREATE TABLE IF NOT EXISTS public.document_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Reference to the certificate/document to be reviewed
  document_id UUID NOT NULL REFERENCES public.certificates(id) ON DELETE CASCADE,
  
  -- Executive assigned to review (NULL = unassigned)
  assigned_to UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  
  -- Priority for review
  priority TEXT NOT NULL DEFAULT 'medium' 
    CHECK (priority IN ('high', 'medium', 'low')),
  
  -- Current position in queue
  queue_position INTEGER,
  
  -- Status of queue item
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'in_review', 'completed', 'rejected')),
  
  -- Company for tracking and filtering
  company_name TEXT NOT NULL,
  
  -- Document type (certificate_name, etc.)
  document_type TEXT,
  
  -- Related to driver/conductor
  driver_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  
  -- Related to company/transporter
  company_id TEXT,
  
  -- Expiry date for prioritization (from certificate data)
  document_expiry_date DATE,
  
  -- Days until expiry (for sorting)
  days_until_expiry INTEGER,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  assigned_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  
  -- Notes about the queue item
  notes TEXT
);

-- Enable RLS
ALTER TABLE public.document_queue ENABLE ROW LEVEL SECURITY;

-- RLS Policies for document_queue

-- Executives can view unassigned documents and documents assigned to them
CREATE POLICY "Executives can view their queue documents" ON public.document_queue
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() 
      AND p.role = 'executive'
      AND p.company_name = public.document_queue.company_name
      AND (
        public.document_queue.assigned_to = auth.uid() OR 
        public.document_queue.assigned_to IS NULL
      )
    )
  );

-- Executives can self-assign documents
CREATE POLICY "Executives can self-assign documents" ON public.document_queue
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() 
      AND p.role = 'executive'
      AND p.company_name = public.document_queue.company_name
    ) AND
    (assigned_to = auth.uid() OR assigned_to IS NULL)
  );

-- Admins can view all queue items
CREATE POLICY "Admins can view all queue items" ON public.document_queue
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Admins can update all queue items
CREATE POLICY "Admins can update all queue items" ON public.document_queue
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_document_queue_document_id ON public.document_queue(document_id);
CREATE INDEX IF NOT EXISTS idx_document_queue_assigned_to ON public.document_queue(assigned_to);
CREATE INDEX IF NOT EXISTS idx_document_queue_status ON public.document_queue(status);
CREATE INDEX IF NOT EXISTS idx_document_queue_priority ON public.document_queue(priority);
CREATE INDEX IF NOT EXISTS idx_document_queue_company ON public.document_queue(company_name);
CREATE INDEX IF NOT EXISTS idx_document_queue_created_at ON public.document_queue(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_document_queue_days_expiry ON public.document_queue(days_until_expiry);
CREATE INDEX IF NOT EXISTS idx_document_queue_company_status ON public.document_queue(company_name, status);
