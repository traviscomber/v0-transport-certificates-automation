'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { getRealtimeSyncService, RealtimeMessage, RealtimeMetrics } from '@/lib/realtime-sync'

/**
 * Hook for subscribing to realtime updates on a specific channel
 */
export function useRealtimeChannel(
  channel: string,
  onMessage?: (message: RealtimeMessage) => void
) {
  const [status, setStatus] = useState<'connecting' | 'connected' | 'disconnected'>('connecting')
  const subscriptionRef = useRef<ReturnType<typeof getRealtimeSyncService.prototype.subscribe> | null>(null)

  useEffect(() => {
    const syncService = getRealtimeSyncService()
    
    const handleMessage = (message: RealtimeMessage) => {
      if (message.type === 'SUBSCRIPTION_CONFIRMED') {
        setStatus('connected')
      }
      onMessage?.(message)
    }

    subscriptionRef.current = syncService.subscribe(channel, handleMessage)

    return () => {
      subscriptionRef.current?.unsubscribe()
      setStatus('disconnected')
    }
  }, [channel, onMessage])

  return { status }
}

/**
 * Hook for listening to multiple channels
 */
export function useRealtimeChannels(
  channels: string[],
  onMessage?: (message: RealtimeMessage) => void
) {
  const [status, setStatus] = useState<'connecting' | 'connected' | 'disconnected'>('connecting')
  const subscriptionsRef = useRef<ReturnType<typeof getRealtimeSyncService.prototype.subscribe>[]>([])

  useEffect(() => {
    const syncService = getRealtimeSyncService()
    subscriptionsRef.current = []

    const handleMessage = (message: RealtimeMessage) => {
      if (message.type === 'SUBSCRIPTION_CONFIRMED') {
        setStatus('connected')
      }
      onMessage?.(message)
    }

    channels.forEach((channel) => {
      const subscription = syncService.subscribe(channel, handleMessage)
      subscriptionsRef.current.push(subscription)
    })

    return () => {
      subscriptionsRef.current.forEach((sub) => sub.unsubscribe())
      subscriptionsRef.current = []
      setStatus('disconnected')
    }
  }, [channels, onMessage])

  return { status }
}

/**
 * Hook for real-time metrics updates
 */
export function useRealtimeMetrics() {
  const [metrics, setMetrics] = useState<RealtimeMetrics | null>(null)
  const [status, setStatus] = useState<'connecting' | 'connected' | 'disconnected'>('connecting')

  const handleMetricsUpdate = useCallback((message: RealtimeMessage) => {
    if (message.type === 'METRICS_SNAPSHOT') {
      setMetrics(message.data as RealtimeMetrics)
      setStatus('connected')
    }
  }, [])

  useRealtimeChannels(['metrics', 'dashboard'], handleMetricsUpdate)

  return { metrics, status }
}

/**
 * Hook for real-time document updates
 */
export function useRealtimeDocuments() {
  const [updates, setUpdates] = useState<RealtimeMessage[]>([])
  const [status, setStatus] = useState<'connecting' | 'connected' | 'disconnected'>('connecting')

  const handleDocumentUpdate = useCallback((message: RealtimeMessage) => {
    if (
      message.type === 'DOCUMENT_UPDATED' ||
      message.type === 'DOCUMENT_CREATED' ||
      message.type === 'DOCUMENT_DELETED'
    ) {
      setUpdates((prev) => [message, ...prev.slice(0, 49)]) // Keep last 50 updates
      setStatus('connected')
    }
  }, [])

  useRealtimeChannels(['documents', 'dashboard'], handleDocumentUpdate)

  return { updates, status }
}

/**
 * Hook for real-time alerts
 */
export function useRealtimeAlerts() {
  const [alerts, setAlerts] = useState<RealtimeMessage[]>([])
  const [status, setStatus] = useState<'connecting' | 'connected' | 'disconnected'>('connecting')

  const handleAlertUpdate = useCallback((message: RealtimeMessage) => {
    if (message.type === 'ALERT_TRIGGERED' || message.type === 'ALERT_RESOLVED') {
      setAlerts((prev) => [message, ...prev.slice(0, 49)])
      setStatus('connected')
    }
  }, [])

  useRealtimeChannels(['alerts', 'dashboard'], handleAlertUpdate)

  return { alerts, status }
}

/**
 * Hook for dashboard real-time connection status
 */
export function useRealtimeStatus() {
  const [status, setStatus] = useState<{
    connected: boolean
    subscriptions: number
  }>({ connected: false, subscriptions: 0 })

  useEffect(() => {
    const syncService = getRealtimeSyncService()
    const interval = setInterval(() => {
      setStatus(syncService.getStatus())
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  return status
}
