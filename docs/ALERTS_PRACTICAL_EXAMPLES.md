## EJEMPLOS PRÁCTICOS - COPIAR Y PEGAR

Esta guía tiene código que el equipo LABBE puede copiar directamente.

---

## EJEMPLO 1: Crear Alerta Manualmente

```typescript
// Usar esto en cualquier endpoint o acción importante

const response = await fetch('/api/alerts', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    title: 'Documento Aprobado',
    message: 'Tu licencia fue aprobada correctamente',
    type: 'document_validated',
    category: 'document',
    priority: 'normal',
    action_url: '/dashboard/documents/license-123'
  })
})

if (response.ok) {
  const { data } = await response.json()
  console.log('Alerta creada:', data.id)
}
```

---

## EJEMPLO 2: Obtener Alertas con Filtros

```typescript
// En un componente React

import { useAlerts } from '@/hooks/useAlerts'

export function MisAlertas() {
  // Cargar solo alertas críticas no leídas
  const { alerts, loading, refresh } = useAlerts({
    autoRefresh: true,
    priority: 'critical',
    type: 'document_upload'
  })

  return (
    <div>
      <h2>Alertas Críticas ({alerts.length})</h2>
      
      {loading ? (
        <p>Cargando...</p>
      ) : (
        <ul>
          {alerts.map(alert => (
            <li key={alert.id}>
              <strong>{alert.title}</strong>
              <p>{alert.message}</p>
              <small>{new Date(alert.created_at).toLocaleString()}</small>
            </li>
          ))}
        </ul>
      )}
      
      <button onClick={refresh}>Actualizar</button>
    </div>
  )
}
```

---

## EJEMPLO 3: Marcar Múltiples Alertas como Leídas

```typescript
// En un componente con lista de alertas

import { useAlerts } from '@/hooks/useAlerts'

export function AlertasList() {
  const { alerts, markAsRead } = useAlerts()

  const handleMarkAllRead = async () => {
    // Obtener IDs de alertas no leídas
    const unreadIds = alerts
      .filter(a => !a.read)
      .map(a => a.id)
    
    if (unreadIds.length === 0) {
      alert('No hay alertas sin leer')
      return
    }
    
    // Marcar todas como leídas
    await markAsRead(unreadIds)
    console.log(`${unreadIds.length} alertas marcadas como leídas`)
  }

  return (
    <button onClick={handleMarkAllRead}>
      Marcar todas como leídas
    </button>
  )
}
```

---

## EJEMPLO 4: Mostrar Bell Icon en Navbar

```typescript
// Componente navbar educativo

import { useAlerts } from '@/hooks/useAlerts'
import { Bell } from 'lucide-react'

export function Navbar() {
  const { unreadCount, alerts } = useAlerts({ autoRefresh: true })
  
  return (
    <nav className="flex items-center justify-between p-4 bg-slate-900">
      <h1>LABBE Dashboard</h1>
      
      {/* Bell Icon con Badge */}
      <div className="relative">
        <Bell className="w-6 h-6 cursor-pointer" />
        
        {/* Badge mostrando número no leídas */}
        {unreadCount > 0 && (
          <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </div>
    </nav>
  )
}
```

---

## EJEMPLO 5: Lista Interactiva con Acciones

