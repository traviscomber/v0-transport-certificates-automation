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
    const oldStatus = change.old?.status
    const newStatus = change.new?.status

    console.log('[v0] Status change:', { oldStatus, newStatus, docType: doc?.document_type })

    // 1. Crear contexto compatible con ModuleContext
    const moduleContext = {
      userId: 'system', // Sistema automático
      entityId: doc?.driver_rut || 'unknown', // El conductor es la entidad
      entityType: 'driver' as const,
      entityName: doc?.driver_name || 'Conductor desconocido',
      timestamp: new Date(),
      metadata: {
        documentId: change.id,
        documentType: doc?.document_type,
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
        driverRut: doc?.driver_rut,
        oldStatus,
        newStatus,
        documentType: doc?.document_type,
        expirationDate: doc?.expiration_date,
        uploadDate: doc?.upload_date,
        fileName: doc?.file_name,
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
        // Escuchar cambios en tabla driver_documents
        console.log('[v0] Setting up realtime listener for driver:', driverRut)
        const subscription = client
          .channel('documents_changes')
          .on(
            'postgres_changes',
            {
              event: '*', // INSERT, UPDATE, DELETE
              schema: 'public',
              table: 'driver_documents', // Nombre correcto de la tabla
            },
            (payload: any) => {
              const newData = payload.new as any
              const oldData = payload.old as any
              
              // Filtrar por driver_rut si es necesario
              const changeDriverRut = newData?.driver_rut || oldData?.driver_rut
              if (changeDriverRut !== driverRut) {
                console.log('[v0] Ignoring change for different driver:', changeDriverRut)
                return
              }

              const change: RealtimeDocumentChange = {
                id: newData?.id || oldData?.id || '',
                type: payload.eventType as 'INSERT' | 'UPDATE' | 'DELETE',
                old: oldData,
                new: newData,
              }

              if (change.id) {
                console.log('[v0] Processing change:', change.type, change.id)
                handleDocumentChange(change)
              }
            }
          )
          .subscribe((status) => {
            console.log('[v0] Supabase realtime subscription status:', status)
            if (status === 'SUBSCRIBED') {
              console.log('[v0] ✅ Successfully subscribed to document changes')
            } else if (status === 'CHANNEL_ERROR') {
              console.error('[v0] ❌ Error subscribing to document changes')
            }
          })

        unsubscribeRef.current = () => {
          console.log('[v0] Unsubscribing from document changes')
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
        console.log('[v0] Updating document status:', { documentId, newStatus })
        
        // 1. Actualizar en Supabase (dispara realtime)
        const response = await fetch(`/api/company/documents/${documentId}/status`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            status: newStatus,
            reason,
          }),
        })

        if (!response.ok) {
          const error = await response.json()
          throw new Error(error.error || 'Failed to update document status')
        }

        const result = await response.json()
        console.log('[v0] Document status updated successfully:', result)

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
      const subscription = client
        .channel('multi_documents_changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'driver_documents', // Tabla correcta
          },
          (payload: any) => {
            const newData = payload.new as any
            const oldData = payload.old as any
            
            const rut = newData?.driver_rut || oldData?.driver_rut
            if (!rut || !driverRuts.includes(rut)) return
            
            const count = (changesRef.current.get(rut) || 0) + 1
            changesRef.current.set(rut, count)

            console.log(
              `[v0] Document change for driver ${rut}: ${count} total changes`
            )

          // Emitir al orquestrador para procesamiento
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
        .subscribe((status) => {
          console.log('[v0] Multi-driver realtime subscription status:', status)
        })

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
