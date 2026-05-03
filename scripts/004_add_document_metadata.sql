-- Add document metadata columns to documents table
ALTER TABLE documents 
ADD COLUMN IF NOT EXISTS document_type_id VARCHAR(255),
ADD COLUMN IF NOT EXISTS document_number VARCHAR(255),
ADD COLUMN IF NOT EXISTS issue_date DATE,
ADD COLUMN IF NOT EXISTS expiry_date DATE,
ADD COLUMN IF NOT EXISTS provider VARCHAR(255),
ADD COLUMN IF NOT EXISTS notes TEXT,
ADD COLUMN IF NOT EXISTS category VARCHAR(50),
ADD COLUMN IF NOT EXISTS tags TEXT[],
ADD COLUMN IF NOT EXISTS is_required BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS upload_sequence INTEGER;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_documents_type_id ON documents(document_type_id);
CREATE INDEX IF NOT EXISTS idx_documents_expiry_date ON documents(expiry_date);
CREATE INDEX IF NOT EXISTS idx_documents_category ON documents(category);
