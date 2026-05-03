# Configuración de Supabase para Documentos de Conductores

## Paso 1: Crear el Bucket de Storage

### Método A: Por la Interfaz (Recomendado)

1. Abre tu proyecto en [supabase.com](https://supabase.com)
2. Haz clic en **"Storage"** en el menú izquierdo
3. Haz clic en **"Create a new bucket"** (botón azul)
4. Completa el formulario:
   - **Name**: `driver-documents`
   - **Public bucket**: ✓ Marca esta opción para que sea público
5. Haz clic en **"Create bucket"**

### Verificar que se creó:
- Deberías ver `driver-documents` en la lista de buckets
- Debería mostrar "Public" al lado del nombre

---

## Paso 2: Crear la Tabla en la Base de Datos

1. En tu proyecto Supabase, haz clic en **"SQL Editor"** (en el menú izquierdo)
2. Haz clic en **"New Query"**
3. Copia y pega el contenido del archivo `/scripts/setup-supabase-documents.sql`
4. Haz clic en **"Run"** (botón azul)

Debería ver un mensaje de éxito.

---

## Paso 3: Configurar Permisos de Storage

1. En **"Storage"**, selecciona el bucket `driver-documents`
2. Haz clic en **"Policies"** (tab superior)
3. Haz clic en **"New policy"** y selecciona **"For SELECT"**
4. Llena:
   - **Editor**: `WITH CHECK`
   - **Condition**: `(bucket_id = 'driver-documents')`
5. Haz clic en **"Review"** → **"Save policy"**

---

## Paso 4: Verificar las Variables de Entorno

Asegúrate de que estas variables estén configuradas en Vercel:
- `NEXT_PUBLIC_SUPABASE_URL` ✓
- `SUPABASE_SERVICE_ROLE_KEY` ✓

Si no las ves, agrega las en Vercel Project Settings → Environment Variables.

---

## Paso 5: Prueba la Aplicación

1. Vuelve a tu aplicación
2. Intenta subir un documento desde la card de un conductor
3. Si ves errores, revisa:
   - La consola del navegador (F12)
   - Los logs de Vercel en el deployment
   - La tabla `driver_documents` en Supabase tiene datos

---

## Troubleshooting

### Error: "bucket_id does not match"
- El bucket no está público
- Solución: Ve a Storage → driver-documents → Policies y crea una política pública

### Error: "relation 'driver_documents' does not exist"
- La tabla no se creó
- Solución: Corre el SQL script en SQL Editor

### Error: "No such table: driver_documents"
- Problema con permisos RLS
- Solución: Ejecuta el script SQL nuevamente

---

## Estructura de Archivos en Storage

Los archivos se organizarán así:
```
driver-documents/
├── 12345/
│   ├── Licencia de Conducir/
│   │   ├── 1703001234567-licencia_2024.pdf
│   │   ├── 1703001234568-licencia_frente.jpg
│   └── Antecedentes Penales/
│       └── 1703001234569-antecedentes.pdf
└── 67890/
    └── Certificado Médico/
        └── 1703001234570-medico_2024.pdf
```

Donde:
- `12345` es el ID del conductor
- `Licencia de Conducir` es el tipo de documento
- `1703001234567-licencia_2024.pdf` es el timestamp + nombre original del archivo
