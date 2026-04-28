# Guía de Integración: Tiempo Real + Orquestador Inteligente

## Resumen Ejecutivo
El nuevo sistema `use-realtime-documents.ts` conecta Supabase Realtime con tu orquestador inteligente. Cuando cambias el estado de un documento, **automáticamente**:

1. ✅ Se actualiza en la UI en tiempo real
2. ✅ Se emite evento al orquestador
3. ✅ Se procesan 7 acciones automáticas coordinadas
4. ✅ Se generan alertas inteligentes
5. ✅ Se crean recomendaciones contextualizadas
6. ✅ Se sincroniza con otros módulos (conductores, alertas, compliance)
7. ✅ Se registra en el historial de eventos

---

## ¿Qué Cambios Ocurren Automáticamente?

### Escenario 1: Documento Aprobado
```
Usuario aprueba documento de conductor
    ↓
Supabase Realtime emite evento
    ↓
Hook detecta cambio: 'pendiente' → 'aprobado'
    ↓
Orquestador emite: 'document_approved'
    ↓
ACCIONES AUTOMÁTICAS:
  - Actualiza estado de conductor a "compliant"
  - Reduce alertas críticas asociadas
  - Genera recomendación: "Renovar próximo documento en 30 días"
  - Actualiza score de compliance
  - Notifica sistema de transportistas
  - Ejecuta validaciones de negocio
  - Registra auditoría del cambio
```

### Escenario 2: Documento Rechazado
```
Usuario rechaza documento
    ↓
Supabase Realtime emite evento
    ↓
Hook detecta cambio: 'pendiente' → 'rechazado'
    ↓
Orquestador emite: 'document_rejected'
    ↓
ACCIONES AUTOMÁTICAS:
  - Genera alerta crítica para el conductor
  - Notifica transportista responsable
  - Marca conductor como "requiere intervención"
  - Sugiere acciones de remediación
  - Escala a ejecutivo asignado
  - Pausa operaciones de este conductor
```

### Escenario 3: Documento Vencido
```
Sistema detecta documento vencido
    ↓
Supabase registra cambio automático
    ↓
Hook detecta cambio: 'aprobado' → 'vencido'
    ↓
Orquestador emite: 'document_expired'
    ↓
ACCIONES AUTOMÁTICAS:
  - Genera alerta URGENTE
  - Restringe operaciones del vehículo
  - Notifica ejecutivo asignado
  - Registra violación de compliance
  - Crea tarea de renovación
  - Bloquea nuevas asignaciones
  - Notifica transportista para renovación inmediata
```

---

## Cómo Integrar en tus Componentes

### 1. En Document Management Panel
```typescript
import { useRealtimeDocuments, useDocumentStatusUpdate } from '@/hooks/use-realtime-documents'

export function DocumentManagementPanel({
  document,
  companyCode,
  driverRut,
  onUpdate
}: DocumentManagementPanelProps) {
  // Hook de tiempo real - se inicializa automáticamente
  useRealtimeDocuments(driverRut)
  
  // Hook para actualizar estado
  const { updateDocumentStatus } = useDocumentStatusUpdate()

  const handleChangeStatus = async () => {
    try {
      // Esto ahora TAMBIÉN emite al orquestador
      await updateDocumentStatus(
        document.id,
        selectedStatus,
        driverRut,
        changeReason
      )
      
      // El orquestador ya manejó todo lo demás
      // Solo necesitas actualizar tu UI local
      onUpdate?.()
    } catch (error) {
      console.error('Error:', error)
    }
  }

  // ... resto del componente
}
```

### 2. En Conductores List
```typescript
import { useRealtimeMultipleDrivers } from '@/hooks/use-realtime-documents'

export function ConductoresListClient({
  conductores: initialConductores,
  companies,
}: ConductoresListClientProps) {
  // Monitorear cambios en todos los conductores
  const { changeStats } = useRealtimeMultipleDrivers(
    initialConductores.map(c => c.rut)
  )

  // Cuando hay cambios, el orquestador ya los procesó
  // Tu UI se actualiza en tiempo real
  
  // ... resto del componente
}
```

