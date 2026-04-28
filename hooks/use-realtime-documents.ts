import { useEffect, useRef, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { OrchestrationAPI } from '@/lib/orchestration'

interface RealtimeDocumentChange {
  id: string
  type: 'INSERT' | 'UPDATE' | 'DELETE'
  old: any
  new: any
}

/**
 * Hook mejorado con soporte para Supabase Realtime
 */
export function useRealtimeDocuments(driverRut: string) {
  const unsubscribeRef = useRef<(() => void) | null>(null)
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const handleDocumentChange = useCallback(async (change: RealtimeDocumentChange) => {
    console.log('[v0] Document change detected:', change.type, change.id)

    // Extraer información del cambio
    const doc = change.new || change.old
    const oldStatus = change.old?.status
    const newStatus = change.new?.status

    console.log('[v0] Status change:', { oldStatus, newStatus })

    // 1. Crear contexto compatible con ModuleContext
    const moduleContext = {
      userId: 'system',
      entityId: doc?.driver_rut || 'unknown',
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

    // Emit al sistema orquestrador
    try {
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
      console.log('[v0] Event emitted to orchestrator')
    } catch (err) {
      console.error('[v0] Error emitting orchestrator event:', err)
    }
  }, [])

  // Configurar listener de Supabase Realtime con retry
  useEffect(() => {
    const setupListener = () => {
      try {
        const client = createClient()
        if (!client) {
          console.warn('[v0] Supabase client not available, retrying in 3s...')
          reconnectTimeoutRef.current = setTimeout(setupListener, 3000)
          return
        }

        console.log('[v0] Setting up realtime listener for driver:', driverRut)

        // Usar un nombre de canal único por driver
        const channelName = `driver_${driverRut}_documents`
        
        const subscription = client
          .channel(channelName)
          .on(
            'postgres_changes',
            {
              event: '*',
              schema: 'public',
              table: 'driver_documents',
            },
            (payload: any) => {
              try {
                const newData = payload.new as any
                const oldData = payload.old as any
                
                // Solo procesar si es del driver correcto
                const changeDriverRut = newData?.driver_rut || oldData?.driver_rut
                if (changeDriverRut !== driverRut) {
                  return
                }

                const change: RealtimeDocumentChange = {
                  id: newData?.id || oldData?.id || '',
                  type: payload.eventType as 'INSERT' | 'UPDATE' | 'DELETE',
                  old: oldData,
                  new: newData,
                }

                if (change.id) {
                  console.log('[v0] Processing document change:', change.type, change.id)
                  handleDocumentChange(change)
                }
              } catch (error) {
                console.error('[v0] Error processing document change:', error)
              }
            }
          )
          .subscribe((status: string) => {
            console.log(`[v0] Channel ${channelName} status:`, status)
            if (status === 'SUBSCRIBED') {
              console.log('[v0] ✅ Connected to realtime updates')
            } else if (status === 'CHANNEL_ERROR') {
              console.error('[v0] ❌ Channel error, will retry in 5s')
              // Retry después de 5 segundos
              reconnectTimeoutRef.current = setTimeout(setupListener, 5000)
            } else if (status === 'CLOSED') {
              console.warn('[v0] Channel closed, reconnecting...')
              reconnectTimeoutRef.current = setTimeout(setupListener, 2000)
            }
          })

        unsubscribeRef.current = () => {
          console.log('[v0] Unsubscribing from realtime')
          client.removeChannel(subscription)
        }
      } catch (error) {
        console.error('[v0] Error setting up realtime listener:', error)
        // Retry después de 5 segundos
        reconnectTimeoutRef.current = setTimeout(setupListener, 5000)
      }
    }

    if (driverRut) {
      setupListener()
    }

    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current)
      }
      if (unsubscribeRef.current) {
        unsubscribeRef.current()
      }
    }
  }, [driverRut, handleDocumentChange])

  return {
    connected: true,
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
 */
export function useRealtimeMultipleDrivers(driverRuts: string[]) {
  const changesRef = useRef<Map<string, number>>(new Map())
  const unsubscribeRef = useRef<(() => void) | null>(null)

  useEffect(() => {
    try {
      const client = createClient()
      if (!client) {
        console.warn('[v0] Supabase client not available for multi-driver listener')
        return
      }

      console.log('[v0] Setting up multi-driver listener for', driverRuts.length, 'drivers')

      const subscription = client
        .channel('multi_documents_changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'driver_documents',
          },
          (payload: any) => {
            try {
              const newData = payload.new as any
              const oldData = payload.old as any
              
              const rut = newData?.driver_rut || oldData?.driver_rut
              if (!rut || !driverRuts.includes(rut)) return
              
              const count = (changesRef.current.get(rut) || 0) + 1
              changesRef.current.set(rut, count)

              console.log(`[v0] Document change for driver ${rut}:`, count, 'total changes')

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

              try {
                OrchestrationAPI.emitEvent(
                  'bulk_document_changes',
                  'documents',
                  bulkContext,
                  {}
                )
              } catch (err) {
                console.error('[v0] Error emitting bulk event:', err)
              }
            } catch (error) {
              console.error('[v0] Error processing multi-driver change:', error)
            }
          }
        )
        .subscribe((status: string) => {
          console.log('[v0] Multi-driver subscription status:', status)
        })

      unsubscribeRef.current = () => {
        console.log('[v0] Unsubscribing from multi-driver realtime')
        client.removeChannel(subscription)
      }
    } catch (error) {
      console.error('[v0] Error setting up multi-driver listener:', error)
    }

    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current()
      }
    }
  }, [driverRuts])

  return {
    changeStats: Object.fromEntries(changesRef.current),
  }
}
