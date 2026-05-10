'use client'

import { useState } from 'react'
import { Alert } from '@/lib/alerts/types'
import { getAlertColor, getPriorityLabel, getStatusLabel } from '@/lib/alerts/utils'
import { AlertCircle, AlertTriangle, Info, CheckCircle, XCircle, MessageSquare, Loader } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

interface AlertActionCardProps {
  alert: Alert
  onAction: (alertId: string, action: 'approve' | 'reject' | 'request_info', notes?: string) => Promise<void>
}

export function AlertActionCard({ alert, onAction }: AlertActionCardProps) {
  const [selectedAction, setSelectedAction] = useState<'approve' | 'reject' | 'request_info' | null>(null)
  const [notes, setNotes] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [actionComplete, setActionComplete] = useState(false)

  const handleAction = async (action: 'approve' | 'reject' | 'request_info') => {
    setIsLoading(true)
    try {
      await onAction(alert.id, action, notes)
      setActionComplete(true)
      setSelectedAction(null)
      setNotes('')
      // Reset after 3 seconds
      setTimeout(() => setActionComplete(false), 3000)
    } catch (error) {
      console.error('[v0] Error performing action:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const getAlertIcon = (priority: string) => {
    switch (priority) {
      case 'critical':
        return <AlertTriangle className="w-5 h-5 text-red-500" />
      case 'high':
        return <AlertCircle className="w-5 h-5 text-orange-500" />
      default:
        return <Info className="w-5 h-5 text-blue-500" />
    }
  }

  // If already actioned, show success state
  if (alert.status === 'resuelto' || alert.status === 'actioned') {
    return (
      <div className={`p-4 border rounded-lg flex items-start gap-4 ${getAlertColor(alert.priority, alert.is_dismissed, alert.status)}`}>
        <div className="flex-shrink-0 mt-1">
          <CheckCircle className="w-5 h-5 text-green-500" />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-1">
            <h3 className="font-semibold text-foreground dark:text-white">{alert.title}</h3>
            <Badge className="bg-green-600 text-white text-xs">Procesada</Badge>
          </div>
          <p className="text-sm text-foreground/85 dark:text-slate-200">{alert.message}</p>
          {alert.action_notes && (
            <div className="mt-2 p-2 bg-slate-900/50 rounded text-xs text-slate-300">
              <p className="font-semibold mb-1">Notas: {alert.actioned_by}</p>
              <p>{alert.action_notes}</p>
            </div>
          )}
          <div className="flex items-center gap-2 mt-3 text-xs text-foreground/70 dark:text-slate-400">
            <span>Procesada el {new Date(alert.actioned_at || '').toLocaleString('es-ES')}</span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`p-4 border rounded-lg flex flex-col gap-4 transition-all ${getAlertColor(alert.priority, alert.is_dismissed)}`}>
      {/* Alert Header */}
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0 mt-1">
          {getAlertIcon(alert.priority)}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-1">
            <h3 className="font-semibold text-foreground dark:text-white">{alert.title}</h3>
            <Badge className={`text-xs ${getPriorityLabel(alert.priority) === 'CRÍTICA' ? 'bg-red-600' : 'bg-orange-600'} text-white`}>
              {getPriorityLabel(alert.priority)}
            </Badge>
            <Badge variant="outline" className="text-xs">
              {getStatusLabel(alert.status)}
            </Badge>
          </div>
          <p className="text-sm text-foreground/85 dark:text-slate-200">{alert.message}</p>
          
          {/* Metadata */}
          {alert.metadata && (
            <div className="mt-2 text-xs text-slate-400 space-y-1">
              {alert.metadata.conductor_id && (
                <p>Conductor ID: <span className="text-slate-300 font-mono">{alert.metadata.conductor_id}</span></p>
              )}
              {alert.metadata.transportista_id && (
                <p>Transportista: <span className="text-slate-300">{alert.metadata.transportista_id}</span></p>
              )}
              {alert.metadata.document_type && (
                <p>Tipo de Documento: <span className="text-slate-300">{alert.metadata.document_type}</span></p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Action Section */}
      {!selectedAction && (
        <div className="flex gap-2 flex-wrap">
          <Button
            size="sm"
            onClick={() => setSelectedAction('approve')}
            className="bg-green-600 hover:bg-green-700 text-white text-xs"
            disabled={isLoading}
          >
            <CheckCircle className="w-3 h-3 mr-1" />
            Aprobar
          </Button>
          <Button
            size="sm"
            onClick={() => setSelectedAction('reject')}
            className="bg-red-600 hover:bg-red-700 text-white text-xs"
            disabled={isLoading}
          >
            <XCircle className="w-3 h-3 mr-1" />
            Rechazar
          </Button>
          <Button
            size="sm"
            onClick={() => setSelectedAction('request_info')}
            className="bg-yellow-600 hover:bg-yellow-700 text-white text-xs"
            disabled={isLoading}
          >
            <MessageSquare className="w-3 h-3 mr-1" />
            Solicitar Info
          </Button>
        </div>
      )}

      {/* Notes Input */}
      {selectedAction && (
        <div className="space-y-2 p-3 bg-slate-900/50 rounded">
          <p className="text-xs font-semibold text-slate-300">
            {selectedAction === 'approve' && 'Confirmar aprobación'}
            {selectedAction === 'reject' && 'Confirmar rechazo'}
            {selectedAction === 'request_info' && 'Solicitar información adicional'}
          </p>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Agregar notas (opcional)..."
            className="w-full px-3 py-2 rounded bg-slate-800 border border-slate-700 text-xs text-slate-300 placeholder:text-slate-500 focus:outline-none focus:border-slate-600"
            rows={2}
          />
          <div className="flex gap-2 justify-end">
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                setSelectedAction(null)
                setNotes('')
              }}
              className="text-xs"
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button
              size="sm"
              onClick={() => handleAction(selectedAction)}
              className={`text-xs text-white ${
                selectedAction === 'approve'
                  ? 'bg-green-600 hover:bg-green-700'
                  : selectedAction === 'reject'
                  ? 'bg-red-600 hover:bg-red-700'
                  : 'bg-yellow-600 hover:bg-yellow-700'
              }`}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader className="w-3 h-3 mr-1 animate-spin" />
                  Procesando...
                </>
              ) : (
                <>
                  {selectedAction === 'approve' && 'Confirmar Aprobación'}
                  {selectedAction === 'reject' && 'Confirmar Rechazo'}
                  {selectedAction === 'request_info' && 'Solicitar'}
                </>
              )}
            </Button>
          </div>
        </div>
      )}

      {/* Success State */}
      {actionComplete && (
        <div className="p-2 bg-green-900/50 border border-green-700 rounded text-xs text-green-400">
          ✓ Acción completada exitosamente
        </div>
      )}
    </div>
  )
}
