-- Crear tabla companies para empresas transportistas
CREATE TABLE IF NOT EXISTS companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rut TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  representative TEXT,
  email TEXT,
  phone TEXT,
  address TEXT,
  region TEXT,
  password_hash TEXT NOT NULL,
  is_labbe_admin BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Crear índice en RUT para búsquedas rápidas
CREATE INDEX IF NOT EXISTS idx_companies_rut ON companies(rut);

-- Habilitar RLS
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;

-- Policy: Labbe (admin) puede ver todas las empresas
CREATE POLICY "Labbe can view all companies" ON companies
  FOR SELECT
  USING (auth.jwt() ->> 'is_labbe_admin' = 'true');

-- Policy: Empresas pueden ver solo su propia información
CREATE POLICY "Companies can view themselves" ON companies
  FOR SELECT
  USING (id = auth.user_id());

-- Policy: Solo Labbe puede insertar nuevas empresas
CREATE POLICY "Only Labbe can insert companies" ON companies
  FOR INSERT
  WITH CHECK (auth.jwt() ->> 'is_labbe_admin' = 'true');

-- Policy: Solo Labbe puede actualizar empresas
CREATE POLICY "Only Labbe can update companies" ON companies
  FOR UPDATE
  USING (auth.jwt() ->> 'is_labbe_admin' = 'true');
