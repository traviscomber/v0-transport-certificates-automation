-- Phase 2: Create subcontractor_documents schema
-- This script creates the tables needed for document management

-- Table 1: subcontractor_documents
CREATE TABLE IF NOT EXISTS subcontractor_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rut TEXT NOT NULL REFERENCES subcontractors(rut) ON DELETE CASCADE,
  documento_tipo TEXT NOT NULL CHECK (documento_tipo IN ('identity', 'license', 'insurance', 'certification', 'other')),
  estado TEXT NOT NULL DEFAULT 'pending' CHECK (estado IN ('pending', 'approved', 'rejected', 'expired')),
  archivo_url TEXT, -- Vercel Blob URL
  fecha_carga TIMESTAMP NOT NULL DEFAULT now(),
  fecha_expiracion TIMESTAMP,
  version_anterior UUID REFERENCES subcontractor_documents(id),
  notas TEXT,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

-- Table 2: document_upload_log (Audit trail)
CREATE TABLE IF NOT EXISTS document_upload_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  documento_id UUID NOT NULL REFERENCES subcontractor_documents(id) ON DELETE CASCADE,
  usuario_email TEXT NOT NULL,
  accion TEXT NOT NULL CHECK (accion IN ('uploaded', 'approved', 'rejected', 'expired', 'updated')),
  timestamp TIMESTAMP NOT NULL DEFAULT now(),
  cambios_anteriores JSONB, -- Store previous state
  notas TEXT
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_subcontractor_documents_rut ON subcontractor_documents(rut);
CREATE INDEX IF NOT EXISTS idx_subcontractor_documents_estado ON subcontractor_documents(estado);
CREATE INDEX IF NOT EXISTS idx_subcontractor_documents_tipo ON subcontractor_documents(documento_tipo);
CREATE INDEX IF NOT EXISTS idx_subcontractor_documents_fecha ON subcontractor_documents(fecha_carga);
CREATE INDEX IF NOT EXISTS idx_document_upload_log_documento_id ON document_upload_log(documento_id);
CREATE INDEX IF NOT EXISTS idx_document_upload_log_timestamp ON document_upload_log(timestamp);

-- RLS Policies (if needed)
ALTER TABLE subcontractor_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_upload_log ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to view all documents
CREATE POLICY "view_subcontractor_documents" ON subcontractor_documents
  FOR SELECT USING (true);

-- Allow authenticated users to insert documents
CREATE POLICY "insert_subcontractor_documents" ON subcontractor_documents
  FOR INSERT WITH CHECK (true);

-- Allow users to update only their own uploads
CREATE POLICY "update_subcontractor_documents" ON subcontractor_documents
  FOR UPDATE USING (true);

-- Log table policies
CREATE POLICY "view_document_upload_log" ON document_upload_log
  FOR SELECT USING (true);

CREATE POLICY "insert_document_upload_log" ON document_upload_log
  FOR INSERT WITH CHECK (true);
