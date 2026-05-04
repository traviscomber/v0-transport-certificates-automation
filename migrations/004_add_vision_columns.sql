-- Add vision scanning columns to uploaded_documents table
ALTER TABLE uploaded_documents
ADD COLUMN IF NOT EXISTS vision_status VARCHAR(20) DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS document_type VARCHAR(100),
ADD COLUMN IF NOT EXISTS extracted_data JSONB,
ADD COLUMN IF NOT EXISTS validation_result JSONB,
ADD COLUMN IF NOT EXISTS anomalies_detected TEXT[],
ADD COLUMN IF NOT EXISTS ocr_text TEXT,
ADD COLUMN IF NOT EXISTS vision_error TEXT,
ADD COLUMN IF NOT EXISTS vision_processed_at TIMESTAMP;

-- Create index for faster filtering by vision_status
CREATE INDEX IF NOT EXISTS idx_uploaded_documents_vision_status 
ON uploaded_documents(vision_status);

-- Create index for documents pending vision processing
CREATE INDEX IF NOT EXISTS idx_uploaded_documents_vision_pending 
ON uploaded_documents(id) 
WHERE vision_status = 'pending';

-- Add comments to new columns
COMMENT ON COLUMN uploaded_documents.vision_status IS 'Status of vision processing: pending, processing, completed, error';
COMMENT ON COLUMN uploaded_documents.document_type IS 'Classified document type (cédula, licencia, contrato, etc.)';
COMMENT ON COLUMN uploaded_documents.extracted_data IS 'JSON with extracted information from document';
COMMENT ON COLUMN uploaded_documents.validation_result IS 'JSON with validation checks results';
COMMENT ON COLUMN uploaded_documents.anomalies_detected IS 'Array of detected anomalies or fraud indicators';
COMMENT ON COLUMN uploaded_documents.ocr_text IS 'Extracted text from document via OCR';
COMMENT ON COLUMN uploaded_documents.vision_error IS 'Error message if vision processing failed';
COMMENT ON COLUMN uploaded_documents.vision_processed_at IS 'Timestamp when vision processing completed';

SELECT 'Vision columns migration completed' as status;
