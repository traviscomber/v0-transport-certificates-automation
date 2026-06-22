-- Create subcontractor document types table
CREATE TABLE IF NOT EXISTS subcontractor_document_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(50) NOT NULL UNIQUE,
  nombre VARCHAR(255) NOT NULL,
  descripcion TEXT,
  periodicidad VARCHAR(50) DEFAULT 'Mensual', -- Mensual, Trimestral, Anual, etc.
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
  status VARCHAR(20) DEFAULT 'pending', -- pending, uploaded, approved, rejected, expired
  rejection_reason TEXT,
  uploaded_at TIMESTAMP,
  approved_at TIMESTAMP,
  expires_at TIMESTAMP,
  reviewed_by_ejecutiva VARCHAR(255),
  reviewed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create alerts table for document expiry
CREATE TABLE IF NOT EXISTS subcontractor_document_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subcontractor_id UUID NOT NULL REFERENCES transportistas(id) ON DELETE CASCADE,
  document_id UUID REFERENCES subcontractor_documents(id) ON DELETE CASCADE,
  alert_type VARCHAR(50), -- 'expiring_soon', 'expired', 'missing', 'rejected'
  message TEXT,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW(),
  dismissed_at TIMESTAMP
);

-- Indexes for performance
CREATE INDEX idx_subcontractor_documents_subcontractor_id ON subcontractor_documents(subcontractor_id);
CREATE INDEX idx_subcontractor_documents_status ON subcontractor_documents(status);
CREATE INDEX idx_subcontractor_documents_expires_at ON subcontractor_documents(expires_at);
CREATE INDEX idx_subcontractor_document_alerts_subcontractor_id ON subcontractor_document_alerts(subcontractor_id);
CREATE INDEX idx_subcontractor_document_alerts_is_read ON subcontractor_document_alerts(is_read);

-- Insert document types (from the provided table)
INSERT INTO subcontractor_document_types (code, nombre, descripcion, periodicidad, es_obligatorio) VALUES
  ('PLANILLAS_IMPOSICIONES', 'Planillas de Imposiciones', 'Planillas mensuales de imposiciones de los trabajadores', 'Mensual', true),
  ('PENSION', 'Pensión', 'Comprobantes de pensión y/o jubilación', 'Mensual', true),
  ('CERT_COTIZACIONES', 'Certificado de cotizaciones individual', 'Certificado de cotizaciones por trabajador', 'Mensual', true),
  ('F23', 'Formulario F23', 'Formulario de declaración de impuestos F23', 'Mensual', true),
  ('F30', 'Formulario F30', 'Formulario F30 sin multas', 'Mensual', true),
  ('F30_DOÑA_ISIDORA', 'Formulario F30-1 Doña Isidora', 'F30-1 Doña Isidora', 'Mensual', true),
  ('F30_EMITIDO_CLIENTE', 'Formulario F30-1 emitido a cliente', 'F30-1 emitido al cliente', 'Mensual', true),
  ('LIQUIDACION_SUELDO', 'Liquidación de Sueldo', 'Liquidación de sueldo de trabajadores', 'Mensual', true),
  ('COMPROBANTE_PAGO', 'Comprobante de pago liquidación', 'Comprobante de pago de la liquidación de sueldo', 'Mensual', true),
  ('CERT_AFIL_MUTUAL', 'Certificado Afiliación Mutual', 'Certificado de afiliación a Mutual actualizado', 'Mensual', true),
  ('CERT_TASAS_MUTUAL', 'Certificado Tasas Mutual', 'Certificado de tasas de Mutual', 'Mensual', true),
  ('CERT_ANTECEDENTES', 'Certificado Antecedentes', 'Certificado de antecedentes actualizados', 'Mensual', true),
  ('HOJA_VIDA', 'Hoja de vida', 'Hoja de vida por cada conductor de la empresa', 'Mensual', true),
  ('FOTO_PATENTES', 'Foto estado patentes', 'Fotografía de patentes en buen estado', 'Mensual', true)
ON CONFLICT (code) DO NOTHING;

-- Enable RLS if needed
ALTER TABLE subcontractor_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE subcontractor_document_alerts ENABLE ROW LEVEL SECURITY;
