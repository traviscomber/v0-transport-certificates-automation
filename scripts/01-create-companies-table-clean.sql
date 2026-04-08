CREATE TABLE IF NOT EXISTS public.companies (
  id TEXT PRIMARY KEY,
  rut TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  representative TEXT,
  email TEXT,
  phone TEXT,
  address TEXT,
  region TEXT,
  password_hash TEXT NOT NULL,
  is_labbe_admin BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_companies_rut ON public.companies(rut);
CREATE INDEX IF NOT EXISTS idx_companies_email ON public.companies(email);
CREATE INDEX IF NOT EXISTS idx_companies_labbe_admin ON public.companies(is_labbe_admin);
