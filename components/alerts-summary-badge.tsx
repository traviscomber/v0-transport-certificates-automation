'use client'

import { useEffect, useState } from 'react'
import { AlertTriangle, Bell } from 'lucide-react'

interface AlertsSummaryBadgeProps {
  className?: string
  showCriticalOnly?: boolean
}

export function AlertsSummaryBadge({ className = '', showCriticalOnly = false }: AlertsSummaryBadgeProps) {
  const [alerts, setAlerts] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        setIsLoading(true)
        const response = await fetch('/api/alerts')
        if (response.ok) {
          const { data } = await response.json()
          setAlerts(data || [])
        }
      } catch (error) {
        console.error('Error fetching alerts:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchAlerts()
    const interval = setInterval(fetchAlerts, 30000)
    return () => clearInterval(interval)
  }, [])

  const criticalCount = alerts.filter(a => a.priority === 'critical').length
  const totalCount = alerts.length
  const displayCount = showCriticalOnly ? criticalCount : totalCount

  if (isLoading || displayCount === 0) return null

  return (
    <div className={`flex items-center gap-2 px-3 py-2 rounded-lg ${
      showCriticalOnly && criticalCount > 0 
        ? 'bg-red-500/20 border border-red-500/50' 
        : 'bg-orange-500/20 border border-orange-500/50'
    } ${className}`}>
      {showCriticalOnly && criticalCount > 0 ? (
        <AlertTriangle className="w-4 h-4 text-red-500" />
      ) : (
        <Bell className="w-4 h-4 text-orange-500" />
      )}
      <span className={`text-sm font-semibold ${
        showCriticalOnly && criticalCount > 0 ? 'text-red-400' : 'text-orange-400'
      }`}>
        {displayCount > 99 ? '99+' : displayCount} {showCriticalOnly ? 'Crítica' : 'Alerta'}{displayCount !== 1 ? 's' : ''}
      </span>
    </div>
  )
}
