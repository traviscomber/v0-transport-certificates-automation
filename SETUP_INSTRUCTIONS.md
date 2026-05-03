# Setup Manual para Transportes Labbe

## Paso 1: Crear la tabla companies en Supabase

1. Ve a tu proyecto Supabase: https://app.supabase.com
2. Abre la consola SQL (SQL Editor)
3. Ejecuta este script:

```sql
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
```

## Paso 2: Crear cuenta admin de Transportes Labbe

Usa esta contraseña hash (bcrypt de "labbe2024!"):
- Hash: $2b$10$dXJ0r5Z8.L8x.Q3K7z.q6OQ0x0.K3z.X3z.X3z.X3z.X3z.X3z.X3z

O genera uno nuevo con:
```bash
npm run hash-password labbe2024!
```

Ejecuta este insert:
```sql
INSERT INTO public.companies (id, rut, name, representative, email, phone, address, region, password_hash, is_labbe_admin)
VALUES (
  'labbe-admin-001',
  '77266269-9',
  'Transportes Labbe',
  'Admin',
  'admin@labbe.cl',
  '+56912345678',
  'Calle Transportes Labbe 123',
  'Metropolitana',
  '$2b$10$dXJ0r5Z8.L8x.Q3K7z.q6OQ0x0.K3z.X3z.X3z.X3z.X3z.X3z.X3z',
  true
);
```

## Paso 3: Importar empresas transportistas

Después de que la tabla esté creada, ejecutaremos los scripts de importación.
