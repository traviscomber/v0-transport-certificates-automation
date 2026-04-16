# Configuración de Documentos de Conductores

## Pasos para completar la configuración:

### 1. Crear la tabla `driver_documents` en Supabase

1. Ve a tu proyecto en [Supabase Dashboard](https://supabase.com/dashboard)
2. Abre el **SQL Editor**
3. Copia y pega el contenido de `scripts/create-driver-documents-table.sql`
4. Ejecuta la consulta

O simplemente ejecuta este SQL en la consola de Supabase:

```sql
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

ALTER TABLE driver_documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read" ON driver_documents
  FOR SELECT USING (true);

CREATE POLICY "Allow insert" ON driver_documents
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow update status" ON driver_documents
  FOR UPDATE USING (true) WITH CHECK (true);
```

### 2. Crear el bucket de Storage `driver-documents`

1. Ve a **Storage** en Supabase
2. Haz clic en **+ New bucket**
3. Nombre: `driver-documents`
4. Configura como **Public bucket**
5. En **Allowed MIME types**, agrega:
   - image/jpeg
   - image/png
   - image/webp
   - application/pdf

### 3. Configurar políticas de acceso del bucket

En la sección de **Policies** del bucket `driver-documents`, asegúrate que permita:
- **SELECT** (público)
- **INSERT** (autenticado)

### 4. Verificar variables de entorno

Asegúrate que estas variables estén configuradas:
```
NEXT_PUBLIC_SUPABASE_URL=tu-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-anon-key
SUPABASE_SERVICE_ROLE_KEY=tu-service-role-key
```

## Funcionamiento

1. El usuario selecciona un archivo (foto, PDF, etc.)
2. El archivo se sube a Supabase Storage
3. Se registra en la tabla `driver_documents` con la URL pública
4. El documento aparece en la tarjeta del conductor

## Troubleshooting

**Si ves "Error al subir documento":**

1. Abre **DevTools** (F12) → **Console**
2. Mira los logs con `[v0]` para ver el error específico
3. Verifica que:
   - La tabla `driver_documents` existe
   - El bucket `driver-documents` existe y es público
   - Los permisos de RLS están configurados correctamente
