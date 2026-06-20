'use client'

import { useRealtimeStatus, useRealtimeMetrics } from '@/hooks/use-realtime-sync'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { Activity, Wifi, WifiOff, Zap } from 'lucide-react'

export function RealtimeSyncIndicator() {
  const realtimeStatus = useRealtimeStatus()
  const { metrics, status } = useRealtimeMetrics()

  const isConnected = status === 'connected'
  const connectionQuality = realtimeStatus.subscriptions > 0 ? 'good' : 'fair'

  return (
    <Card className="border-slate-700 bg-slate-800/30 p-3">
      <div className="flex items-center justify-between gap-4">
        {/* Status Indicator */}
        <div className="flex items-center gap-2">
          {isConnected ? (
            <>
              <div className="relative">
                <Wifi className="h-4 w-4 text-green-500" />
                <div className="absolute inset-0 h-4 w-4 animate-pulse bg-green-500/20 rounded-full" />
              </div>
              <span className="text-xs font-semibold text-green-400">Sincronizado</span>
            </>
          ) : (
            <>
              <WifiOff className="h-4 w-4 text-slate-400" />
              <span className="text-xs font-semibold text-slate-400">Conectando...</span>
            </>
          )}
        </div>

        {/* Metrics */}
        {metrics && (
          <div className="flex items-center gap-3">
            {/* Documents Processed */}
            <div className="flex items-center gap-1">
              <Zap className="h-3 w-3 text-blue-400" />
              <span className="text-xs text-slate-300">{metrics.documentsProcessed} procesados</span>
            </div>

            {/* Active Alerts */}
            <div className="flex items-center gap-1">
              <Activity className="h-3 w-3 text-red-400" />
              <span className="text-xs text-slate-300">{metrics.alertsActive} alertas</span>
            </div>

            {/* Avg Processing Time */}
            <div className="flex items-center gap-1">
              <span className="text-xs text-slate-400">⏱</span>
              <span className="text-xs text-slate-300">{metrics.averageProcessingTime.toFixed(1)}h prom</span>
            </div>
          </div>
        )}

        {/* Connection Badge */}
        <Badge
          variant={isConnected ? 'default' : 'secondary'}
          className="text-xs gap-1"
        >
          {isConnected ? '🟢' : '🟡'} {realtimeStatus.subscriptions} canales
        </Badge>
      </div>
    </Card>
  )
}

/**
 * Simplified inline status indicator for dashboards
 */
export function RealtimeSyncStatusBadge() {
  const { status } = useRealtimeMetrics()
  const isConnected = status === 'connected'

  return (
    <div className="flex items-center gap-1">
      {isConnected ? (
        <>
          <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse" />
          <span className="text-xs text-green-400 font-semibold">En tiempo real</span>
        </>
      ) : (
        <>
          <div className="h-2 w-2 bg-slate-400 rounded-full" />
          <span className="text-xs text-slate-400 font-semibold">Modo local</span>
        </>
      )}
    </div>
  )
}
