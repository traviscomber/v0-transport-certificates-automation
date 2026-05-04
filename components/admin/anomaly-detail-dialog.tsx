'use client'

import { AnomalyWithDetails } from '@/lib/anomalies/types'
import { getAnomalyTypeLabel, getSeverityColor } from '@/lib/anomalies/utils'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { AlertTriangle, CheckCircle, XCircle, Download } from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { useState } from 'react'

interface AnomalyDetailDialogProps {
  anomaly: AnomalyWithDetails | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onActionTaken?: (action: string, notes: string) => Promise<void>
  loading?: boolean
}

export function AnomalyDetailDialog({
  anomaly,
  open,
  onOpenChange,
  onActionTaken,
  loading,
}: AnomalyDetailDialogProps) {
  const [selectedAction, setSelectedAction] = useState<string | null>(null)
  const [notes, setNotes] = useState('')
  const [submitting, setSubmitting] = useState(false)

  if (!anomaly) return null

  const handleActionSubmit = async (action: string) => {
    if (!onActionTaken) return

    setSubmitting(true)
    try {
      await onActionTaken(action, notes)
      setSelectedAction(null)
      setNotes('')
      onOpenChange(false)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-orange-500" />
            Detalles de Anomalía
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Anomaly Info */}
          <div className={`rounded-lg border-2 p-4 ${getSeverityColor(anomaly.severity as any)}`}>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-semibold opacity-75">Tipo de Anomalía</p>
                <p className="text-lg font-bold">{getAnomalyTypeLabel(anomaly.anomaly_type)}</p>
              </div>
              <div>
                <p className="text-sm font-semibold opacity-75">Severidad</p>
                <p className="text-lg font-bold">
                  {anomaly.severity.charAt(0).toUpperCase() + anomaly.severity.slice(1)}
                </p>
              </div>
              {anomaly.description && (
                <div className="col-span-2">
                  <p className="text-sm font-semibold opacity-75">Descripción</p>
                  <p className="text-sm mt-1">{anomaly.description}</p>
                </div>
              )}
            </div>
          </div>

          {/* Document Info */}
          <div className="border rounded-lg p-4 space-y-3">
            <h3 className="font-semibold flex items-center gap-2">
              <Download className="h-4 w-4" />
              Información del Documento
            </h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Tipo de Documento</p>
                <p className="font-medium">{anomaly.document_type}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Estado</p>
                <p className="font-medium">{anomaly.status}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Conductor</p>
                <p className="font-medium">{anomaly.driver_name || 'N/A'}</p>
              </div>
              <div>
                <p className="text-muted-foreground">RUT Conductor</p>
                <p className="font-medium">{anomaly.driver_rut || 'N/A'}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Empresa</p>
                <p className="font-medium">{anomaly.company_name}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Detectado</p>
                <p className="font-medium">
                  {format(new Date(anomaly.detected_at), 'dd MMM yyyy HH:mm', { locale: es })}
                </p>
              </div>
            </div>
          </div>

          {/* OCR Text Preview */}
          {anomaly.ocr_text && (
            <div className="border rounded-lg p-4 space-y-2">
              <h3 className="font-semibold">Texto Extraído (OCR)</h3>
              <div className="bg-muted p-3 rounded text-sm max-h-32 overflow-y-auto whitespace-pre-wrap">
                {anomaly.ocr_text}
              </div>
            </div>
          )}

          {/* Action History */}
          {anomaly.action_taken && (
            <div className="border rounded-lg p-4 space-y-2 bg-muted/50">
              <h3 className="font-semibold flex items-center gap-2">
                {anomaly.action_taken === 'approved' && (
                  <>
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Aprobado
                  </>
                )}
                {anomaly.action_taken === 'rejected' && (
                  <>
                    <XCircle className="h-4 w-4 text-red-500" />
                    Rechazado
                  </>
                )}
                {anomaly.action_taken === 'investigated' && (
                  <>
                    <AlertTriangle className="h-4 w-4 text-blue-500" />
                    Investigado
                  </>
                )}
              </h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Acción Realizada</p>
                  <p className="font-medium">
                    {format(new Date(anomaly.action_taken_at!), 'dd MMM yyyy HH:mm', {
                      locale: es,
                    })}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Por</p>
                  <p className="font-medium">{anomaly.action_taken_by ? 'Usuario' : 'Sistema'}</p>
                </div>
              </div>
              {anomaly.action_notes && (
                <div>
                  <p className="text-muted-foreground text-xs">Notas</p>
                  <p className="text-sm mt-1">{anomaly.action_notes}</p>
                </div>
              )}
            </div>
          )}

          {/* Quick Actions */}
          {!anomaly.action_taken && onActionTaken && (
            <div className="border-t pt-4 space-y-3">
              <p className="font-semibold">Acciones Rápidas</p>
              <div className="space-y-2">
                <Textarea
                  placeholder="Agregar notas (opcional)..."
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  className="min-h-20"
                />
              </div>
              <div className="flex gap-2 justify-end">
                <Button
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                  disabled={submitting}
                >
                  Cancelar
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => handleActionSubmit('rejected')}
                  disabled={submitting || loading}
                >
                  Rechazar
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleActionSubmit('investigated')}
                  disabled={submitting || loading}
                >
                  Investigar
                </Button>
                <Button
                  onClick={() => handleActionSubmit('approved')}
                  disabled={submitting || loading}
                  className="bg-green-600 hover:bg-green-700"
                >
                  Aprobar
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
