-- Migration: Add AI-extracted document metadata columns
-- This adds columns to store AI-extracted data for documents

ALTER TABLE public.uploaded_documents
ADD COLUMN IF NOT EXISTS extracted_document_type VARCHAR(255),
ADD COLUMN IF NOT EXISTS extracted_expiration_date DATE,
ADD COLUMN IF NOT EXISTS extraction_confidence DECIMAL(3,2),
ADD COLUMN IF NOT EXISTS extraction_warnings JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS ai_processing_status VARCHAR(50) DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS ai_processed_at TIMESTAMP WITH TIME ZONE;

-- Add index for faster queries on AI-extracted fields
CREATE INDEX IF NOT EXISTS idx_uploaded_documents_extraction_confidence 
ON public.uploaded_documents(extraction_confidence DESC);

CREATE INDEX IF NOT EXISTS idx_uploaded_documents_ai_processing_status 
ON public.uploaded_documents(ai_processing_status);

-- Add trigger to update ai_processed_at timestamp
CREATE OR REPLACE FUNCTION update_ai_processed_at()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.extraction_confidence IS NOT NULL THEN
    NEW.ai_processed_at = NOW();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_ai_processed_at ON public.uploaded_documents;

CREATE TRIGGER trigger_update_ai_processed_at
BEFORE UPDATE ON public.uploaded_documents
FOR EACH ROW
WHEN (NEW.extraction_confidence IS DISTINCT FROM OLD.extraction_confidence)
EXECUTE FUNCTION update_ai_processed_at();

-- Add comment for documentation
COMMENT ON COLUMN public.uploaded_documents.extracted_document_type IS 'Document type extracted by AI (e.g., Licencia de Conducir)';
COMMENT ON COLUMN public.uploaded_documents.extracted_expiration_date IS 'Expiration date extracted by AI from document';
COMMENT ON COLUMN public.uploaded_documents.extraction_confidence IS 'Confidence score of AI extraction (0-1)';
COMMENT ON COLUMN public.uploaded_documents.extraction_warnings IS 'Array of warnings from AI extraction';
COMMENT ON COLUMN public.uploaded_documents.ai_processing_status IS 'Status of AI processing (pending, completed, failed)';
COMMENT ON COLUMN public.uploaded_documents.ai_processed_at IS 'Timestamp when AI processing was completed';
