/**
 * Real-time synchronization service for dashboard data
 * Uses WebSockets for bi-directional communication and instant updates
 */

export type MessageType = 
  | 'DOCUMENT_UPDATED'
  | 'DOCUMENT_CREATED'
  | 'DOCUMENT_DELETED'
  | 'ALERT_TRIGGERED'
  | 'ALERT_RESOLVED'
  | 'USER_ONLINE'
  | 'USER_OFFLINE'
  | 'METRICS_SNAPSHOT'
  | 'SUBSCRIPTION_CONFIRMED'

export interface RealtimeMessage {
  type: MessageType
  timestamp: Date
  userId?: string
  data: any
  sourceId?: string
}

export interface RealtimeSubscription {
  channel: string
  callback: (message: RealtimeMessage) => void
  unsubscribe: () => void
}

export interface RealtimeMetrics {
  documentsProcessed: number
  alertsActive: number
  usersOnline: number
  averageProcessingTime: number
  lastUpdate: Date
}

/**
 * Realtime synchronization class for dashboard updates
 * Production: use Supabase Realtime, PusherJS, or Socket.io
 * Demo: simulates updates with setInterval
 */
export class RealtimeSyncService {
  private subscriptions: Map<string, Set<(msg: RealtimeMessage) => void>> = new Map()
  private isConnected: boolean = false
  private reconnectAttempts: number = 0
  private maxReconnectAttempts: number = 5
  private reconnectDelay: number = 3000
  private simulationInterval: NodeJS.Timeout | null = null
  private metrics: RealtimeMetrics = {
    documentsProcessed: 0,
    alertsActive: 0,
    usersOnline: 1,
    averageProcessingTime: 0,
    lastUpdate: new Date(),
  }

  constructor(private wsUrl?: string) {
    this.initialize()
  }

  /**
   * Initialize the realtime connection
   * In production, connect to WebSocket server
   */
  private initialize(): void {
    if (typeof window === 'undefined') return

    // For demo: simulate real-time updates
    this.isConnected = true
    this.startSimulation()
  }

  /**
   * Subscribe to a specific channel for updates
   */
  subscribe(channel: string, callback: (message: RealtimeMessage) => void): RealtimeSubscription {
    if (!this.subscriptions.has(channel)) {
      this.subscriptions.set(channel, new Set())
    }

    const callbacks = this.subscriptions.get(channel)!
    callbacks.add(callback)

    // Send subscription confirmation
    const confirmMessage: RealtimeMessage = {
      type: 'SUBSCRIPTION_CONFIRMED',
      timestamp: new Date(),
      data: { channel, subscriberCount: callbacks.size },
    }
    callback(confirmMessage)

    return {
      channel,
      callback,
      unsubscribe: () => this.unsubscribe(channel, callback),
    }
  }

  /**
   * Unsubscribe from a channel
   */
  private unsubscribe(channel: string, callback: (msg: RealtimeMessage) => void): void {
    const callbacks = this.subscriptions.get(channel)
    if (callbacks) {
      callbacks.delete(callback)
      if (callbacks.size === 0) {
        this.subscriptions.delete(channel)
      }
    }
  }

  /**
   * Publish a message to a channel
   */
  publish(channel: string, message: RealtimeMessage): void {
    const callbacks = this.subscriptions.get(channel)
    if (callbacks) {
      callbacks.forEach((callback) => callback(message))
    }
  }

  /**
   * Publish to multiple channels
   */
  publishToChannels(channels: string[], message: RealtimeMessage): void {
    channels.forEach((channel) => this.publish(channel, message))
  }

  /**
   * Simulate real-time updates (demo mode)
   */
  private startSimulation(): void {
    if (this.simulationInterval) return

    this.simulationInterval = setInterval(() => {
      // Simulate document updates
      if (Math.random() > 0.7) {
        const message: RealtimeMessage = {
          type: 'DOCUMENT_UPDATED',
          timestamp: new Date(),
          data: {
            documentId: Math.random().toString(36).substring(7),
            status: ['approved', 'pending', 'rejected'][Math.floor(Math.random() * 3)],
            processingTime: (Math.random() * 5 + 1).toFixed(2),
          },
        }
        this.metrics.documentsProcessed++
        this.metrics.averageProcessingTime = Math.random() * 3 + 1

        this.publishToChannels(['documents', 'metrics', 'dashboard'], message)
      }

      // Simulate alerts
      if (Math.random() > 0.85) {
        const message: RealtimeMessage = {
          type: 'ALERT_TRIGGERED',
          timestamp: new Date(),
          data: {
            alertId: Math.random().toString(36).substring(7),
            severity: ['critical', 'warning', 'info'][Math.floor(Math.random() * 3)],
            message: 'Alert simulated for real-time demo',
          },
        }
        this.metrics.alertsActive++

        this.publishToChannels(['alerts', 'dashboard'], message)
      }

      // Simulate user presence
      if (Math.random() > 0.9) {
        this.metrics.usersOnline = Math.max(1, this.metrics.usersOnline + (Math.random() > 0.5 ? 1 : -1))
      }

      // Send metrics update
      this.metrics.lastUpdate = new Date()
      const metricsMessage: RealtimeMessage = {
        type: 'METRICS_SNAPSHOT',
        timestamp: new Date(),
        data: this.metrics,
      }

      this.publishToChannels(['metrics', 'dashboard'], metricsMessage)
    }, 3000) // Update every 3 seconds
  }

  /**
   * Stop simulation (called on cleanup)
   */
  stopSimulation(): void {
    if (this.simulationInterval) {
      clearInterval(this.simulationInterval)
      this.simulationInterval = null
    }
  }

  /**
   * Get connection status
   */
  getStatus(): { connected: boolean; subscriptions: number } {
    return {
      connected: this.isConnected,
      subscriptions: this.subscriptions.size,
    }
  }

  /**
   * Disconnect from realtime service
   */
  disconnect(): void {
    this.stopSimulation()
    this.subscriptions.clear()
    this.isConnected = false
  }

  /**
   * Get current metrics
   */
  getMetrics(): RealtimeMetrics {
    return { ...this.metrics }
  }

  /**
   * Reset metrics (useful for testing)
   */
  resetMetrics(): void {
    this.metrics = {
      documentsProcessed: 0,
      alertsActive: 0,
      usersOnline: 1,
      averageProcessingTime: 0,
      lastUpdate: new Date(),
    }
  }
}

// Singleton instance
let realtimeSyncInstance: RealtimeSyncService | null = null

/**
 * Get or create realtime sync service instance
 */
export function getRealtimeSyncService(): RealtimeSyncService {
  if (!realtimeSyncInstance) {
    realtimeSyncInstance = new RealtimeSyncService()
  }
  return realtimeSyncInstance
}

/**
 * Cleanup realtime service
 */
export function cleanupRealtimeSync(): void {
  if (realtimeSyncInstance) {
    realtimeSyncInstance.disconnect()
    realtimeSyncInstance = null
  }
}
