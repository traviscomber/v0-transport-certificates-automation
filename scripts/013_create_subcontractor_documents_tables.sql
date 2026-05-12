-- Create subcontractor document types table
CREATE TABLE IF NOT EXISTS subcontractor_document_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(50) NOT NULL UNIQUE,
  nombre VARCHAR(255) NOT NULL,
  descripcion TEXT,
  periodicidad VARCHAR(50) DEFAULT 'Mensual',
  es_obligatorio BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create subcontractor documents table
CREATE TABLE IF NOT EXISTS subcontractor_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subcontractor_id UUID NOT NULL REFERENCES transportistas(id) ON DELETE CASCADE,
  subcontractor_rut VARCHAR(20) NOT NULL,
  document_type_id UUID NOT NULL REFERENCES subcontractor_document_types(id),
  file_url VARCHAR(500),
  file_name VARCHAR(255),
  status VARCHAR(20) DEFAULT 'pending',
  rejection_reason TEXT,
  uploaded_at TIMESTAMP,
  approved_at TIMESTAMP,
  expires_at TIMESTAMP,
  reviewed_by_ejecutiva VARCHAR(255),
  reviewed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create alerts table
CREATE TABLE IF NOT EXISTS subcontractor_document_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subcontractor_id UUID NOT NULL REFERENCES transportistas(id) ON DELETE CASCADE,
  document_id UUID REFERENCES subcontractor_documents(id) ON DELETE CASCADE,
  alert_type VARCHAR(50),
  message TEXT,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW(),
  dismissed_at TIMESTAMP
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_subcontractor_documents_subcontractor_id ON subcontractor_documents(subcontractor_id);
CREATE INDEX IF NOT EXISTS idx_subcontractor_documents_status ON subcontractor_documents(status);
CREATE INDEX IF NOT EXISTS idx_subcontractor_documents_expires_at ON subcontractor_documents(expires_at);
CREATE INDEX IF NOT EXISTS idx_subcontractor_document_alerts_subcontractor_id ON subcontractor_document_alerts(subcontractor_id);
CREATE INDEX IF NOT EXISTS idx_subcontractor_document_alerts_is_read ON subcontractor_document_alerts(is_read);

-- Insert default document types for subcontractors
INSERT INTO subcontractor_document_types (code, nombre, descripcion, periodicidad, es_obligatorio)
VALUES
  ('AFP', 'Aporte Fondo de Pensiones', 'Comprobante de afiliación a AFP', 'Mensual', true),
  ('SALUD', 'Sistema de Salud', 'Comprobante de afiliación a sistema de salud', 'Mensual', true),
  ('MUTUAL', 'Mutual', 'Certificado de afiliación a mutual', 'Anual', true),
  ('F23', 'Formulario F-23', 'Declaración de retenciones de impuestos', 'Mensual', true),
  ('F30', 'Declaración de Ventas', 'Declaración mensual de ventas y servicios', 'Mensual', true),
  ('LICENCIA', 'Licencia de Conducir', 'Fotocopia licencia de conducir vigente', 'Anual', true),
  ('CEDULA', 'Cédula de Identidad', 'Fotocopia cédula de identidad al día', 'Anual', true),
  ('CERTIFICADO_ANTECEDENTES', 'Certificado de Antecedentes', 'Certificado de antecedentes penales', 'Anual', true)
ON CONFLICT (code) DO NOTHING;
