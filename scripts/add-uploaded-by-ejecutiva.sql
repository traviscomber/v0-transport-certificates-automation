-- Add uploaded_by_ejecutiva column to track who uploaded the document
ALTER TABLE subcontractor_documents 
ADD COLUMN IF NOT EXISTS uploaded_by_ejecutiva VARCHAR(255);

-- Add index for faster filtering
CREATE INDEX IF NOT EXISTS idx_subcontractor_documents_uploaded_by_ejecutiva 
ON subcontractor_documents(uploaded_by_ejecutiva);

-- Update existing records to use the email from the filename if available
UPDATE subcontractor_documents 
SET uploaded_by_ejecutiva = CASE 
  WHEN file_name LIKE '%@%' THEN 
    SUBSTRING_INDEX(file_name, '@', 1) || '@' || 
    SUBSTRING_INDEX(SUBSTRING_INDEX(file_name, '.', 1), '-', -1)
  ELSE NULL
END
WHERE uploaded_by_ejecutiva IS NULL AND file_name LIKE '%@%';
