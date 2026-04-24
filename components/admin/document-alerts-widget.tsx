'use client'

import { useEffect, useState } from 'react'
import { useDocumentManagement } from '@/hooks/use-document-management'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { AlertTriangle, Clock, XCircle } from 'lucide-react'

interface DocumentAlert {
  document_id: string
  file_name: string
  document_type: string
  custom_code: string
  expiration_date: string
  days_remaining: number
  status: 'expired' | 'expiring_soon'
  severity: 'critical' | 'high' | 'medium'
  alert_type: 'EXPIRED' | 'URGENT' | 'WARNING'
}

interface DocumentAlertsWidgetProps {
  driverRut?: string
  daysThreshold?: number
}

export function DocumentAlertsWidget({
  driverRut,
  daysThreshold = 30
}: DocumentAlertsWidgetProps) {
  const { getAlerts } = useDocumentManagement()
  const [critical, setCritical] = useState<DocumentAlert[]>([])
  const [urgent, setUrgent] = useState<DocumentAlert[]>([])
  const [warnings, setWarnings] = useState<DocumentAlert[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadAlerts()
    const interval = setInterval(loadAlerts, 60000) // Actualizar cada minuto
    return () => clearInterval(interval)
  }, [driverRut])

  const loadAlerts = async () => {
    try {
      const alerts = await getAlerts(driverRut, daysThreshold)
      setCritical(alerts.critical)
      setUrgent(alerts.urgent)
      setWarnings(alerts.warnings)
    } catch (error) {
      console.error('Error loading alerts:', error)
    } finally {
      setLoading(false)
    }
  }

  const totalAlerts = critical.length + urgent.length + warnings.length

  if (loading) {
    return <div className="text-sm text-gray-500">Cargando alertas...</div>
  }

  if (totalAlerts === 0) {
    return (
      <div className="text-sm text-gray-500">
        ✓ Todos los documentos están al día
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Críticos */}
      {critical.length > 0 && (
        <Alert className="border-red-300 bg-red-50">
          <XCircle className="h-4 w-4 text-red-600" />
          <AlertTitle className="text-red-800">
            {critical.length} Documento{critical.length !== 1 ? 's' : ''} Vencido{critical.length !== 1 ? 's' : ''}
          </AlertTitle>
          <AlertDescription className="text-red-700">
            <div className="space-y-2 mt-2">
              {critical.map((alert) => (
                <div key={alert.document_id} className="text-sm p-2 bg-red-100 rounded">
                  <div className="font-semibold">{alert.file_name}</div>
                  <div className="text-xs">
                    Venció: {new Date(alert.expiration_date).toLocaleDateString('es-CL')}
                  </div>
                  {alert.custom_code && (
                    <div className="text-xs font-mono">{alert.custom_code}</div>
                  )}
                </div>
              ))}
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Urgentes */}
      {urgent.length > 0 && (
        <Alert className="border-orange-300 bg-orange-50">
          <AlertTriangle className="h-4 w-4 text-orange-600" />
          <AlertTitle className="text-orange-800">
            {urgent.length} Documento{urgent.length !== 1 ? 's' : ''} Vence Pronto
          </AlertTitle>
          <AlertDescription className="text-orange-700">
            <div className="space-y-2 mt-2">
              {urgent.map((alert) => (
                <div key={alert.document_id} className="text-sm p-2 bg-orange-100 rounded">
                  <div className="font-semibold">{alert.file_name}</div>
                  <div className="text-xs">
                    Vence en {alert.days_remaining} día{alert.days_remaining !== 1 ? 's' : ''}: {new Date(alert.expiration_date).toLocaleDateString('es-CL')}
                  </div>
                  {alert.custom_code && (
                    <div className="text-xs font-mono">{alert.custom_code}</div>
                  )}
                </div>
              ))}
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Advertencias */}
      {warnings.length > 0 && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Clock className="h-4 w-4 text-yellow-600" />
              {warnings.length} Documento{warnings.length !== 1 ? 's' : ''} con Vencimiento Próximo
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {warnings.map((alert) => (
                <div key={alert.document_id} className="text-sm p-2 bg-yellow-100 rounded">
                  <div className="font-semibold">{alert.file_name}</div>
                  <div className="text-xs">
                    Vence en {alert.days_remaining} días: {new Date(alert.expiration_date).toLocaleDateString('es-CL')}
                  </div>
                  {alert.custom_code && (
                    <div className="text-xs font-mono">{alert.custom_code}</div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
