-- Script para crear el bucket y tabla en Supabase
-- Ejecutar en la consola SQL de Supabase

-- 1. Crear la tabla driver_documents
CREATE TABLE IF NOT EXISTS driver_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  driver_id TEXT NOT NULL,
  document_type VARCHAR(255) NOT NULL,
  file_name VARCHAR(255) NOT NULL,
  file_url TEXT NOT NULL,
  status VARCHAR(50) DEFAULT 'pendiente',
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 2. Crear índices para mejor rendimiento
CREATE INDEX IF NOT EXISTS idx_driver_documents_driver_id ON driver_documents(driver_id);
CREATE INDEX IF NOT EXISTS idx_driver_documents_status ON driver_documents(status);

-- 3. Habilitar RLS
ALTER TABLE driver_documents ENABLE ROW LEVEL SECURITY;

-- 4. Crear política para lectura pública
CREATE POLICY "driver_documents_read_public" ON driver_documents
  FOR SELECT
  USING (true);

-- 5. Crear política para inserts (requiere service role)
CREATE POLICY "driver_documents_insert_service" ON driver_documents
  FOR INSERT
  WITH CHECK (true);

-- 6. Crear política para updates
CREATE POLICY "driver_documents_update_service" ON driver_documents
  FOR UPDATE
  USING (true)
  WITH CHECK (true);

GRANT ALL ON driver_documents TO authenticated, anon;

-- Verificar que se creó correctamente
SELECT * FROM driver_documents LIMIT 1;
