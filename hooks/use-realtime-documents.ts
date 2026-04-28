import { useEffect, useRef, useCallback } from 'react'
import { createClient } from '@supabase/supabase-js'
import { OrchestrationAPI } from '@/lib/orchestration'

interface RealtimeDocumentChange {
  id: string
  type: 'INSERT' | 'UPDATE' | 'DELETE'
  old: any
  new: any
}

/**
 * Hook mejorado con soporte para Supabase Realtime
 * Integra cambios de estado con el sistema orquestador inteligente
 * 
 * Cuando cambia el estado de un documento:
 * 1. Se actualiza en tiempo real en la UI
 * 2. Se emite evento al orquestador
 * 3. Se disparan acciones en cascada automáticas
 * 4. Se generan alertas y recomendaciones
 * 5. Se sincroniza con otros módulos (conductores, alertas, etc)
 */
export function useRealtimeDocuments(driverRut: string) {
  const unsubscribeRef = useRef<(() => void) | null>(null)
  const clientRef = useRef<ReturnType<typeof createClient> | null>(null)

  // Inicializar cliente Supabase
  const initializeSupabaseClient = useCallback(() => {
    if (!clientRef.current) {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
      const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

      if (!supabaseUrl || !supabaseKey) {
        console.warn('[v0] Supabase credentials not configured for realtime')
        return null
      }

      clientRef.current = createClient(supabaseUrl, supabaseKey)
    }
    return clientRef.current
  }, [])

  // Manejar cambios en documentos
  const handleDocumentChange = useCallback(async (change: RealtimeDocumentChange) => {
    console.log('[v0] Document change detected:', change.type, change.id)

    // Extraer información del cambio
    const doc = change.new || change.old
    const oldStatus = change.old?.verification_status
    const newStatus = change.new?.verification_status

    // 1. Crear contexto compatible con ModuleContext
    const moduleContext = {
      userId: 'system', // Sistema automático
      entityId: driverRut, // El conductor es la entidad
      entityType: 'driver' as const,
      entityName: doc.driver_name || 'Conductor desconocido',
      timestamp: new Date(),
      metadata: {
        documentId: change.id,
        documentType: doc.document_type,
        changeType: change.type,
        oldStatus,
        newStatus,
      }
    }

    // Emit al sistema orquestador
    OrchestrationAPI.emitEvent(
      'document_state_changed',
      'documents',
      moduleContext,
      {
        documentId: change.id,
        driverRut,
        oldStatus,
        newStatus,
        documentType: doc.document_type,
        expirationDate: doc.expiration_date,
        uploadDate: doc.upload_date,
        fileName: doc.file_name,
      }
    )

    console.log('[v0] Event emitted to orchestrator:', moduleContext)

    // 2. Acciones específicas según tipo de cambio
    if (change.type === 'UPDATE' && oldStatus !== newStatus) {
      console.log(
        `[v0] Document status changed: ${oldStatus} → ${newStatus}`
      )

      // Si fue aprobado - refresca estado del conductor
      if (newStatus === 'approved' && oldStatus !== 'approved') {
        OrchestrationAPI.emitEvent(
          'document_approved',
          'documents',
          moduleContext,
          { documentType: doc.document_type }
        )
      }

      // Si fue rechazado - genera alerta
      if (newStatus === 'rejected') {
        OrchestrationAPI.emitEvent(
          'document_rejected',
          'documents',
          moduleContext,
          { reason: doc.rejection_reason }
        )
      }

      // Si se detectó vencimiento - alerta inmediata
      if (newStatus === 'expired') {
        OrchestrationAPI.emitEvent(
          'document_expired',
          'documents',
          moduleContext,
          { expirationDate: doc.expiration_date }
        )
      }
    }

    // 3. Para UPDATEs, obtener recomendaciones del orquestador
    if (change.type === 'UPDATE') {
      const recommendations = OrchestrationAPI.getRecommendations(driverRut)
      if (recommendations.length > 0) {
        console.log('[v0] Smart recommendations available:', recommendations.length)
      }
    }
  }, [driverRut])

  // Configurar listener de Supabase Realtime
  useEffect(() => {
    const setupRealtimeListener = async () => {
      const client = initializeSupabaseClient()
      if (!client) return

      try {
        // Escuchar cambios en tabla documentos
        const subscription = client
          .channel('documents_changes')
          .on(
            'postgres_changes',
            {
              event: '*', // INSERT, UPDATE, DELETE
              schema: 'public',
              table: 'documentos',
              filter: `driver_rut=eq.${driverRut}`, // Solo documentos de este conductor
            },
            (payload) => {
              const change: RealtimeDocumentChange = {
                id: payload.new?.id || payload.old?.id,
                type: payload.eventType as 'INSERT' | 'UPDATE' | 'DELETE',
                old: payload.old,
                new: payload.new,
              }

              handleDocumentChange(change)
            }
          )
          .subscribe((status) => {
            console.log('[v0] Supabase realtime status:', status)
          })

        unsubscribeRef.current = () => {
          client.removeChannel(subscription)
        }
      } catch (error) {
        console.error('[v0] Error setting up realtime listener:', error)
      }
    }

    if (driverRut) {
      setupRealtimeListener()
    }

    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current()
      }
    }
  }, [driverRut, initializeSupabaseClient, handleDocumentChange])

  return {
    connected: !!clientRef.current,
  }
}

