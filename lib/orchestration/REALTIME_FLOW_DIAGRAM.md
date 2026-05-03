# DIAGRAMA VISUAL - FLUJO TIEMPO REAL

## COMPONENTES CONECTADOS

```
┌─────────────────────────────────────────────────────────────────┐
│                         USUARIO / ADMIN                         │
│                   (Sube documento o cambia estado)               │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
        ┌────────────────────────────────────────┐
        │   COMPONENTE REACT                     │
        │   driver-document-upload.tsx          │
        │   ┌──────────────────────────────┐   │
        │   │ <input type="file" />        │   │
        │   │ onChange → handleUpload()    │   │
        │   └──────────────────────────────┘   │
        └────────────────┬─────────────────────┘
                         │
                         ▼
        ┌────────────────────────────────────────────────┐
        │ POST /api/company/documents/drivers/upload     │
        │                                                │
        │ 1. Valida entrada (100ms)                     │
        │ 2. Upload Storage (200-500ms)                 │
        │ 3. Inserta BD (300ms)                         │
        │ 4. Trigger alerta (400ms)                     │
        │ 5. Retorna response (600ms total)             │
        └────────────────┬─────────────────────────────┘
                         │
                         ▼
        ┌────────────────────────────────────────────────┐
        │ SUPABASE                                       │
        │                                                │
        │ ┌──────────────────────────────────────────┐  │
        │ │ Storage: drivers/{rut}/{timestamp}_{file}  │  │
        │ │ ✅ Archivo guardado                        │  │
        │ └──────────────────────────────────────────┘  │
        │                                                │
        │ ┌──────────────────────────────────────────┐  │
        │ │ driver_documents table:                   │  │
        │ │  - id: uuid                               │  │
        │ │  - file_name: "licencia.pdf"             │  │
        │ │  - status: "pendiente"                    │  │
        │ │  - created_at: NOW()                      │  │
        │ └──────────────────────────────────────────┘  │
        │          │                                     │
        │          ▼ REALTIME EVENT (INSERT)             │
        │ ┌──────────────────────────────────────────┐  │
        │ │ postgres_changes                         │  │
        │ │ event: 'INSERT'                          │  │
        │ │ table: 'driver_documents'                │  │
        │ │ data: { id, file_name, status... }       │  │
        │ └──────────────────────────────────────────┘  │
        └────────────────┬─────────────────────────────┘
                         │
                         ▼ (300-500ms desde insert)
        ┌────────────────────────────────────────┐
        │ REACT COMPONENT (useRealtimeDocuments) │
        │                                         │
        │ .on('postgres_changes', (payload) => {  │
        │   // 1. Recibe cambio                   │
        │   // 2. Crea ModuleContext              │
        │   // 3. Emite a Orquestrador           │
        │ })                                      │
        └────────────────┬─────────────────────┘
                         │
                         ▼
        ┌────────────────────────────────────────┐
        │ ORCHESTRATION SYSTEM                   │
        │                                         │
        │ OrchestrationAPI.emitEvent(            │
        │   'document_uploaded',                 │
        │   'documents',                         │
        │   { userId, entityId, ... },           │
        │   { fileName, documentId, ... }        │
        │ )                                      │
        │                                         │
        │ ✅ Evento registrado en sistema        │
        │ ✅ Acciones en cascada se disparan    │
        └────────────────┬─────────────────────┘
                         │
                         ▼
        ┌────────────────────────────────────────────────────────┐
        │ ACCIONES EN CASCADA (AUTOMÁTICAS)                      │
        │                                                         │
        │ ┌──────────────────────────────────────────────────┐  │
        │ │ Alerts Module:                                   │  │
        │ │ → Genera alerta de documento subido              │  │
        │ └──────────────────────────────────────────────────┘  │
        │                                                         │
        │ ┌──────────────────────────────────────────────────┐  │
        │ │ Compliance Module:                               │  │
        │ │ → Recalcula score del conductor                  │  │
        │ └──────────────────────────────────────────────────┘  │
        │                                                         │
        │ ┌──────────────────────────────────────────────────┐  │
        │ │ Notifications Module:                            │  │
        │ │ → Notifica al ejecutivo asignado                │  │
        │ └──────────────────────────────────────────────────┘  │
        │                                                         │
        │ ┌──────────────────────────────────────────────────┐  │
        │ │ Audit Module:                                    │  │
        │ │ → Registra quién, qué, cuándo                   │  │
        │ └──────────────────────────────────────────────────┘  │
        └────────────────┬─────────────────────────────────────┘
                         │
                         ▼ (600-800ms total)
        ┌────────────────────────────────────────┐
        │ UI ACTUALIZADA EN TIEMPO REAL           │
        │                                         │
        │ Lista de documentos:                   │
        │ ┌──────────────────────────────────┐   │
        │ │ 📄 Licencia de Conducir          │   │
        │ │ Status: ✅ Pendiente             │   │
        │ │ Subido hace 5s                   │   │
        │ └──────────────────────────────────┘   │
        │                                         │
        │ Sin refresco de página                 │
        │ SIN intervención manual                │
        │ 100% automático                        │
        └────────────────────────────────────────┘
```

