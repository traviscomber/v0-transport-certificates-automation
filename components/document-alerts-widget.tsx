'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { FileCheck, FileX, AlertCircle, Clock } from 'lucide-react'

interface DocumentAlert {
  id: string
  title: string
  message: string
  type: 'DOCUMENT_UPLOADED' | 'DOCUMENT_VALIDATED' | 'DOCUMENT_REJECTED' | 'DOCUMENT_VALIDATION_PENDING'
  priority: 'high' | 'normal' | 'low'
  metadata: {
    document_id: string
    document_type: string
    uploader_name: string
    uploader_type: 'conductor' | 'client'
    timestamp: string
    action_url?: string
  }
  is_resolved: boolean
}

export function DocumentAlertsWidget() {
  const [alerts, setAlerts] = useState<DocumentAlert[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        const res = await fetch('/api/alerts?type=document_upload')
        const data = await res.json()
        setAlerts(data.data || [])
      } catch (error) {
        console.error('[v0] Error fetching document alerts:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchAlerts()
    const interval = setInterval(fetchAlerts, 30000) // Refresh every 30 seconds

    return () => clearInterval(interval)
  }, [])

  const getIcon = (type: string) => {
    switch (type) {
      case 'DOCUMENT_VALIDATED':
        return <FileCheck className="w-4 h-4 text-green-600" />
      case 'DOCUMENT_REJECTED':
        return <FileX className="w-4 h-4 text-red-600" />
      case 'DOCUMENT_VALIDATION_PENDING':
        return <Clock className="w-4 h-4 text-yellow-600" />
      default:
        return <AlertCircle className="w-4 h-4 text-blue-600" />
    }
  }

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'DOCUMENT_UPLOADED':
        return 'Documento Subido'
      case 'DOCUMENT_VALIDATED':
        return 'Documento Aprobado'
      case 'DOCUMENT_REJECTED':
        return 'Documento Rechazado'
      case 'DOCUMENT_VALIDATION_PENDING':
        return 'Pendiente de Validación'
      default:
        return 'Alerta de Documento'
    }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Alertas de Documentos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-muted-foreground">
            Cargando alertas...
          </div>
        </CardContent>
      </Card>
    )
  }

  if (alerts.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Alertas de Documentos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-muted-foreground py-8">
            No hay alertas de documentos en este momento
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Alertas de Documentos</span>
          <Badge variant="outline">{alerts.length}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {alerts.map((alert) => (
          <div
            key={alert.id}
            className="flex items-start gap-4 p-3 rounded-lg border border-border bg-card/50 hover:bg-card/75 transition"
          >
            <div className="mt-1">{getIcon(alert.type)}</div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h4 className="font-semibold text-sm">{getTypeLabel(alert.type)}</h4>
                <Badge
                  variant="outline"
                  className={
                    alert.priority === 'high'
                      ? 'bg-red-50 text-red-700 border-red-200'
                      : 'bg-yellow-50 text-yellow-700 border-yellow-200'
                  }
                >
                  {alert.priority === 'high' ? 'Urgente' : 'Normal'}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground mt-1">{alert.message}</p>
              <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                <span>{alert.metadata.document_type}</span>
                <span>•</span>
                <span>{alert.metadata.uploader_name}</span>
              </div>
            </div>
            {alert.metadata.action_url && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  window.location.href = alert.metadata.action_url!
                }}
              >
                Ver
              </Button>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