/**
 * Hook helper para actualizar estado de documento desde UI
 * Integra con Supabase y el orquestador
 */
export function useDocumentStatusUpdate() {
  const updateDocumentStatus = useCallback(
    async (
      documentId: string,
      newStatus: 'pendiente' | 'aprobado' | 'rechazado' | 'vencido',
      driverRut: string,
      reason?: string
    ) => {
      try {
        // 1. Actualizar en Supabase (dispara realtime)
        const response = await fetch('/api/company/documents/update-status', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            documentId,
            status: newStatus,
            reason,
          }),
        })

        if (!response.ok) {
          throw new Error('Failed to update document status')
        }

        const result = await response.json()
        console.log('[v0] Document status updated in DB:', result)

        // 2. Emitir evento de actualización manual (desde UI)
        const updateContext = {
          userId: 'system',
          entityId: driverRut,
          entityType: 'driver' as const,
          entityName: 'Conductor',
          timestamp: new Date(),
          metadata: {
            documentId,
            newStatus,
            reason,
            source: 'manual-update-from-ui'
          }
        }

        OrchestrationAPI.emitEvent(
          'document_status_manual_update',
          'documents',
          updateContext,
          { timestamp: new Date().toISOString() }
        )

        // 3. Obtener insights después del cambio
        const insights = OrchestrationAPI.getInsights()
        console.log('[v0] Updated insights:', insights)

        return result
      } catch (error) {
        console.error('[v0] Error updating document status:', error)
        throw error
      }
    },
    []
  )

  return { updateDocumentStatus }
}

/**
 * Hook para monitorear estado de múltiples conductores
 * Útil para dashboards administrativos
 */
export function useRealtimeMultipleDrivers(driverRuts: string[]) {
  const changesRef = useRef<Map<string, number>>(new Map())

  useEffect(() => {
    const client = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || '',
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
    )

    if (!client) return

    try {
      const filters = driverRuts
        .map((rut) => `driver_rut=eq.${rut}`)
        .join(',')

      const subscription = client
        .channel('multi_documents_changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'documentos',
            filter: filters,
          },
          (payload) => {
            const rut = payload.new?.driver_rut || payload.old?.driver_rut
            const count = (changesRef.current.get(rut) || 0) + 1
            changesRef.current.set(rut, count)

            console.log(
              `[v0] Document change for driver ${rut}: ${count} total changes`
            )

          // Emitir al orquestador para procesamiento
            const bulkContext = {
              userId: 'system',
              entityId: 'bulk-update',
              entityType: 'driver' as const,
              entityName: 'Bulk Document Changes',
              timestamp: new Date(),
              metadata: {
                affectedDrivers: Array.from(changesRef.current.keys()),
                changesCounts: Object.fromEntries(changesRef.current),
              }
            }

            OrchestrationAPI.emitEvent(
              'bulk_document_changes',
              'documents',
              bulkContext,
              {}
            )
          }
        )
        .subscribe()

      return () => {
        client.removeChannel(subscription)
      }
    } catch (error) {
      console.error('[v0] Error setting up multi-driver listener:', error)
    }
  }, [driverRuts])

  return {
    changeStats: Object.fromEntries(changesRef.current),
  }
}
