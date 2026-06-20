'use client'

import { useState, useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { AlertBanner } from '../charts/alert-banner'
import { Alert, AlertSeverity, detectDocumentAnomalies, getAlertRecommendations } from '@/lib/anomaly-detection'
import { AlertCircle, AlertTriangle, Info, CheckCircle2, ChevronDown, ChevronUp, Filter } from 'lucide-react'

interface AlertManagementPanelProps {
  documents?: any[]
  conductors?: any[]
  title?: string
  showRecommendations?: boolean
  maxAlertsVisible?: number
}

const SEVERITY_ICONS: Record<AlertSeverity, JSX.Element> = {
  critical: <AlertCircle className="h-5 w-5 text-red-500" />,
  warning: <AlertTriangle className="h-5 w-5 text-yellow-500" />,
  info: <Info className="h-5 w-5 text-blue-500" />,
  success: <CheckCircle2 className="h-5 w-5 text-green-500" />,
}

const SEVERITY_ORDER: Record<AlertSeverity, number> = {
  critical: 0,
  warning: 1,
  info: 2,
  success: 3,
}

export function AlertManagementPanel({
  documents = [],
  conductors = [],
  title = 'Centro de Alertas',
  showRecommendations = true,
  maxAlertsVisible = 5,
}: AlertManagementPanelProps) {
  const [dismissedAlerts, setDismissedAlerts] = useState<Set<string>>(new Set())
  const [selectedSeverity, setSelectedSeverity] = useState<AlertSeverity | 'all'>('all')
  const [expandedAlert, setExpandedAlert] = useState<string | null>(null)

  // Detect anomalies
  const detectionResult = useMemo(
    () => detectDocumentAnomalies(documents, conductors),
    [documents, conductors]
  )

  // Filter and sort alerts
  const filteredAlerts = useMemo(() => {
    let alerts = detectionResult.alerts.filter((a) => !dismissedAlerts.has(a.id))

    if (selectedSeverity !== 'all') {
      alerts = alerts.filter((a) => a.severity === selectedSeverity)
    }

    return alerts.sort((a, b) => SEVERITY_ORDER[a.severity] - SEVERITY_ORDER[b.severity])
  }, [detectionResult.alerts, dismissedAlerts, selectedSeverity])

  const visibleAlerts = filteredAlerts.slice(0, maxAlertsVisible)
  const hiddenAlertCount = Math.max(0, filteredAlerts.length - maxAlertsVisible)

  const handleDismiss = (alertId: string) => {
    setDismissedAlerts((prev) => new Set([...prev, alertId]))
  }

  const handleDismissAll = () => {
    setDismissedAlerts(new Set(filteredAlerts.map((a) => a.id)))
  }

  const severity_counts = {
    critical: detectionResult.metrics.criticalCount,
    warning: detectionResult.metrics.warningCount,
    info: filteredAlerts.filter((a) => a.severity === 'info').length,
    success: filteredAlerts.filter((a) => a.severity === 'success').length,
  }

  return (
    <div className="space-y-4">
      {/* Header with metrics */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h3 className="text-lg font-semibold text-slate-100">{title}</h3>
          <p className="text-sm text-slate-400">
            {filteredAlerts.length} alertas activas {dismissedAlerts.size > 0 && `(${dismissedAlerts.size} descartadas)`}
          </p>
        </div>

        {/* Severity badge counters */}
        <div className="flex gap-2">
          <Badge variant={severity_counts.critical > 0 ? 'destructive' : 'secondary'}>
            Crítica: {severity_counts.critical}
          </Badge>
          <Badge variant={severity_counts.warning > 0 ? 'default' : 'secondary'}>
            Advertencia: {severity_counts.warning}
          </Badge>
          <Badge variant="outline">Total: {filteredAlerts.length}</Badge>
        </div>
      </div>

      {/* Filter buttons */}
      <div className="flex flex-wrap gap-2">
        <Button
          size="sm"
          variant={selectedSeverity === 'all' ? 'default' : 'outline'}
          onClick={() => setSelectedSeverity('all')}
          className="text-xs"
        >
          <Filter className="mr-1 h-3 w-3" /> Todas
        </Button>
        {(['critical', 'warning', 'info', 'success'] as const).map((severity) => (
          <Button
            key={severity}
            size="sm"
            variant={selectedSeverity === severity ? 'default' : 'outline'}
            onClick={() => setSelectedSeverity(severity)}
            className="text-xs"
          >
            {severity === 'critical' && '🔴 Crítica'}
            {severity === 'warning' && '🟡 Advertencia'}
            {severity === 'info' && '🔵 Información'}
            {severity === 'success' && '✅ OK'}
          </Button>
        ))}
      </div>

      {/* Alerts list */}
      <div className="space-y-2">
        {visibleAlerts.length > 0 ? (
          visibleAlerts.map((alert) => (
            <Card
              key={alert.id}
              className={`border-l-4 ${
                alert.severity === 'critical'
                  ? 'border-l-red-500 bg-red-500/5'
                  : alert.severity === 'warning'
                    ? 'border-l-yellow-500 bg-yellow-500/5'
                    : alert.severity === 'info'
                      ? 'border-l-blue-500 bg-blue-500/5'
                      : 'border-l-green-500 bg-green-500/5'
              }`}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex gap-3 flex-1">
                    <div className="mt-0.5">{SEVERITY_ICONS[alert.severity]}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold text-slate-100">{alert.title}</h4>
                        <span className="text-xs text-slate-500">
                          {new Date(alert.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                      <p className="text-sm text-slate-300 mb-2">{alert.description}</p>

                      {/* Expandable recommendations */}
                      {showRecommendations && expandedAlert === alert.id && (
                        <div className="mt-3 p-2 bg-slate-800/50 rounded border border-slate-700 text-xs">
                          <p className="font-semibold text-slate-300 mb-1">Recomendaciones:</p>
                          <ul className="space-y-1 text-slate-400">
                            {getAlertRecommendations(alert).map((rec, i) => (
                              <li key={i}>• {rec}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Action button */}
                      <div className="flex gap-2 mt-2">
                        {alert.action && (
                          <Button size="sm" variant="secondary" asChild className="text-xs h-8">
                            <a href={alert.action.href}>{alert.action.label}</a>
                          </Button>
                        )}
                        {showRecommendations && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() =>
                              setExpandedAlert(expandedAlert === alert.id ? null : alert.id)
                            }
                            className="text-xs h-8"
                          >
                            {expandedAlert === alert.id ? (
                              <>
                                <ChevronUp className="mr-1 h-3 w-3" /> Ocultar
                              </>
                            ) : (
                              <>
                                <ChevronDown className="mr-1 h-3 w-3" /> Detalles
                              </>
                            )}
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Dismiss button */}
                  {alert.dismissible !== false && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDismiss(alert.id)}
                      className="text-xs h-8 px-2"
                    >
                      ✕
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card className="border-l-4 border-l-green-500 bg-green-500/5">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="h-5 w-5 text-green-500" />
                <div>
                  <h4 className="font-semibold text-slate-100">Sistema Operando Normalmente</h4>
                  <p className="text-sm text-slate-400">No hay alertas en este momento</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Show more indicator */}
        {hiddenAlertCount > 0 && (
          <Card className="border-slate-700 bg-slate-800/30">
            <CardContent className="p-3 text-center">
              <p className="text-sm text-slate-400">
                +{hiddenAlertCount} alerta{hiddenAlertCount > 1 ? 's' : ''} más
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Actions footer */}
      {dismissedAlerts.size > 0 && (
        <Button
          size="sm"
          variant="outline"
          onClick={handleDismissAll}
          className="w-full text-xs"
        >
          Descartar todas las alertas visibles
        </Button>
      )}
    </div>
  )
}
