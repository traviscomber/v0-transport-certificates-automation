import { useState, useEffect, useCallback } from 'react'

/**
 * Hook Educativo: useAlerts
 * 
 * Este hook gestiona todo lo relacionado con alertas en el frontend
 * 
 * Ventajas:
 * - Centraliza la lógica de alertas
 * - Fácil de usar en cualquier componente
 * - Maneja caching y refresh automático
 * - Permite filtrar y buscar alertas
 * 
 * Ejemplo de uso:
 * 
 * const { alerts, loading, unreadCount, markAsRead, refresh } = useAlerts()
 * 
 * // En el componente:
 * {unreadCount > 0 && <span className="badge">{unreadCount}</span>}
 * {alerts.map(alert => <AlertCard alert={alert} />)}
 */

export interface Alert {
  id: string
  title: string
  message: string
  type: string
  category: string
  priority: 'critical' | 'high' | 'normal' | 'low'
  read: boolean
  action_url?: string
  metadata?: Record<string, any>
  created_at: string
}

export interface UseAlertsOptions {
  autoRefresh?: boolean // Refrescar automáticamente cada 30 segundos
  refreshInterval?: number // Intervalo en milisegundos
  type?: string // Filtrar por tipo
  priority?: string // Filtrar por prioridad
  limit?: number // Cuántas alertas cargar
}

export function useAlerts(options: UseAlertsOptions = {}) {
  const {
    autoRefresh = true,
    refreshInterval = 30000,
    type,
    priority,
    limit = 50
  } = options

  const [alerts, setAlerts] = useState<Alert[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  /**
   * Cargar alertas del backend
   */
  const fetchAlerts = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      // Construir URL con query params
      const params = new URLSearchParams()
      params.append('limit', limit.toString())
      if (type) params.append('type', type)
      if (priority) params.append('priority', priority)

      const response = await fetch(`/api/alerts?${params.toString()}`)

      if (!response.ok) {
        throw new Error('Error al cargar alertas')
      }

      const { data } = await response.json()
      setAlerts(data || [])
    } catch (err: any) {
      console.error('[useAlerts] Error:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [limit, type, priority])

  /**
   * Marcar una alerta como leída
   */
  const markAsRead = useCallback(async (alertId: string | string[]) => {
    const ids = Array.isArray(alertId) ? alertId : [alertId]

    try {
      const response = await fetch('/api/alerts', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids, read: true })
      })

      if (!response.ok) throw new Error('Error al marcar como leída')

      // Actualizar estado local
      setAlerts(prev =>
        prev.map(alert =>
          ids.includes(alert.id) ? { ...alert, read: true } : alert
        )
      )
    } catch (err: any) {
      console.error('[markAsRead] Error:', err)
      setError(err.message)
    }
  }, [])

  /**
   * Obtener conteo de alertas no leídas
   */
  const unreadCount = alerts.filter(a => !a.read).length

  /**
   * Obtener alertas críticas
   */
  const criticalAlerts = alerts.filter(a => a.priority === 'critical')

  /**
   * Obtener alertas por categoría
   */
  const getByCategory = (category: string) =>
    alerts.filter(a => a.category === category)

  /**
   * Obtener alertas por tipo
   */
  const getByType = (alertType: string) =>
    alerts.filter(a => a.type === alertType)

  /**
   * Auto-refresh de alertas
   */
  useEffect(() => {
    // Cargar alertas inicialmente
    fetchAlerts()

    // Configurar refresh automático si está habilitado
    if (autoRefresh) {
      const interval = setInterval(fetchAlerts, refreshInterval)
      return () => clearInterval(interval)
    }
  }, [fetchAlerts, autoRefresh, refreshInterval])

  return {
    // Estado
    alerts,
    loading,
    error,
    
    // Estadísticas
    unreadCount,
    criticalAlerts,
    totalAlerts: alerts.length,
    
    // Métodos
    markAsRead,
    refresh: fetchAlerts,
    getByCategory,
    getByType
  }
}
