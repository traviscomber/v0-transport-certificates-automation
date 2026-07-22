-- Add document period fields to documents table
-- This migration adds support for document validity periods and approval tracking

-- Add columns to documents table
ALTER TABLE public.documents
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'expired')),
ADD COLUMN IF NOT EXISTS approval_date TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS approved_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS rejection_reason TEXT,
ADD COLUMN IF NOT EXISTS validity_start_date DATE,
ADD COLUMN IF NOT EXISTS validity_end_date DATE,
ADD COLUMN IF NOT EXISTS period_years INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS approved_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS expires_at TIMESTAMP WITH TIME ZONE;

-- Create index for status queries
CREATE INDEX IF NOT EXISTS idx_documents_status ON public.documents(status);

-- Create index for approval_date queries
CREATE INDEX IF NOT EXISTS idx_documents_approval_date ON public.documents(approval_date);

-- Create index for expiry tracking
CREATE INDEX IF NOT EXISTS idx_documents_expires_at ON public.documents(expires_at);

-- Create index for active documents
CREATE INDEX IF NOT EXISTS idx_documents_is_active ON public.documents(is_active);

-- Add comment to documents table for documentation
COMMENT ON COLUMN public.documents.status IS 'Document approval status: pending, approved, rejected, or expired';
COMMENT ON COLUMN public.documents.approval_date IS 'Date when document was approved';
COMMENT ON COLUMN public.documents.approved_by IS 'User ID who approved the document';
COMMENT ON COLUMN public.documents.validity_start_date IS 'Start date of document validity period';
COMMENT ON COLUMN public.documents.validity_end_date IS 'End date of document validity period';
COMMENT ON COLUMN public.documents.period_years IS 'Document validity period in years';
COMMENT ON COLUMN public.documents.is_active IS 'Whether document is currently active';
COMMENT ON COLUMN public.documents.approved_at IS 'Timestamp when document was approved';
COMMENT ON COLUMN public.documents.expires_at IS 'Timestamp when document expires';
