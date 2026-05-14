-- Add approval tracking columns to uploaded_documents table
-- Track who approved/rejected each document and when

ALTER TABLE uploaded_documents
ADD COLUMN IF NOT EXISTS approved_by UUID,
ADD COLUMN IF NOT EXISTS approved_by_email VARCHAR(255),
ADD COLUMN IF NOT EXISTS approved_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS rejected_by UUID,
ADD COLUMN IF NOT EXISTS rejected_by_email VARCHAR(255),
ADD COLUMN IF NOT EXISTS rejected_at TIMESTAMP WITH TIME ZONE;

-- Create indexes for approval tracking
CREATE INDEX IF NOT EXISTS idx_uploaded_documents_approved_by ON uploaded_documents(approved_by);
CREATE INDEX IF NOT EXISTS idx_uploaded_documents_rejected_by ON uploaded_documents(rejected_by);
CREATE INDEX IF NOT EXISTS idx_uploaded_documents_approved_at ON uploaded_documents(approved_at);
CREATE INDEX IF NOT EXISTS idx_uploaded_documents_rejected_at ON uploaded_documents(rejected_at);

-- Add similar columns to subcontractor_documents table if it exists
ALTER TABLE IF EXISTS subcontractor_documents
ADD COLUMN IF NOT EXISTS approved_by UUID,
ADD COLUMN IF NOT EXISTS approved_by_email VARCHAR(255),
ADD COLUMN IF NOT EXISTS approved_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS rejected_by UUID,
ADD COLUMN IF NOT EXISTS rejected_by_email VARCHAR(255),
ADD COLUMN IF NOT EXISTS rejected_at TIMESTAMP WITH TIME ZONE;

-- Create indexes for subcontractor documents approval tracking
CREATE INDEX IF NOT EXISTS idx_subcontractor_documents_approved_by ON subcontractor_documents(approved_by);
CREATE INDEX IF NOT EXISTS idx_subcontractor_documents_rejected_by ON subcontractor_documents(rejected_by);
CREATE INDEX IF NOT EXISTS idx_subcontractor_documents_approved_at ON subcontractor_documents(approved_at);
CREATE INDEX IF NOT EXISTS idx_subcontractor_documents_rejected_at ON subcontractor_documents(rejected_at);

-- Add comments for documentation
COMMENT ON COLUMN uploaded_documents.approved_by IS 'UUID of the user (executive) who approved the document';
COMMENT ON COLUMN uploaded_documents.approved_by_email IS 'Email of the user who approved the document';
COMMENT ON COLUMN uploaded_documents.approved_at IS 'Timestamp when document was approved';
COMMENT ON COLUMN uploaded_documents.rejected_by IS 'UUID of the user (executive) who rejected the document';
COMMENT ON COLUMN uploaded_documents.rejected_by_email IS 'Email of the user who rejected the document';
COMMENT ON COLUMN uploaded_documents.rejected_at IS 'Timestamp when document was rejected';
