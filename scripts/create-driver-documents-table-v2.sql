-- Create driver_documents table
CREATE TABLE IF NOT EXISTS driver_documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  driver_id TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_size BIGINT,
  file_type TEXT,
  document_type TEXT,
  storage_path TEXT,
  public_url TEXT,
  status TEXT DEFAULT 'pendiente',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create index on driver_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_driver_documents_driver_id ON driver_documents(driver_id);

-- Enable RLS
ALTER TABLE driver_documents ENABLE ROW LEVEL SECURITY;

-- Allow public read access
CREATE POLICY "Allow public read" ON driver_documents
  FOR SELECT
  USING (true);

-- Allow admin write access
CREATE POLICY "Allow admin write" ON driver_documents
  FOR INSERT
  WITH CHECK (true);

-- Allow admin update
CREATE POLICY "Allow admin update" ON driver_documents
  FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- Allow admin delete
CREATE POLICY "Allow admin delete" ON driver_documents
  FOR DELETE
  USING (true);
