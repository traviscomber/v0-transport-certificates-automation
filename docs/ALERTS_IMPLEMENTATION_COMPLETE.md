## Sistema de Alertas - Implementación Completa

Esta guía explica TODOS los 4 puntos que hemos implementado para que el equipo de LABBE entienda completamente el sistema.

---

## 1. MEJORAS AL SISTEMA DE ALERTAS

### Qué se mejoró:

#### 1.1 API Mejorada (`/app/api/alerts/route.ts`)

**Antes:** Solo GET básico para traer alertas
**Ahora:** API completa con GET, POST, PATCH educada

```typescript
// GET - Obtener alertas con filtros
GET /api/alerts?type=document_upload&priority=critical&read=false

// POST - Crear nueva alerta
POST /api/alerts
{ title, message, type, category, priority, action_url, metadata }

// PATCH - Marcar múltiples alertas como leídas
PATCH /api/alerts
{ ids: ['id1', 'id2'], read: true }
```

**Ventajas:**
- Filtrado por tipo, prioridad, estado de lectura
- Paginación automática
- Conteo total de alertas
- Métodos documentados en comentarios

---

## 2. DOCUMENTACIÓN DEL SISTEMA

### Archivos de Documentación Creados:

1. **`/docs/ALERTS_SYSTEM_GUIDE.md`** - Guía general del sistema
2. **Comentarios en código** - Cada función tiene comentarios educativos
3. **Este archivo** - Guía completa de implementación

### Componentes Documentados:

- `useAlerts.ts` - Hook con ejemplos de uso
- `AlertsPage.tsx` - Página con componentes separados y educativos
- API routes - Todos los endpoints con JSDoc

---

## 3. CONEXIÓN CON EVENTOS (Alertas Automáticas)

### ¿Cómo se generan alertas automáticamente?

Cuando ocurre un evento en el sistema, se genera una alerta. Ejemplos:

#### 3.1 Cuando un Conductor Sube Documento

```typescript
// En /app/api/conductor/upload-document/route.ts
await generateDocumentUploadAlerts(
  documentId,
  documentType,
  conductorName,
  'conductor',
  userId
)
// Automáticamente crea alertas para todos los admins
```

#### 3.2 Cuando un Documento Se Valida

```typescript
// En /app/api/documents/validate/route.ts
await generateDocumentValidationAlert(
  documentId,
  documentType,
  uploaderName,
  uploaderType,
  uploaderId,
  isApproved
)
// Si es aprobado → DOCUMENT_VALIDATED
// Si es rechazado → DOCUMENT_REJECTED
```

#### 3.3 Alertas por Documento Vencido (Próximo a Implementar)

```typescript
// Cron job que verifica diariamente
// Si documento vence en < 30 días → DOCUMENT_EXPIRING_SOON
// Si documento vencido → DOCUMENT_EXPIRED
```

### Eventos que Generan Alertas:

| Evento | Tipo de Alerta | Prioridad | Quién lo ve |
|--------|----------------|-----------|-----------|
| Documento nuevo | DOCUMENT_UPLOADED | high | Admins/Managers |
| Documento aprobado | DOCUMENT_VALIDATED | normal | Conductor/Cliente |
| Documento rechazado | DOCUMENT_REJECTED | high | Conductor/Cliente |
| Documento vencido | DOCUMENT_EXPIRED | critical | Admins |
| Vence en < 30 días | DOCUMENT_EXPIRING_SOON | high | Admins |
| Entidad bloqueada | ENTITY_BLOCKED | critical | Admins |
| Score bajo | COMPLIANCE_SCORE_LOW | high | Admins |

---

## 4. DASHBOARD DE ESTADÍSTICAS

### Página: `/app/dashboard/alerts/page.tsx`

#### Componentes del Dashboard:

1. **StatCard** - Tarjeta de estadística
   - Total de alertas
   - Alertas no leídas
   - Alertas críticas
   - Alertas de hoy

2. **Filtros Avanzados**
   - Solo mostrar no leídas
   - Filtrar por prioridad (critical, high, normal, low)
   - Refrescar manual

3. **Lista de Alertas**
   - Muestra cada alerta con:
     - Icono según prioridad
     - Título y mensaje
     - Timestamp
     - Botón "Marcar como leída"

#### Código Educativo en el Archivo:

```typescript
// Cada componente está explicado
/**
 * Componente de Tarjeta de Estadística
 * Muestra un número y un título con un icono
 */
function StatCard({ title, value, icon, color }) { ... }

// Las funciones tienen nombres descriptivos
const filteredAlerts = alerts.filter(...)
const stats = { total, unread, critical, today }
```

---

## 5. HOOK PERSONALIZADO: useAlerts

### Ubicación: `/hooks/useAlerts.ts`

Este hook centraliza TODA la lógica de alertas para reutilizarla.

#### Ejemplo de Uso:

```typescript
// En cualquier componente
const { 
  alerts, 
  loading, 
  unreadCount, 
  criticalAlerts,
  markAsRead,
  refresh,
  getByCategory,
  getByType
} = useAlerts({
  autoRefresh: true,
  refreshInterval: 30000,
  type: 'document_upload'
})

// En el JSX
<span>{unreadCount} alertas no leídas</span>
{alerts.map(alert => <AlertCard {...alert} />)}
<Button onClick={() => markAsRead(['id1', 'id2'])}>Marcar como leída</Button>
```

