# Configuración de Documentos de Conductores

## Pasos para configurar

### 1. Ejecutar la migración SQL en Supabase

Copia el contenido de `scripts/create-documents-table.sql` y ejecútalo en la consola SQL de Supabase:

1. Ve a tu proyecto de Supabase
2. Abre la sección "SQL Editor"
3. Click en "New Query"
4. Pega el contenido del archivo SQL
5. Ejecuta la query

### 2. Verificar Variables de Entorno

Asegúrate de que tienes configuradas:
```
NEXT_PUBLIC_SUPABASE_URL=tu_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_anon_key
SUPABASE_SERVICE_ROLE_KEY=tu_service_role_key
```

### 3. Estructura de la Aplicación

**Componentes:**
- `components/drivers-list.tsx` - Lista de conductores (ahora simplificada)
- `components/driver-card.tsx` - Card individual de conductor CON lógica de documentos

**API Routes:**
- `app/api/documents/upload/route.ts` - POST para subir documentos
- `app/api/documents/[driverId]/route.ts` - GET para obtener documentos de un conductor

**Hooks:**
- `hooks/use-driver-documents.ts` - Hook custom para manejar documentos

### 4. Cómo Funciona

1. Cada `DriverCard` usa el hook `useDriverDocuments(driver.id)`
2. El hook carga automáticamente los documentos del conductor
3. Al hacer click en "Subir", se abre un modal dentro del componente
4. El formulario captura: tipo de documento y nombre del archivo
5. Se envía a la API que lo guarda en Supabase
6. Los documentos se recargan automáticamente

### 5. Estados de Documento

- **pendiente** - Naranja: Esperando revisión
- **aprobado** - Verde: Aprobado por LABBE
- **rechazado** - Rojo: Requiere resubmisión

## Tabla Supabase: driver_documents

Columnas:
- `id` (uuid) - ID único
- `driver_id` (varchar) - ID del conductor
- `document_type` (varchar) - Tipo de documento (Licencia, Antecedentes, etc)
- `file_name` (varchar) - Nombre del archivo
- `file_url` (text) - URL del archivo (para futuro)
- `status` (varchar) - Estado del documento
- `uploaded_at` (timestamp) - Fecha de subida
- `uploaded_by` (varchar) - Usuario que subió
- `notes` (text) - Notas adicionales
- `created_at` (timestamp) - Fecha creación
- `updated_at` (timestamp) - Última actualización
