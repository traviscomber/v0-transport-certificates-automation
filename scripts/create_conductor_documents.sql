-- Tabla simple para documentos subidos por conductores
CREATE TABLE IF NOT EXISTS public.conductor_uploaded_documents (
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

-- Índices
CREATE INDEX IF NOT EXISTS idx_conductor_documents_driver_id ON public.conductor_uploaded_documents(driver_id);
CREATE INDEX IF NOT EXISTS idx_conductor_documents_status ON public.conductor_uploaded_documents(status);
CREATE INDEX IF NOT EXISTS idx_conductor_documents_created_at ON public.conductor_uploaded_documents(created_at);

-- Habilitar RLS
ALTER TABLE public.conductor_uploaded_documents ENABLE ROW LEVEL SECURITY;

-- Políticas de acceso
DROP POLICY IF EXISTS "conductor_documents_select" ON public.conductor_uploaded_documents;
DROP POLICY IF EXISTS "conductor_documents_insert" ON public.conductor_uploaded_documents;
DROP POLICY IF EXISTS "conductor_documents_update" ON public.conductor_uploaded_documents;

CREATE POLICY "conductor_documents_select" ON public.conductor_uploaded_documents
  FOR SELECT USING (true);

CREATE POLICY "conductor_documents_insert" ON public.conductor_uploaded_documents
  FOR INSERT WITH CHECK (true);

CREATE POLICY "conductor_documents_update" ON public.conductor_uploaded_documents
  FOR UPDATE USING (true)
  WITH CHECK (true);

-- Permisos
GRANT ALL ON public.conductor_uploaded_documents TO authenticated, anon;