---

## CAMBIO DE ESTADO EN TIEMPO REAL

```
┌──────────────────────────────────────┐
│ USUARIO HACE CLIC EN "RECHAZAR"      │
└──────────────┬───────────────────────┘
               │
               ▼
┌──────────────────────────────────────────────────────┐
│ UI Component (document-action-modal.tsx)             │
│                                                      │
│ onClick → changeStatus('rechazado', 'Foto borrosa') │
└──────────────┬───────────────────────────────────────┘
               │
               ▼
┌──────────────────────────────────────────────────────┐
│ Hook: useDocumentManagement                         │
│                                                      │
│ changeStatus(documentId, 'rechazado')              │
│   ↓                                                 │
│   PATCH /api/company/documents/{id}/status         │
└──────────────┬───────────────────────────────────────┘
               │
               ▼
┌──────────────────────────────────────────────────────┐
│ API: /api/company/documents/[id]/status/route.ts    │
│                                                      │
│ 1. Valida status (50ms)                             │
│ 2. SELECT status anterior (100ms)                   │
│ 3. UPDATE driver_documents (150ms)                  │
│    status: 'rechazado'                              │
│    updated_at: NOW()                                │
│ 4. Emit to Orchestrator (200ms, async)              │
│ 5. Return response (400ms total)                    │
└──────────────┬───────────────────────────────────────┘
               │
               ▼
┌──────────────────────────────────────────────────────┐
│ SUPABASE - postgres_changes EVENT                    │
│                                                      │
│ eventType: 'UPDATE'                                 │
│ old: { status: 'pendiente', ... }                   │
│ new: { status: 'rechazado', ... }                   │
│                                                      │
│ ✅ Enviado a todos los clientes realtime            │
└──────────────┬───────────────────────────────────────┘
               │
               ▼ (300ms desde UPDATE)
┌──────────────────────────────────────────────────────┐
│ React Hook: useRealtimeDocuments                     │
│                                                      │
│ .on('postgres_changes', payload => {                │
│   change = {                                        │
│     id: documentId,                                 │
│     type: 'UPDATE',                                 │
│     old: { status: 'pendiente' },                  │
│     new: { status: 'rechazado' }                   │
│   }                                                 │
│   handleDocumentChange(change)                      │
│ })                                                  │
└──────────────┬───────────────────────────────────────┘
               │
               ▼
┌──────────────────────────────────────────────────────┐
│ ORCHESTRATION SYSTEM                                │
│                                                      │
│ Detecta: status cambió de 'pendiente' → 'rechazado' │
│                                                      │
│ Emite eventos:                                      │
│  - document_state_changed                           │
│  - document_rejected (porque newStatus='rechazado') │
│                                                      │
│ Acciones en cascada:                                │
│  1. Notifica al ejecutivo                           │
│  2. Recalcula compliance score (-20 puntos)         │
│  3. Genera recomendaciones                          │
│  4. Registra auditoría                              │
│  5. Actualiza estado del conductor                  │
└──────────────┬───────────────────────────────────────┘
               │
               ▼ (500-600ms total)
┌──────────────────────────────────────────────────────┐
│ UI - Lista de Documentos ACTUALIZADA                │
│                                                      │
│ ✗ Licencia de Conducir                             │
│ Status: ❌ Rechazado                               │
│ Razón: "Foto borrosa"                              │
│ Cambio hace 2s                                      │
│                                                      │
│ ✅ SIN REFRESCO DE PÁGINA                           │
│ ✅ CAMBIO VISIBLE EN TIEMPO REAL                    │
│ ✅ EJECUTIVO YA NOTIFICADO                          │
│ ✅ COMPLIANCE SCORE YA RECALCULADO                  │
└──────────────────────────────────────────────────────┘
```

