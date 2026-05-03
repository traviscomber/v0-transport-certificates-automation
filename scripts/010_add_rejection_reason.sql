-- Migration: Add rejection_reason field to uploaded_documents table
-- This field stores the reason why a document was rejected during validation

ALTER TABLE public.uploaded_documents
ADD COLUMN IF NOT EXISTS rejection_reason TEXT;

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_uploaded_documents_rejection_reason 
ON public.uploaded_documents(rejection_reason) 
WHERE validation_status = 'rejected';

-- Add comment to document the field
COMMENT ON COLUMN public.uploaded_documents.rejection_reason IS 'Reason provided when document is rejected by validator';