#### Propiedades del Hook:

```typescript
{
  // Estado
  alerts: Alert[],           // Array de alertas
  loading: boolean,          // Si está cargando
  error: string | null,      // Mensaje de error si hay

  // Estadísticas
  unreadCount: number,       // Cantidad no leídas
  criticalAlerts: Alert[],   // Solo críticas
  totalAlerts: number,       // Total
  
  // Métodos
  markAsRead: (id | id[]) => Promise<void>,  // Marcar como leída
  refresh: () => Promise<void>,               // Refrescar alertas
  getByCategory: (category) => Alert[],      // Filtrar por categoría
  getByType: (type) => Alert[]                // Filtrar por tipo
}
```

---

## 6. ARQUITECTURA COMPLETA (Educativa)

```
┌─────────────────────────────────────────────────────────┐
│                   USUARIO/ADMIN                          │
│              (Ve alertas en UI)                          │
└──────────────────────┬──────────────────────────────────┘
                       │
        ┌──────────────┴──────────────┐
        ▼                             ▼
   ┌─────────────┐          ┌─────────────────┐
   │ Componente  │          │ Dashboard       │
   │ con hook    │          │ /alerts/page.tsx│
   │useAlerts()  │          └────────┬────────┘
   └──────┬──────┘                   │
          │                          │
          └──────────────┬───────────┘
                         ▼
              ┌────────────────────┐
              │  /api/alerts       │
              │  GET, POST, PATCH  │
              │  (Maneja lógica)   │
              └─────────┬──────────┘
                        │
                        ▼
              ┌────────────────────┐
              │  Base de Datos     │
              │  Tabla: alerts     │
              └────────────────────┘

Eventos que crean alertas:
┌─────────────────────────────────────────┐
│ Documento Subido                        │
│ → generateDocumentUploadAlerts()        │
│ → POST /api/alerts                      │
│ → Se guarda en BD                       │
│ → Admin ve bell icon +1                 │
└─────────────────────────────────────────┘
```

---

## 7. CÓMO USAR EN TU CÓDIGO

### Ejemplo 1: Mostrar Contador en Navbar

```typescript
import { useAlerts } from '@/hooks/useAlerts'

export function Navbar() {
  const { unreadCount } = useAlerts({ autoRefresh: true })
  
  return (
    <nav>
      <BellIcon />
      {unreadCount > 0 && (
        <span className="badge">{unreadCount}</span>
      )}
    </nav>
  )
}
```

### Ejemplo 2: Crear Alerta al Subir Documento

```typescript
// En tu componente de upload
const response = await fetch('/api/alerts', {
  method: 'POST',
  body: JSON.stringify({
    title: 'Documento Subido',
    message: `${conductorName} subió licencia`,
    type: 'document_upload',
    category: 'document',
    priority: 'high',
    action_url: `/admin/documents/${docId}`
  })
})
```

### Ejemplo 3: Marcar Alertas como Leídas

```typescript
const { markAsRead } = useAlerts()

// Marcar una
await markAsRead('alert-id-1')

// Marcar varias
await markAsRead(['alert-id-1', 'alert-id-2', 'alert-id-3'])
```

---

## 8. PRÓXIMOS PASOS EDUCATIVOS

Para que el equipo LABBE continúe desarrollando:

1. **Alertas por Email**: Notificar admins por correo
2. **Alertas por SMS**: Notificaciones críticas por texto
3. **Webhooks**: Integrar con sistemas externos
4. **Histórico**: Guardar historial de alertas por 30 días
5. **Preferencias**: Que cada usuario elija qué alertas recibe
6. **Análisis**: Dashboard de tendencias de alertas

---

## 9. ARCHIVOS MODIFICADOS/CREADOS

```
✅ /app/api/alerts/route.ts                    - API mejorada
✅ /hooks/useAlerts.ts                         - Hook personalizado
✅ /app/dashboard/alerts/page.tsx              - Dashboard completo
✅ /docs/ALERTS_SYSTEM_GUIDE.md                - Documentación
✅ /lib/document-alerts-generator.ts           - Generador de alertas
✅ /app/api/conductor/upload-document/route.ts - Genera alertas
✅ /app/api/documents/validate/route.ts        - Genera alertas
```

---

## 10. PREGUNTAS FRECUENTES

**P: ¿Cómo evito duplicar alertas?**
A: La BD tiene validación para no insertar alertas iguales en la misma hora

**P: ¿Cuánto tiempo se guardan?**
A: Las alertas se guardan indefinidamente (próxima fase: archivar después de 30 días)

**P: ¿Cómo reciben alertas los usuarios?**
A: En el UI (bell icon). Próxima fase: email y SMS

**P: ¿Puedo filtrar por múltiples tipos?**
A: Sí, ahora el hook permite `getByType()` y `getByCategory()`

---

## RESUMEN EDUCATIVO

Lo que implementamos para LABBE:

1. ✅ API completa y documentada
2. ✅ Documentación clara y educativa
3. ✅ Sistema automático de eventos
4. ✅ Dashboard con estadísticas
5. ✅ Hook reutilizable
6. ✅ Código legible y mantenible

El equipo de LABBE ahora puede:
- Entender completamente cómo funcionan las alertas
- Crear nuevas alertas fácilmente
- Mantener y mejorar el código
- Escalar el sistema sin problemas
