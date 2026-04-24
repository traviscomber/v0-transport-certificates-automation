-- Create conductor_uploaded_documents table if it doesn't exist
CREATE TABLE IF NOT EXISTS conductor_uploaded_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  driver_id TEXT NOT NULL,
  document_type TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_url TEXT,
  file_size INTEGER,
  mime_type TEXT,
  status TEXT DEFAULT 'pending',
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_conductor_documents_driver_id ON conductor_uploaded_documents(driver_id);
CREATE INDEX IF NOT EXISTS idx_conductor_documents_status ON conductor_uploaded_documents(status);
CREATE INDEX IF NOT EXISTS idx_conductor_documents_created_at ON conductor_uploaded_documents(created_at);

-- Enable Row Level Security
ALTER TABLE conductor_uploaded_documents ENABLE ROW LEVEL SECURITY;

-- Allow all access (RLS policies)
CREATE POLICY IF NOT EXISTS "conductor_documents_select" ON conductor_uploaded_documents
  FOR SELECT USING (true);

CREATE POLICY IF NOT EXISTS "conductor_documents_insert" ON conductor_uploaded_documents
  FOR INSERT WITH CHECK (true);

CREATE POLICY IF NOT EXISTS "conductor_documents_update" ON conductor_uploaded_documents
  FOR UPDATE USING (true) WITH CHECK (true);

GRANT ALL ON conductor_uploaded_documents TO authenticated, anon;
