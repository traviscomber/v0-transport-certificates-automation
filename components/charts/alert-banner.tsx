'use client'

import { AlertCircle, AlertTriangle, CheckCircle, Info, X } from 'lucide-react'
import { useState } from 'react'

export type AlertLevel = 'critical' | 'warning' | 'info' | 'success'

interface Alert {
  id: string
  level: AlertLevel
  title: string
  message: string
  action?: {
    label: string
    onClick: () => void
  }
}

interface AlertBannerProps {
  alerts: Alert[]
  onDismiss?: (id: string) => void
}

const alertConfig = {
  critical: {
    bg: 'bg-red-900/20 border-red-700/30',
    icon: AlertCircle,
    iconColor: 'text-red-400',
    textColor: 'text-red-100',
  },
  warning: {
    bg: 'bg-yellow-900/20 border-yellow-700/30',
    icon: AlertTriangle,
    iconColor: 'text-yellow-400',
    textColor: 'text-yellow-100',
  },
  info: {
    bg: 'bg-blue-900/20 border-blue-700/30',
    icon: Info,
    iconColor: 'text-blue-400',
    textColor: 'text-blue-100',
  },
  success: {
    bg: 'bg-green-900/20 border-green-700/30',
    icon: CheckCircle,
    iconColor: 'text-green-400',
    textColor: 'text-green-100',
  },
}

export function AlertBanner({ alerts, onDismiss }: AlertBannerProps) {
  const [dismissed, setDismissed] = useState<Set<string>>(new Set())

  if (alerts.length === 0) return null

  const visibleAlerts = alerts.filter(a => !dismissed.has(a.id))
  if (visibleAlerts.length === 0) return null

  return (
    <div className="space-y-2 mb-6">
      {visibleAlerts.map(alert => {
        const config = alertConfig[alert.level]
        const IconComponent = config.icon

        return (
          <div
            key={alert.id}
            className={`flex items-start gap-3 p-3 rounded-lg border ${config.bg}`}
          >
            <IconComponent className={`w-5 h-5 mt-0.5 flex-shrink-0 ${config.iconColor}`} />

            <div className="flex-1 min-w-0">
              <h3 className={`font-semibold text-sm ${config.textColor}`}>{alert.title}</h3>
              <p className={`text-xs mt-1 opacity-90 ${config.textColor}`}>{alert.message}</p>

              {alert.action && (
                <button
                  onClick={alert.action.onClick}
                  className={`text-xs font-medium mt-2 underline opacity-75 hover:opacity-100 transition-opacity ${config.textColor}`}
                >
                  {alert.action.label}
                </button>
              )}
            </div>

            <button
              onClick={() => {
                setDismissed(prev => new Set(prev).add(alert.id))
                onDismiss?.(alert.id)
              }}
              className={`flex-shrink-0 opacity-50 hover:opacity-100 transition-opacity ${config.textColor}`}
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )
      })}
    </div>
  )
}
