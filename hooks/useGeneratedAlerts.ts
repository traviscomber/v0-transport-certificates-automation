'use client'

import { useState, useEffect, useCallback } from 'react'

export interface Alert {
  id: string
  type: 'warning' | 'error' | 'success' | 'info'
  title: string
  description: string
  timestamp: Date
  entityType?: 'driver' | 'subcontractor' | 'document' | 'system'
  entityId?: string
  entityName?: string
  actionUrl?: string
  actionLabel?: string
  read?: boolean
}

export function useGeneratedAlerts() {
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadAlerts = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await fetch('/api/alerts/generate')
      if (!response.ok) {
        throw new Error('Failed to generate alerts')
      }
      const data = await response.json()
      setAlerts(
        data.alerts.map((alert: any) => ({
          ...alert,
          timestamp: new Date(alert.timestamp),
        }))
      )
    } catch (err) {
      console.error('[v0] Error loading alerts:', err)
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    loadAlerts()
    // Removed auto-refresh interval to prevent losing user state/filters
    // Users can manually refresh using the Actualizar button instead
    // This prevents data loss when users are filtering or reading alerts
  }, []) // Empty dependency array - only call once on mount

  return {
    alerts,
    isLoading,
    error,
    refetch: loadAlerts,
  }
}
