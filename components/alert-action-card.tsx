'use client'

import Link from 'next/link'
import { useState } from 'react'
import { AlertCircle, AlertTriangle, Building2, Check, CheckCircle2, FileText, Info, Loader2, MessageSquare } from 'lucide-react'
import { Alert } from '@/lib/alerts/types'
import { Button } from '@/components/ui/button'

interface AlertActionCardProps {
  alert: Alert
  onAction: (alertId: string, action: 'resolve' | 'request_info', notes?: string) => Promise<void>
}

export function AlertActionCard({ alert, onAction }: AlertActionCardProps) {
  const [selectedAction, setSelectedAction] = useState<'resolve' | 'request_info' | null>(null)
  const [notes, setNotes] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [actionComplete, setActionComplete] = useState(false)

  const transportistaNombre = alert.metadata?.transportista_nombre || alert.metadata?.transportista_razon_social
  const transportistaRut = alert.metadata?.transportista_rut
  const documentId = alert.document_id || alert.metadata?.document_id
  const documentType = alert.document_type || alert.metadata?.document_type
  const processed = alert.status === 'resuelto' || alert.status === 'actioned'

  const handleAction = async (action: 'resolve' | 'request_info') => {
    setIsLoading(true)
    try {
      await onAction(alert.id, action, notes.trim() || undefined)
      setActionComplete(true)
      setSelectedAction(null)
      setNotes('')
      setTimeout(() => setActionComplete(false), 2500)
    } finally {
      setIsLoading(false)
    }
  }

  const priorityLabel = alert.priority === 'critical'
    ? 'Crítica'
    : alert.priority === 'high'
      ? 'Alta'
      : alert.priority === 'medium'
        ? 'Media'
        : 'Baja'

  const priorityTone = alert.priority === 'critical'
    ? 'bg-[#45242B] text-[#E17B8C]'
    : alert.priority === 'high'
      ? 'bg-[#4A2F18] text-[#E6A35A]'
      : 'bg-[var(--cf-canvas)] text-[var(--cf-text-secondary)]'

  const Icon = alert.priority === 'critical' ? AlertTriangle : alert.priority === 'high' ? AlertCircle : Info

  return (
    <article className="rounded-[6px] border border-[var(--cf-border)] bg-[var(--cf-surface)] p-4 sm:p-5">
      <div className="flex items-start gap-3">
        <div className={`mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-[5px] ${processed ? 'bg-[#173B2C]' : 'bg-[var(--cf-canvas)]'}`}>
          {processed ? <CheckCircle2 className="h-4 w-4 text-[#67C18D]" /> : <Icon className="h-4 w-4 text-[var(--cf-text-muted)]" />}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-sm font-semibold text-[var(--cf-text)]">{alert.title}</h2>
            <span className={`rounded-[4px] px-2 py-1 text-[11px] font-medium ${priorityTone}`}>{priorityLabel}</span>
            <span className={`rounded-[4px] px-2 py-1 text-[11px] font-medium ${processed ? 'bg-[#173B2C] text-[#67C18D]' : 'bg-[#40341B] text-[#D9B65C]'}`}>
              {processed ? 'Procesada' : 'Pendiente'}
            </span>
          </div>

          {(transportistaNombre || transportistaRut) && (
            <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-[var(--cf-text-muted)]">
              {transportistaNombre && (
                <span className="inline-flex items-center gap-1.5 text-[var(--cf-text-secondary)]">
                  <Building2 className="h-3.5 w-3.5" />
                  {transportistaNombre}
                </span>
              )}
              {transportistaRut && <span className="tabular-nums">RUT {String(transportistaRut)}</span>}
            </div>
          )}

          <p className="mt-3 text-sm leading-6 text-[var(--cf-text-secondary)]">{alert.message}</p>

          {(documentType || documentId) && (
            <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-[var(--cf-text-muted)]">
              <FileText className="h-3.5 w-3.5" />
              {documentType && <span>{String(documentType)}</span>}
              {documentId && <span className="font-mono">{String(documentId)}</span>}
            </div>
          )}

          {processed && alert.action_notes && (
            <div className="mt-3 border-l-2 border-[var(--cf-border)] pl-3 text-xs leading-5 text-[var(--cf-text-muted)]">
              <p>{alert.action_notes}</p>
              {alert.actioned_by && <p className="mt-1">Registrado por {alert.actioned_by}</p>}
            </div>
          )}

          {!processed && !selectedAction && (
            <div className="mt-4 flex flex-wrap gap-2">
              {documentId && (
                <Link href="/dashboard/company/documentos/pendientes">
                  <Button size="sm" className="h-9 bg-[var(--cf-accent)] text-xs text-[var(--cf-text)] hover:bg-[var(--cf-accent-hover)]">
                    <FileText className="mr-1.5 h-3.5 w-3.5" />
                    Revisar documento
                  </Button>
                </Link>
              )}
              <Button
                size="sm"
                variant="outline"
                onClick={() => setSelectedAction('resolve')}
                className="h-9 border-[var(--cf-border)] bg-transparent text-xs text-[var(--cf-text-secondary)] hover:bg-[var(--cf-surface-raised)] hover:text-[var(--cf-text)]"
              >
                <Check className="mr-1.5 h-3.5 w-3.5" />
                Marcar resuelta
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setSelectedAction('request_info')}
                className="h-9 border-[var(--cf-border)] bg-transparent text-xs text-[var(--cf-text-secondary)] hover:bg-[var(--cf-surface-raised)] hover:text-[var(--cf-text)]"
              >
                <MessageSquare className="mr-1.5 h-3.5 w-3.5" />
                Requiere seguimiento
              </Button>
            </div>
          )}

          {!processed && selectedAction && (
            <div className="mt-4 rounded-[6px] border border-[var(--cf-border)] bg-[var(--cf-canvas)] p-3">
              <p className="text-xs font-medium text-[var(--cf-text-secondary)]">
                {selectedAction === 'resolve' ? 'Registrar resolución de la alerta' : 'Mantener alerta pendiente con nota de seguimiento'}
              </p>
              <textarea
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
                placeholder="Nota de trazabilidad (opcional)"
                rows={2}
                className="mt-3 w-full resize-y rounded-[5px] border border-[var(--cf-border)] bg-[var(--cf-surface-raised)] px-3 py-2 text-xs leading-5 text-[var(--cf-text)] outline-none placeholder:text-[var(--cf-text-muted)] focus:border-[var(--cf-accent)] focus:ring-2 focus:ring-[var(--cf-focus-ring)]/30"
              />
              <div className="mt-3 flex justify-end gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setSelectedAction(null)
                    setNotes('')
                  }}
                  disabled={isLoading}
                  className="h-8 border-[var(--cf-border)] bg-transparent text-xs text-[var(--cf-text-secondary)]"
                >
                  Cancelar
                </Button>
                <Button
                  size="sm"
                  onClick={() => handleAction(selectedAction)}
                  disabled={isLoading}
                  className="h-8 bg-[var(--cf-accent)] text-xs text-[var(--cf-text)] hover:bg-[var(--cf-accent-hover)]"
                >
                  {isLoading && <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />}
                  Registrar
                </Button>
              </div>
            </div>
          )}

          {actionComplete && (
            <p className="mt-3 text-xs font-medium text-[#67C18D]">Cambio registrado.</p>
          )}
        </div>
      </div>
    </article>
  )
}