---

## TABLA DE TIEMPOS

```
UPLOAD FLUJO:
├─ Upload File: 100-500ms (según tamaño)
├─ Guardar en BD: 100ms
├─ Supabase Realtime: 300-500ms
├─ React hook recibe: +100ms
├─ Orquestrador procesa: +100ms
├─ UI re-renderiza: +100ms
└─ TOTAL VISIBLE: 600-900ms

CAMBIO DE ESTADO:
├─ PATCH request: 50-100ms
├─ Valida + consulta anterior: 150ms
├─ UPDATE en BD: 150ms
├─ Supabase Realtime: 300-500ms
├─ React hook recibe: +100ms
├─ Orquestrador procesa: +100ms
├─ UI re-renderiza: +100ms
└─ TOTAL VISIBLE: 400-700ms
```

---

## LOGGING ESPERADO

Cuando subes un documento, en Console (F12) deberías ver:

```
[v0] ==================== UPLOAD POST CALLED AT: 2024-01-15T10:30:45.123Z ====================
[v0] Upload endpoint called
[v0] FormData entries: [['files', 'File(licencia.pdf)'], ['driverRut', '12345678-K'], ...]
[v0] Upload request: {driverRut: "12345678-K", documentType: "Licencia", fileName: "licencia.pdf", fileSize: 245632}
[v0] Found driver: {driverId: 42, rut: "12345678-K", name: "Juan Carlos Pérez López"}
[v0] Uploading to storage: drivers/12345678-K/1705315845123_licencia.pdf
[v0] File uploaded to storage successfully
[v0] Public URL: https://...supabase.co/storage/v1/object/public/documents/drivers/...
[v0] Inserting document to database: {driver_id: "42", file_name: "licencia.pdf", document_type: "Licencia", file_url: "https://...", status: "pendiente"}
[v0] ✅ Document insert result: {success: true, id: "uuid-123", fileName: "licencia.pdf"}

[v0] Supabase realtime status: SUBSCRIBED
[v0] Document change detected: INSERT uuid-123
[v0] Event emitted to orchestrator: {userId: 'system', entityId: '12345678-K', entityType: 'driver', entityName: 'Juan Carlos Pérez López', ...}
```

Cuando cambias estado a Rechazado:

```
[v0] 🔄 Hook: changeStatus called with: {documentId: "uuid-123", status: "rechazado", reason: "Foto borrosa"}
[v0] 📥 Hook: Status change response: {status: 200, data: {success: true, document_id: "uuid-123", ...}}
[v0] ✅ Hook: Status changed successfully on server
[v0] 🔍 Verifying status update...
[v0] ✅ Status verified on attempt 1/3: rechazado

[v0] Document change detected: UPDATE uuid-123
[v0] Event emitted to orchestrator: {userId: 'system', entityId: '12345678-K', ...}
[v0] 📡 Emitting event to orchestrator: {documentId: "uuid-123", status: "rechazado", reason: "Foto borrosa"}
[v0] ✅ Orchestrator event: {type: 'document_status_changed', ...}
```
