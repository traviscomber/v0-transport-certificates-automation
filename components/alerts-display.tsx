'use client'

import { AlertCircle, Clock, Info, X } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Alert as AlertType, sortAlertsByUrgency } from '@/lib/operations/alert-system'
import { useState } from 'react'

interface AlertsDisplayProps {
  alerts: AlertType[]
  onDismiss?: (alertId: string) => void
}

export function AlertsDisplay({ alerts: initialAlerts, onDismiss }: AlertsDisplayProps) {
  const [dismissedAlerts, setDismissedAlerts] = useState<Set<string>>(new Set())

  const alerts = sortAlertsByUrgency(
    initialAlerts.filter(a => !dismissedAlerts.has(a.id))
  )

  const handleDismiss = (alertId: string) => {
    const newDismissed = new Set(dismissedAlerts)
    newDismissed.add(alertId)
    setDismissedAlerts(newDismissed)
    onDismiss?.(alertId)
  }

  if (alerts.length === 0) {
    return null
  }

  const criticalAlerts = alerts.filter(a => a.level === 'critical')
  const warningAlerts = alerts.filter(a => a.level === 'warning')
  const infoAlerts = alerts.filter(a => a.level === 'info')

  return (
    <div className="space-y-4">
      {/* Critical Alerts */}
      {criticalAlerts.length > 0 && (
        <Card className="border-red-300 bg-red-50/50">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-red-600" />
              <CardTitle className="text-red-900">Alertas Críticas ({criticalAlerts.length})</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {criticalAlerts.map(alert => (
              <AlertCard key={alert.id} alert={alert} onDismiss={handleDismiss} />
            ))}
          </CardContent>
        </Card>
      )}

      {/* Warning Alerts */}
      {warningAlerts.length > 0 && (
        <Card className="border-yellow-300 bg-yellow-50/50">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-yellow-600" />
              <CardTitle className="text-yellow-900">Advertencias ({warningAlerts.length})</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {warningAlerts.map(alert => (
              <AlertCard key={alert.id} alert={alert} onDismiss={handleDismiss} />
            ))}
          </CardContent>
        </Card>
      )}

      {/* Info Alerts */}
      {infoAlerts.length > 0 && (
        <Card className="border-blue-300 bg-blue-50/50">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Info className="h-5 w-5 text-blue-600" />
              <CardTitle className="text-blue-900">Información ({infoAlerts.length})</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {infoAlerts.map(alert => (
              <AlertCard key={alert.id} alert={alert} onDismiss={handleDismiss} />
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  )
}

interface AlertCardProps {
  alert: AlertType
  onDismiss: (alertId: string) => void
}

function AlertCard({ alert, onDismiss }: AlertCardProps) {
  const levelConfig = {
    critical: { bgColor: 'bg-red-100', textColor: 'text-red-800', borderColor: 'border-red-300' },
    warning: { bgColor: 'bg-yellow-100', textColor: 'text-yellow-800', borderColor: 'border-yellow-300' },
    info: { bgColor: 'bg-blue-100', textColor: 'text-blue-800', borderColor: 'border-blue-300' }
  }

  const config = levelConfig[alert.level]

  return (
    <div className={`flex items-start justify-between p-3 rounded-lg border ${config.borderColor} ${config.bgColor}`}>
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <h4 className={`font-semibold ${config.textColor}`}>{alert.title}</h4>
          <Badge variant="outline" className={`text-xs ${config.textColor}`}>
            {alert.entityType}
          </Badge>
        </div>

        <p className={`text-sm mt-1 ${config.textColor}`}>{alert.message}</p>

        {alert.entityName && (
          <p className={`text-sm mt-1 font-medium ${config.textColor}`}>
            Entidad: {alert.entityName}
          </p>
        )}

        {alert.actionRequired && (
          <div className={`text-sm mt-2 p-2 rounded ${config.bgColor} border ${config.borderColor}`}>
            <p className="font-medium">Acción requerida:</p>
            <p>{alert.actionRequired}</p>
          </div>
        )}

        {alert.dueDate && (
          <p className={`text-xs mt-2 ${config.textColor}`}>
            Vencimiento: {new Date(alert.dueDate).toLocaleDateString('es-CL')}
          </p>
        )}
      </div>

      <Button
        variant="ghost"
        size="sm"
        onClick={() => onDismiss(alert.id)}
        className="ml-2 h-6 w-6 p-0 hover:bg-white/50"
      >
        <X className="h-4 w-4" />
      </Button>
    </div>
  )
}
