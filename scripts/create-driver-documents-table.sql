-- Crear tabla de documentos de conductores
CREATE TABLE IF NOT EXISTS driver_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  driver_id TEXT NOT NULL,
  document_type TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  status TEXT DEFAULT 'pendiente' CHECK (status IN ('pendiente', 'aprobado', 'rechazado')),
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('UTC', NOW()),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('UTC', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('UTC', NOW())
);

-- Crear índices para mejor rendimiento
CREATE INDEX IF NOT EXISTS idx_driver_documents_driver_id ON driver_documents(driver_id);
CREATE INDEX IF NOT EXISTS idx_driver_documents_status ON driver_documents(status);
CREATE INDEX IF NOT EXISTS idx_driver_documents_uploaded_at ON driver_documents(uploaded_at);

-- Habilitar RLS (Row Level Security)
ALTER TABLE driver_documents ENABLE ROW LEVEL SECURITY;

-- Política para permitir lectura pública
CREATE POLICY "Allow public read" ON driver_documents
  FOR SELECT USING (true);

-- Política para permitir inserción
CREATE POLICY "Allow insert" ON driver_documents
  FOR INSERT WITH CHECK (true);

-- Política para permitir actualización de estado
CREATE POLICY "Allow update status" ON driver_documents
  FOR UPDATE USING (true) WITH CHECK (true);