```typescript
// Componente educativo con acciones en cada alerta

import { useAlerts } from '@/hooks/useAlerts'
import { AlertTriangle, Clock, CheckCircle } from 'lucide-react'

export function AlertasPanel() {
  const { alerts, markAsRead } = useAlerts()

  const handleViewAlert = (alertId: string, actionUrl?: string) => {
    if (actionUrl) {
      window.location.href = actionUrl
    }
  }

  const handleMarkRead = async (alertId: string) => {
    await markAsRead(alertId)
    console.log('Marcada como leída')
  }

  return (
    <div className="space-y-3">
      {alerts.map(alert => (
        <div
          key={alert.id}
          className={`p-4 rounded border ${
            alert.read ? 'bg-slate-800 opacity-60' : 'bg-slate-900 border-slate-600'
          }`}
        >
          {/* Icono según prioridad */}
          <div className="flex items-start gap-3">
            {alert.priority === 'critical' && (
              <AlertTriangle className="w-5 h-5 text-red-500 mt-1" />
            )}
            {alert.priority === 'high' && (
              <Clock className="w-5 h-5 text-orange-500 mt-1" />
            )}
            {!['critical', 'high'].includes(alert.priority) && (
              <CheckCircle className="w-5 h-5 text-blue-500 mt-1" />
            )}

            {/* Contenido */}
            <div className="flex-1">
              <h3 className="font-bold text-foreground">
                {alert.title}
              </h3>
              <p className="text-slate-400 text-sm mt-1">
                {alert.message}
              </p>
              <small className="text-slate-500">
                {new Date(alert.created_at).toLocaleString('es-ES')}
              </small>
            </div>

            {/* Prioridad Badge */}
            <span className={`px-2 py-1 rounded text-xs font-bold ${
              alert.priority === 'critical' ? 'bg-red-500/30 text-red-200' :
              alert.priority === 'high' ? 'bg-orange-500/30 text-orange-200' :
              'bg-blue-500/30 text-blue-200'
            }`}>
              {alert.priority.toUpperCase()}
            </span>
          </div>

          {/* Acciones */}
          {!alert.read && (
            <button
              onClick={() => handleMarkRead(alert.id)}
              className="mt-3 text-xs text-slate-400 hover:text-slate-200"
            >
              Marcar como leída
            </button>
          )}
          
          {alert.action_url && (
            <button
              onClick={() => handleViewAlert(alert.id, alert.action_url)}
              className="ml-3 mt-3 text-xs text-blue-400 hover:text-blue-200"
            >
              Ver detalles
            </button>
          )}
        </div>
      ))}
    </div>
  )
}
```

---

## EJEMPLO 6: Crear Nueva Alerta en Endpoint

```typescript
// Usa esto en /app/api/tu-endpoint/route.ts

import { createClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
  const supabase = await createClient()
  
  try {
    const body = await request.json()
    const { conductorId, documentType } = body
    
    // Tu lógica aquí...
    
    // PASO 1: Obtener ID del usuario autenticado para asignar la alerta
    const { data: { user } } = await supabase.auth.getUser()
    
    // PASO 2: Obtener admins
    const { data: admins } = await supabase
      .from('profiles')
      .select('id')
      .in('role', ['admin', 'manager'])
    
    // PASO 3: Crear alerta para cada admin
    if (admins && admins.length > 0) {
      const alerts = admins.map(admin => ({
        user_id: admin.id,
        title: 'Nuevo Documento',
        message: `Conductor subió ${documentType}`,
        type: 'document_upload',
        category: 'document',
        priority: 'high',
        metadata: { conductorId, documentType },
        action_url: `/admin/documents/${conductorId}`
      }))
      
      // PASO 4: Insertar todas las alertas
      const { data, error } = await supabase
        .from('alerts')
        .insert(alerts)
        .select()
      
      if (!error) {
        console.log(`✅ ${data.length} alertas creadas`)
      }
    }
    
    return new Response('OK')
  } catch (error) {
    console.error('Error:', error)
    return new Response('Error', { status: 500 })
  }
}
```

---

## EJEMPLO 7: Filtrar Alertas por Categoría

```typescript
// En tu componente

import { useAlerts } from '@/hooks/useAlerts'

export function AlertasPorCategoria() {
  const { alerts } = useAlerts()
  
  // Obtener solo alertas de documentos
  const documentAlerts = alerts.filter(a => a.category === 'document')
  
  // Obtener solo alertas de cumplimiento
  const complianceAlerts = alerts.filter(a => a.category === 'compliance')
  
  // Obtener solo alertas de entidades
  const entityAlerts = alerts.filter(a => a.category === 'entity')
  
  return (
    <div>
      <section>
        <h2>Documentos ({documentAlerts.length})</h2>
        {documentAlerts.map(a => <AlertCard alert={a} />)}
      </section>
      
      <section>
        <h2>Cumplimiento ({complianceAlerts.length})</h2>
        {complianceAlerts.map(a => <AlertCard alert={a} />)}
      </section>
      
      <section>
        <h2>Entidades ({entityAlerts.length})</h2>
        {entityAlerts.map(a => <AlertCard alert={a} />)}
      </section>
    </div>
  )
}
```

---

## EJEMPLO 8: Solicitud API Completa con cURL