### 3. En Document Upload
```typescript
import { useRealtimeDocuments } from '@/hooks/use-realtime-documents'

export function DocumentUpload({ driverRut }) {
  // Activar realtime para este conductor
  useRealtimeDocuments(driverRut)

  const uploadDocument = async (file: File) => {
    try {
      const result = await fetch('/api/drivers/upload-doc', {
        method: 'POST',
        body: formData,
      })

      // Una vez subido, Supabase Realtime emite el evento
      // El hook lo detecta automáticamente
      // El orquestador procesa las acciones
      
      onUploadSuccess?.()
    } catch (error) {
      console.error('Error:', error)
    }
  }

  // ... resto del componente
}
```

---

## Flujo de Eventos Completo

```
USUARIO CAMBIA ESTADO EN UI
    ↓
updateDocumentStatus() → API /api/company/documents/update-status
    ↓
API actualiza Supabase
    ↓
Supabase Realtime emite evento (postgres_changes)
    ↓
useRealtimeDocuments Hook intercepta cambio
    ↓
Hook emite evento al OrchestrationAPI:
    - document_state_changed
    - document_approved (si es aprobado)
    - document_rejected (si es rechazado)
    - document_expired (si venció)
    ↓
OrchestrationAPI.emitEvent() registra evento
    ↓
ModuleOrchestrator.handleEvent() procesa
    ↓
SharedIntelligence analiza:
    - Patrones de este conductor
    - Correlaciones con otras alertas
    - Impacto en compliance
    - Acciones recomendadas
    ↓
ACCIONES AUTOMÁTICAS COORDINADAS:
    1. Actualizar estado del conductor
    2. Generar/resolver alertas
    3. Actualizar score compliance
    4. Notificar módulos relacionados
    5. Crear recomendaciones
    6. Registrar auditoría
    7. Ejecutar flujos de negocio
    ↓
UI SE ACTUALIZA CON NUEVA INFORMACIÓN:
    - Estado en tiempo real
    - Alertas generadas
    - Recomendaciones
    - Cambios de compliance
```

---

## Datos que se Sincronizzan en Tiempo Real

### Para Cada Cambio de Documento:

```json
{
  "documentId": "doc_123",
  "driverRut": "76543210-1",
  "changeType": "UPDATE",
  "oldStatus": "pendiente",
  "newStatus": "aprobado",
  "documentType": "license",
  "timestamp": "2024-01-15T10:30:00Z",
  
  "AUTOMÁTICAMENTE TAMBIÉN CAMBIA":
  {
    "conductorStatus": "actualizado",
    "complianceScore": "recalculado",
    "alertasActivas": "8 → 7",
    "recomendaciones": "3 nuevas",
    "transportistaNotificado": true,
    "ejecutivoAlertado": true,
    "auditoriaRegistrada": true
  }
}
```

---

## Eventos que se Pueden Escuchar

```typescript
// En tu componente, puedes escuchar eventos:
import { OrchestrationAPI } from '@/lib/orchestration'

useEffect(() => {
  // Escuchar cambios en documentos
  const unsubscribe = OrchestrationAPI.onEvent('document_approved', (context, payload) => {
    console.log('Documento aprobado:', payload)
    // Actualizar UI si es necesario
  })

  return unsubscribe
}, [])
```

---

## Beneficios de Esta Integración

| Antes | Después |
|-------|---------|
| Cambio manual en UI | Cambio + 7 acciones automáticas |
| Esperas a que se actualice | Actualización en tiempo real |
| No hay contexto de otras alertas | Sistema ve el panorama completo |
| Actualizaciones no coordinadas | Todas las acciones coordinadas |
| Errores manuales | Inteligencia evita errores |
| Auditoría manual | Auditoría automática completa |

---

## Próximos Pasos

1. ✅ Importa `useRealtimeDocuments` en tus componentes
2. ✅ Llama el hook en el componente de documentos
3. ✅ Usa `updateDocumentStatus` en lugar de llamadas directas a API
4. ✅ El orquestador maneja el resto automáticamente
5. ✅ Monitor en el dashboard de orquestación

Todo sigue funcionando igual, pero ahora **hay inteligencia coordinada** detrás.
