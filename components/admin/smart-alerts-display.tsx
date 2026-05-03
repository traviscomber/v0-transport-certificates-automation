'use client'

import { SmartAlert, getAlertColor } from '@/lib/smart-alerts-generator'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { AlertTriangle, Clock, Info, X } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'

interface SmartAlertsDisplayProps {
  alerts: SmartAlert[]
  title?: string
  limit?: number
}

export function SmartAlertsDisplay({
  alerts,
  title = 'Alertas Inteligentes',
  limit = 10,
}: SmartAlertsDisplayProps) {
  const [dismissed, setDismissed] = useState<Set<string>>(new Set())

  const visibleAlerts = alerts
    .filter(alert => !dismissed.has(alert.id))
    .slice(0, limit)

  const criticalCount = alerts.filter(a => a.alertType === 'critical').length
  const warningCount = alerts.filter(a => a.alertType === 'warning').length
  const infoCount = alerts.filter(a => a.alertType === 'info').length

  const handleDismiss = (alertId: string) => {
    const newDismissed = new Set(dismissed)
    newDismissed.add(alertId)
    setDismissed(newDismissed)
  }

  if (alerts.length === 0) {
    return (
      <Card className="border-green-200 bg-green-50">
        <CardContent className="flex items-center gap-4 py-6">
          <div className="text-3xl">✓</div>
          <div>
            <p className="font-semibold text-green-900">Todo en orden</p>
            <p className="text-sm text-green-700">
              No hay alertas activas. Todos los documentos están al día.
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              {title}
            </CardTitle>
            <CardDescription>
              {criticalCount} críticas, {warningCount} advertencias, {infoCount} informativas
            </CardDescription>
          </div>
          <div className="flex gap-2">
            {criticalCount > 0 && (
              <div className="rounded-lg bg-red-100 px-3 py-1">
                <span className="text-sm font-semibold text-red-700">
                  {criticalCount} Crítica{criticalCount !== 1 ? 's' : ''}
                </span>
              </div>
            )}
            {warningCount > 0 && (
              <div className="rounded-lg bg-yellow-100 px-3 py-1">
                <span className="text-sm font-semibold text-yellow-700">
                  {warningCount} Aviso{warningCount !== 1 ? 's' : ''}
                </span>
              </div>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {visibleAlerts.map((alert) => (
          <div
            key={alert.id}
            className={`flex items-start gap-4 rounded-lg border p-4 ${getAlertColor(
              alert.alertType
            )}`}
          >
            {/* Icon */}
            <div className="mt-1 flex-shrink-0">
              {alert.alertType === 'critical' && (
                <AlertTriangle className="h-5 w-5 text-red-600" />
              )}
              {alert.alertType === 'warning' && (
                <Clock className="h-5 w-5 text-yellow-600" />
              )}
              {alert.alertType === 'info' && (
                <Info className="h-5 w-5 text-blue-600" />
              )}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-semibold">{alert.entityName}</p>
                  <p className="text-sm mt-1">{alert.message}</p>
                  <p className="text-xs mt-2 opacity-75">
                    Vencimiento: {new Date(alert.expirationDate).toLocaleDateString('es-CL')}
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  {alert.actionUrl && (
                    <Link href={alert.actionUrl}>
                      <Button
                        size="sm"
                        variant={
                          alert.alertType === 'critical'
                            ? 'destructive'
                            : 'outline'
                        }
                      >
                        Ver
                      </Button>
                    </Link>
                  )}
                  <button
                    onClick={() => handleDismiss(alert.id)}
                    className="rounded p-1 hover:bg-black/10 transition-colors"
                    title="Descartar"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* View All Link */}
        {alerts.length > limit && (
          <Link href="/admin/alerts" className="block text-center mt-4">
            <Button variant="ghost" size="sm">
              Ver todas las alertas ({alerts.length})
            </Button>
          </Link>
        )}
      </CardContent>
    </Card>
  )
}