```bash
# GET - Obtener alertas críticas no leídas
curl -X GET "http://localhost:3000/api/alerts?priority=critical&read=false" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json"

# POST - Crear alerta
curl -X POST "http://localhost:3000/api/alerts" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test Alert",
    "message": "This is a test alert",
    "type": "document_upload",
    "category": "document",
    "priority": "high"
  }'

# PATCH - Marcar como leídas
curl -X PATCH "http://localhost:3000/api/alerts" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "ids": ["alert-id-1", "alert-id-2"],
    "read": true
  }'
```

---

## EJEMPLO 9: Validación de Formulario antes de Crear Alerta

```typescript
// Función educativa que valida antes de crear alerta

async function crearAlertaSegura(alertData: {
  title: string
  message: string
  type: string
  category: string
  priority: string
}) {
  // VALIDACIÓN 1: Verificar campos requeridos
  if (!alertData.title || alertData.title.trim().length === 0) {
    throw new Error('El título es requerido')
  }
  
  if (!alertData.message || alertData.message.trim().length === 0) {
    throw new Error('El mensaje es requerido')
  }
  
  // VALIDACIÓN 2: Verificar tipos válidos
  const tiposValidos = [
    'document_upload',
    'document_validated',
    'document_rejected',
    'document_expired',
    'entity_blocked'
  ]
  
  if (!tiposValidos.includes(alertData.type)) {
    throw new Error(`Tipo de alerta inválido. Usa uno de: ${tiposValidos.join(', ')}`)
  }
  
  // VALIDACIÓN 3: Verificar prioridades válidas
  const prioridades = ['critical', 'high', 'normal', 'low']
  if (!prioridades.includes(alertData.priority)) {
    throw new Error(`Prioridad inválida. Usa uno de: ${prioridades.join(', ')}`)
  }
  
  // SI PASA TODAS LAS VALIDACIONES: Crear alerta
  try {
    const response = await fetch('/api/alerts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(alertData)
    })
    
    if (!response.ok) throw new Error('Error al crear alerta')
    
    const { data } = await response.json()
    console.log('✅ Alerta creada:', data)
    return data
  } catch (error) {
    console.error('❌ Error:', error)
    throw error
  }
}

// USO:
try {
  await crearAlertaSegura({
    title: 'Documento Vencido',
    message: 'La licencia de Juan está próxima a vencer',
    type: 'document_expired',
    category: 'document',
    priority: 'high'
  })
} catch (error) {
  alert(error.message)
}
```

---

## EJEMPLO 10: Test Unitario para Entender el Hook

```typescript
// Como el equipo LABBE puede testear el hook

import { renderHook, act } from '@testing-library/react'
import { useAlerts } from '@/hooks/useAlerts'

describe('useAlerts Hook', () => {
  test('Debe cargar alertas correctamente', async () => {
    const { result } = renderHook(() => useAlerts())
    
    // Inicialmente loading = true
    expect(result.current.loading).toBe(true)
    
    // Esperar a que cargue
    await act(async () => {
      await new Promise(r => setTimeout(r, 100))
    })
    
    // Ahora debería tener alertas
    expect(result.current.alerts).toBeDefined()
    expect(result.current.unreadCount >= 0).toBe(true)
  })
  
  test('Debe contar alertas no leídas', async () => {
    const { result } = useAlerts()
    
    // Contar = cuántas tienen read = false
    const expectedCount = result.current.alerts
      .filter(a => !a.read)
      .length
    
    expect(result.current.unreadCount).toBe(expectedCount)
  })
  
  test('Debe marcar como leída', async () => {
    const { result } = useAlerts()
    const alertId = result.current.alerts[0]?.id
    
    if (alertId) {
      await act(async () => {
        await result.current.markAsRead(alertId)
      })
      
      // Verificar que se actualizó
      expect(result.current.unreadCount).toBeLessThan(2)
    }
  })
})
```

---

## RESUMEN DE EJEMPLOS

```
✅ Ejemplo 1: Crear alerta manualmente
✅ Ejemplo 2: Obtener con filtros
✅ Ejemplo 3: Marcar múltiples como leídas
✅ Ejemplo 4: Bell icon en navbar
✅ Ejemplo 5: Lista interactiva
✅ Ejemplo 6: Crear en endpoint
✅ Ejemplo 7: Filtrar por categoría
✅ Ejemplo 8: Requests con cURL
✅ Ejemplo 9: Validación segura
✅ Ejemplo 10: Testear el hook

El equipo LABBE puede COPIAR Y PEGAR estos ejemplos directamente
```

---

**Documento de Referencia Rápida para Desarrollo**
Created for LABBE Team - April 2026
