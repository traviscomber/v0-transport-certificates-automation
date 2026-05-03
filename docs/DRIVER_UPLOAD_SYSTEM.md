# Sistema de Carga de Documentos para Conductores (Drivers)

## Descripción General

Este sistema permite que los conductores individuales suban y gestionen sus documentos de cumplimiento legal. Los documentos se procesan automáticamente mediante OCR y se validan según regulaciones chilenas de transporte.

## Características

### 1. Carga de Documentos
- Los conductores pueden subir documentos directamente desde su panel
- Tipos de documentos soportados:
  - Cédula de Identidad
  - Licencia de Conducir Profesional
  - Hoja de Vida
  - Certificado de Antecedentes
  - Certificado de Salud
  - Examen Preocupacional
  - Y otros documentos requeridos

### 2. Validación Automática
- Procesamiento OCR automático de documentos
- Extracción de datos estructurados
- Validación de fechas de vencimiento
- Alertas de documentos próximos a vencer

### 3. Notificaciones
- Email automático al conductor cuando se procesa un documento
- Alertas sobre documentos vencidos
- Recordatorios de renovación

## API Endpoints

### POST `/api/conductor/upload-document`

Carga un nuevo documento.

**Headers:**
```
Authorization: Bearer {jwt_token}
```

**Body (multipart/form-data):**
```
file: File (PDF, JPG, PNG - máximo 10MB)
documentType: string (código del tipo de documento)
```

**Response:**
```json
{
  "success": true,
  "documentId": "uuid",
  "message": "Document uploaded successfully"
}
```

### GET `/api/conductor/documents`

Obtiene todos los documentos del conductor.

**Headers:**
```
Authorization: Bearer {jwt_token}
```

**Response:**
```json
{
  "success": true,
  "documents": [
    {
      "id": "uuid",
      "original_filename": "licencia.pdf",
      "validation_status": "validated",
      "status": "valid",
      "expiry_date": "2025-12-31",
      "daysRemaining": 145,
      "documentType": {
        "id": "uuid",
        "code": "LICENCIA_CONDUCIR",
        "name": "Licencia de Conducir Profesional",
        "validity_days": 365
      },
      "created_at": "2024-04-08T12:00:00Z"
    }
  ]
}
```

## Tipos de Documentos Soportados

```
CEDULA_IDENTIDAD - Cédula de Identidad (obligatorio, sin vencimiento)
LICENCIA_CONDUCIR - Licencia de Conducir Profesional (obligatorio, 365 días)
HOJA_VIDA_CONDUCTOR - Hoja de Vida (obligatorio, sin vencimiento)
CERTIFICADO_ANTECEDENTES - Certificado de Antecedentes (obligatorio, 365 días)
INHABILIDADES_MENORES - Inhabilidades Menores (obligatorio, 180 días)
CONTRATO_TRABAJO - Contrato de Trabajo (obligatorio, 365 días)
CERTIFICADO_AFP - Certificado AFP (obligatorio, 180 días)
CERTIFICADO_SALUD - Certificado de Salud (obligatorio, 365 días)
EXAMEN_PREOCUPACIONAL - Examen Preocupacional (obligatorio, 365 días)
```

## Estructura de Base de Datos

### uploaded_documents
```sql
- id: UUID (primary key)
- document_type_id: UUID (FK -> document_types)
- conductor_id: UUID (FK -> profiles/conductores)
- uploaded_by: UUID (FK -> auth.users)
- original_filename: TEXT
- file_url: TEXT
- file_path: TEXT
- file_size: INTEGER
- mime_type: TEXT
- ocr_raw_text: TEXT
- ocr_structured_data: JSONB
- confidence_score: NUMERIC(4,3)
- validation_status: TEXT (pending, validated, rejected, review)
- validation_notes: TEXT
- validated_by: UUID (FK -> auth.users)
- validated_at: TIMESTAMPTZ
- expiry_date: DATE
- issue_date: DATE
- created_at: TIMESTAMPTZ
- updated_at: TIMESTAMPTZ
```

## Flujo de Procesamiento

1. **Carga**: Conductor carga documento desde panel `/conductor/upload`
2. **Almacenamiento**: Archivo se guarda en Supabase Storage
3. **OCR**: Procesamiento automático mediante servicio de OCR
4. **Extracción**: Extracción de datos estructurados (fechas, nombres, etc.)
5. **Validación**: Revisión manual por equipo de cumplimiento
6. **Notificación**: Email al conductor con resultado
7. **Almacenamiento**: Datos se guardan en `uploaded_documents` tabla

## Seguridad

- Los documentos se almacenan en Supabase Storage con encriptación
- RLS (Row Level Security) asegura que conductores solo vean sus propios documentos
- Los URLs de documentos son temporales y se expiran después de 7 días
- Auditoría completa de todas las operaciones en `audit_logs`

## Configuración Requerida

### Supabase Storage Bucket

Crear bucket `documents` con siguientes reglas RLS:

```sql
-- SELECT: Anyone can read documents if they have the correct URL (expires after 7 days)
-- INSERT: Only authenticated users can upload
-- UPDATE: Only document owner or admin can update
-- DELETE: Only admin can delete
```

### Environment Variables

```
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxxxx
SUPABASE_SERVICE_ROLE_KEY=xxxxx
```

## Próximas Fases

- [ ] Integración con servicio OCR (Tesseract o API externa)
- [ ] Cola de procesamiento asincrónico (Bull/Redis)
- [ ] Sistema de revisión manual (queue/dashboard)
- [ ] Integración con sistema de alertas (Twilio/SendGrid)
- [ ] Reportes de cumplimiento por conductor
- [ ] API para empresas transportistas para ver documentos de sus conductores
