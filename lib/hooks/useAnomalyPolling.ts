import { useCallback, useEffect, useRef, useState } from 'react'

type UseAnomalyPollingOptions = {
  enabled?: boolean
  interval?: number
  companyId?: string
  onUpdate?: (data: unknown) => void
}

type AnomalyPollingState = {
  isPolling: boolean
  refreshAnomalies: () => void
}

export function useAnomalyPolling({
  enabled = false,
  interval = 5000,
  companyId,
  onUpdate,
}: UseAnomalyPollingOptions = {}): AnomalyPollingState {
  const [isPolling, setIsPolling] = useState(false)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const mountedRef = useRef(true)

  const fetchAnomalies = useCallback(async () => {
    setIsPolling(true)

    try {
      const params = new URLSearchParams()
      if (companyId) {
        params.set('company_id', companyId)
      }

      const query = params.toString()
      const response = await fetch(query ? `/api/anomalies/list?${query}` : '/api/anomalies/list', {
        cache: 'no-store',
      })

      if (!response.ok) {
        throw new Error(`Failed to fetch anomalies (${response.status})`)
      }

      const data = await response.json()
      onUpdate?.(data)
      return data
    } catch (error) {
      console.error('[v0] useAnomalyPolling error:', error)
      return null
    } finally {
      if (mountedRef.current) {
        setIsPolling(false)
      }
    }
  }, [companyId, onUpdate])

  useEffect(() => {
    mountedRef.current = true

    if (!enabled) {
      return () => {
        mountedRef.current = false
      }
    }

    void fetchAnomalies()

    intervalRef.current = setInterval(() => {
      void fetchAnomalies()
    }, interval)

    return () => {
      mountedRef.current = false
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }
  }, [enabled, fetchAnomalies, interval])

  return {
    isPolling,
    refreshAnomalies: () => {
      void fetchAnomalies()
    },
  }
}
