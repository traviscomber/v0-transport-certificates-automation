-- Create monthly_documents table for tracking required monthly documents
CREATE TABLE IF NOT EXISTS monthly_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  driver_id TEXT NOT NULL,
  document_type TEXT NOT NULL,
  month_year DATE NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'uploaded', 'verified', 'expired')),
  provider TEXT NOT NULL,
  file_url TEXT,
  file_name TEXT,
  uploaded_at TIMESTAMP WITH TIME ZONE,
  expiry_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(driver_id, document_type, month_year, provider)
);

-- Create monthly_documents_audit table for compliance tracking
CREATE TABLE IF NOT EXISTS monthly_documents_audit (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  monthly_document_id UUID REFERENCES monthly_documents(id),
  action TEXT NOT NULL,
  changed_by TEXT,
  previous_status TEXT,
  new_status TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indices for better query performance
CREATE INDEX IF NOT EXISTS idx_monthly_documents_driver_id ON monthly_documents(driver_id);
CREATE INDEX IF NOT EXISTS idx_monthly_documents_month_year ON monthly_documents(month_year);
CREATE INDEX IF NOT EXISTS idx_monthly_documents_status ON monthly_documents(status);
CREATE INDEX IF NOT EXISTS idx_monthly_documents_provider ON monthly_documents(provider);
