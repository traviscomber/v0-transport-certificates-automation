## Manual Setup: Subcontractor Login System

### Problema
El endpoint de setup automático aún no está disponible en producción porque Vercel tiene un error de compilación.

### Solución: 3 Pasos Manuales

#### Paso 1: Crear la tabla `transportista_auth` en Supabase

1. Abre https://app.supabase.com
2. Ve a tu proyecto
3. Haz click en "SQL Editor" en el menú izquierdo
4. Copia y pega este SQL:

```sql
-- Create transportista_auth table
CREATE TABLE IF NOT EXISTS transportista_auth (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  rut VARCHAR(12) UNIQUE NOT NULL,
  transportista_id UUID REFERENCES transportistas(id) ON DELETE CASCADE,
  password_hash VARCHAR(255) NOT NULL,
  is_active BOOLEAN DEFAULT true,
  last_login TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_transportista_auth_rut ON transportista_auth(rut);
CREATE INDEX IF NOT EXISTS idx_transportista_auth_transportista_id ON transportista_auth(transportista_id);

-- Enable Row Level Security
ALTER TABLE transportista_auth ENABLE ROW LEVEL SECURITY;

-- Create RLS policy: Users can only see their own record
CREATE POLICY "Users can view their own auth record" ON transportista_auth
  FOR SELECT USING (auth.uid()::text = transportista_id::text);
```

5. Haz click en "Run" (triángulo azul)
6. Espera a que termine ✓

#### Paso 2: Generar contraseñas para todos los subcontratistas

Ejecuta este SQL en el mismo SQL Editor después de crear la tabla:

```sql
-- Generate passwords for all transportistas
INSERT INTO transportista_auth (rut, transportista_id, password_hash)
SELECT 
  t.rut,
  t.id,
  crypt('labbe' || substring(t.rut from '.{4}$'), gen_salt('bf'))
FROM transportistas t
WHERE t.is_active = true
  AND NOT EXISTS (
    SELECT 1 FROM transportista_auth ta WHERE ta.transportista_id = t.id
  )
ON CONFLICT (rut) DO NOTHING;
```

#### Paso 3: Prueba el login

1. Abre https://cleaner2.vercel.app/subcontractors/login
2. Usa el RUT de cualquier subcontratista (ej: `77653971-9`)
3. Contraseña: `labbe` + últimos 4 dígitos del RUT (ej: `labbe3971`)
4. Haz click en "Iniciar Sesión"

### Lista de Contraseñas de Prueba

| Empresa | RUT | Contraseña |
|---------|-----|-----------|
| 4Vial SPA | 77653071-9 | labbe3071 |
| Adolfo Del Carmen Gonzalez Meza | (ver en Supabase) | labbe + últimos 4 |
| ... | ... | ... |

### Solución si la contraseña no funciona

Si la contraseña no funciona después de hacer login:

1. Verifica que la tabla se creó correctamente: Ve a Supabase → Tables y busca `transportista_auth`
2. Verifica que se generaron registros: Ejecuta este SQL:
   ```sql
   SELECT COUNT(*) FROM transportista_auth;
   ```
3. Si no hay registros, ejecuta el SQL de Paso 2

### ¿Qué sucede después?

Una vez que el login funcione:
- Subcontratistas pueden entrar a `/subcontractors/dashboard`
- Suben documentos con tipo y archivo
- Ejecutivas ven alertas en `/dashboard/company`
- Todo automático y centralizado

### Endpoints Disponibles

- `/subcontractors/login` - Página de login
- `/subcontractors/dashboard` - Dashboard de subcontratista (protegido)
- `/api/auth/subcontractors/login` - POST login
- `/api/auth/subcontractors/logout` - POST logout
- `/api/auth/subcontractors/profile` - GET perfil
- `/api/subcontractors/[id]/documents` - GET/POST documentos
- `/api/subcontractor-document-types` - GET tipos requeridos

### Soporte

Si hay problemas, verifica:
1. La tabla existe en Supabase
2. Hay registros en `transportista_auth`
3. Los RUT en el login tienen puntos y guión (ej: `77.653.071-9`)
