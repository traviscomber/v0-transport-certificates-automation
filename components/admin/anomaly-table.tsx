'use client'

import { AnomalyWithDetails, AnomalySeverity } from '@/lib/anomalies/types'
import { getSeverityBadgeColor, getAnomalyTypeLabel } from '@/lib/anomalies/utils'
import { Button } from '@/components/ui/button'
import { AlertTriangle, CheckCircle, XCircle, Eye } from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

interface AnomalyTableProps {
  anomalies: AnomalyWithDetails[]
  loading?: boolean
  onViewDetails: (anomaly: AnomalyWithDetails) => void
}

export function AnomalyTable({ anomalies, loading, onViewDetails }: AnomalyTableProps) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <p className="text-muted-foreground">Cargando anomalías...</p>
      </div>
    )
  }

  if (anomalies.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <CheckCircle className="h-12 w-12 text-green-500 mb-4" />
        <p className="text-lg font-semibold text-foreground">Sin anomalías detectadas</p>
        <p className="text-sm text-muted-foreground mt-2">Todos los documentos se ven bien.</p>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b bg-muted/50">
            <th className="px-4 py-3 text-left font-semibold">Tipo de Anomalía</th>
            <th className="px-4 py-3 text-left font-semibold">Severidad</th>
            <th className="px-4 py-3 text-left font-semibold">Documento</th>
            <th className="px-4 py-3 text-left font-semibold">Conductor</th>
            <th className="px-4 py-3 text-left font-semibold">Detectado</th>
            <th className="px-4 py-3 text-left font-semibold">Estado</th>
            <th className="px-4 py-3 text-right font-semibold">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {anomalies.map(anomaly => (
            <tr key={anomaly.id} className="border-b hover:bg-muted/50 transition-colors">
              <td className="px-4 py-3">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-orange-500 flex-shrink-0" />
                  <span>{getAnomalyTypeLabel(anomaly.anomaly_type)}</span>
                </div>
              </td>
              <td className="px-4 py-3">
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold text-white ${getSeverityBadgeColor(anomaly.severity as AnomalySeverity)}`}>
                  {anomaly.severity.charAt(0).toUpperCase() + anomaly.severity.slice(1)}
                </span>
              </td>
              <td className="px-4 py-3">
                <div className="flex flex-col">
                  <span className="font-medium">{anomaly.document_type}</span>
                  <span className="text-xs text-muted-foreground">{anomaly.status}</span>
                </div>
              </td>
              <td className="px-4 py-3">
                <div className="flex flex-col">
                  <span className="font-medium">{anomaly.driver_name || 'N/A'}</span>
                  <span className="text-xs text-muted-foreground">{anomaly.driver_rut || ''}</span>
                </div>
              </td>
              <td className="px-4 py-3 text-sm">
                {format(new Date(anomaly.detected_at), 'dd MMM yyyy HH:mm', { locale: es })}
              </td>
              <td className="px-4 py-3">
                {anomaly.action_taken ? (
                  <div className="flex items-center gap-2">
                    {anomaly.action_taken === 'approved' && (
                      <>
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span className="text-xs text-green-700">Aprobado</span>
                      </>
                    )}
                    {anomaly.action_taken === 'rejected' && (
                      <>
                        <XCircle className="h-4 w-4 text-red-500" />
                        <span className="text-xs text-red-700">Rechazado</span>
                      </>
                    )}
                    {anomaly.action_taken === 'investigated' && (
                      <>
                        <AlertTriangle className="h-4 w-4 text-blue-500" />
                        <span className="text-xs text-blue-700">Investigado</span>
                      </>
                    )}
                  </div>
                ) : (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-800">
                    Pendiente
                  </span>
                )}
              </td>
              <td className="px-4 py-3 text-right">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onViewDetails(anomaly)}
                  className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                >
                  <Eye className="h-4 w-4 mr-1" />
                  Ver
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
