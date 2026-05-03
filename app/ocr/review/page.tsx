'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  AlertTriangle, CheckCircle, Clock, FileText, Filter, Loader2,
  RefreshCw, User, Eye, XCircle, AlertCircle, ChevronRight
} from 'lucide-react'

interface ReviewQueueItem {
  id: string
  document_id: string
  priority: 'critical' | 'high' | 'medium' | 'low'
  status: 'pending' | 'in_review' | 'completed' | 'escalated'
  review_reason: string
  confidence_score: number | null
  flags: any[]
  assigned_to: string | null
  sla_deadline: string
  sla_breached: boolean
  sla_status: 'ok' | 'warning' | 'urgent' | 'breached'
  hours_remaining: number
  created_at: string
  document_type_code?: string
  document_type_name?: string
  document_category?: string
}

interface QueueStats {
  total: number
  pending: number
  inReview: number
  completed: number
  escalated: number
  byPriority: { critical: number; high: number; medium: number; low: number }
  slaBreach: { breached: number; urgent: number; warning: number; ok: number }
}

const priorityConfig: Record<string, { label: string; className: string }> = {
  critical: { label: 'Crítica',  className: 'bg-red-500/20 text-red-300 border border-red-500/30' },
  high:     { label: 'Alta',     className: 'bg-orange-500/20 text-orange-300 border border-orange-500/30' },
  medium:   { label: 'Media',    className: 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30' },
  low:      { label: 'Baja',     className: 'bg-green-500/20 text-green-300 border border-green-500/30' },
}

const slaConfig: Record<string, { icon: any; color: string; label: string }> = {
  breached: { icon: XCircle,       color: 'text-red-400',    label: 'SLA Vencido' },
  urgent:   { icon: AlertTriangle, color: 'text-orange-400', label: 'Urgente' },
  warning:  { icon: Clock,         color: 'text-yellow-400', label: 'Por vencer' },
  ok:       { icon: CheckCircle,   color: 'text-green-400',  label: 'En tiempo' },
}

function PriorityBadge({ priority }: { priority: string }) {
  const cfg = priorityConfig[priority] || priorityConfig.medium
  return <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${cfg.className}`}>{cfg.label}</span>
}

function SLAStatus({ status, hoursRemaining }: { status: string; hoursRemaining: number }) {
  const cfg = slaConfig[status] || slaConfig.ok
  const Icon = cfg.icon
  return (
    <div className={`flex items-center gap-1.5 text-xs ${cfg.color}`}>
      <Icon className="w-3.5 h-3.5" />
      <span>{cfg.label}</span>
      {hoursRemaining > 0 && status !== 'breached' && (
        <span className="opacity-75">({Math.round(hoursRemaining)}h)</span>
      )}
    </div>
  )
}

function QueueItem({ item, selected, onSelect }: { item: ReviewQueueItem; selected: boolean; onSelect: () => void }) {
  return (
    <Card
      className={`cursor-pointer transition-all hover:-translate-y-0.5 ${selected ? 'border-primary shadow-lg shadow-primary/20' : 'border-border hover:border-primary/40'}`}
      onClick={onSelect}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <PriorityBadge priority={item.priority} />
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-secondary text-muted-foreground">
                {item.document_type_name || 'Sin clasificar'}
              </span>
            </div>
            <p className="text-sm font-medium text-foreground truncate mb-1">{item.review_reason}</p>
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <span>ID: {item.document_id.slice(0, 8)}...</span>
              {item.confidence_score && <span>Confianza: {Math.round(item.confidence_score * 100)}%</span>}
            </div>
          </div>
          <div className="flex flex-col items-end gap-2 flex-shrink-0">
            <SLAStatus status={item.sla_status} hoursRemaining={item.hours_remaining} />
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function ReviewPanel({ item, onClose, onAction }: {
  item: ReviewQueueItem; onClose: () => void; onAction: (action: string, data?: any) => Promise<void>
}) {
  const [loading, setLoading] = useState(false)
  const [notes, setNotes] = useState('')

  const handle = async (action: string) => {
    setLoading(true)
    await onAction(action, { notes })
    setLoading(false)
  }

  return (
    <Card className="border-primary/50 shadow-lg shadow-primary/10 animate-scale-in">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">Revisar Documento</CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>Cerrar</Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-3 p-4 bg-secondary/40 rounded-lg border border-border text-sm">
          {[
            ['ID Documento', item.document_id.slice(0, 12) + '...'],
            ['Tipo', item.document_type_name || 'Sin clasificar'],
            ['Motivo', item.review_reason],
            ['Confianza OCR', item.confidence_score ? `${Math.round(item.confidence_score * 100)}%` : 'N/A'],
          ].map(([label, value]) => (
            <div key={label}>
              <p className="text-xs text-muted-foreground mb-0.5">{label}</p>
              <p className="font-medium text-foreground text-xs">{value}</p>
            </div>
          ))}
        </div>

        {item.flags?.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Alertas Detectadas</p>
            {item.flags.map((flag: any, i: number) => (
              <div key={i} className={`flex items-start gap-2 p-2.5 rounded-lg text-xs ${
                flag.level === 'critical' ? 'bg-red-500/10 text-red-300 border border-red-500/20' :
                flag.level === 'warning'  ? 'bg-yellow-500/10 text-yellow-300 border border-yellow-500/20' :
                'bg-blue-500/10 text-blue-300 border border-blue-500/20'
              }`}>
                <AlertCircle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
                {flag.message}
              </div>
            ))}
          </div>
        )}

        <div>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Notas (opcional)</p>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Escribe cualquier observación sobre este documento..."
            className="w-full p-3 rounded-lg border border-border bg-secondary/40 text-foreground text-sm min-h-[80px] resize-none focus:outline-none focus:border-primary/50 transition-colors"
          />
        </div>

        <div className="grid grid-cols-3 gap-2 pt-1">
          <Button
            className="bg-green-600 hover:bg-green-700 text-white"
            onClick={() => handle('approve')}
            disabled={loading}
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4 mr-1.5" />}
            Aprobar
          </Button>
          <Button
            variant="outline"
            className="border-yellow-500/50 text-yellow-400 hover:bg-yellow-500/10"
            onClick={() => handle('correct')}
            disabled={loading}
          >
            <Eye className="w-4 h-4 mr-1.5" />
            Corregir
          </Button>
          <Button
            variant="outline"
            className="border-red-500/50 text-red-400 hover:bg-red-500/10"
            onClick={() => handle('reject')}
            disabled={loading}
          >
            <XCircle className="w-4 h-4 mr-1.5" />
            Rechazar
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

export default function ReviewPage() {
  const [loading, setLoading] = useState(true)
  const [queue, setQueue] = useState<ReviewQueueItem[]>([])
  const [stats, setStats] = useState<QueueStats>({
    total: 0, pending: 0, inReview: 0, completed: 0, escalated: 0,
    byPriority: { critical: 0, high: 0, medium: 0, low: 0 },
    slaBreach: { breached: 0, urgent: 0, warning: 0, ok: 0 }
  })
  const [selectedItem, setSelectedItem] = useState<ReviewQueueItem | null>(null)
  const [filter, setFilter] = useState('all')
  const [error, setError] = useState<string | null>(null)

  const loadQueue = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch('/api/v2/review-queue')
      const data = await response.json()
      if (data.success) {
        setQueue(data.items || [])
        setStats(data.stats || stats)
      } else {
        setError(data.error?.includes('does not exist') ? 'setup_required' : (data.error || 'Error cargando la cola'))
      }
    } catch {
      setError('Error de conexión.')
    } finally {
      setLoading(false)
    }
  }

  const handleReviewAction = async (action: string, data?: any) => {
    if (!selectedItem) return
    try {
      const response = await fetch(`/api/v2/review-queue/${selectedItem.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'complete', reviewerId: 'demo-user',
          decision: action === 'approve' ? 'approved' : action === 'reject' ? 'rejected' : 'needs_correction',
          notes: data?.notes
        })
      })
      const result = await response.json()
      if (result.success) { setSelectedItem(null); loadQueue() }
      else alert('Error: ' + result.error)
    } catch { alert('Error al procesar') }
  }

  useEffect(() => { loadQueue() }, [])

  const filteredQueue = queue.filter(item => {
    if (filter === 'all') return true
    if (filter === 'urgent') return item.sla_status === 'urgent' || item.sla_status === 'breached'
    return item.priority === filter
  })

  if (error === 'setup_required') return (
    <div className="container mx-auto py-16 px-4 max-w-xl text-center space-y-6">
      <div className="w-16 h-16 rounded-2xl gradient-accent flex items-center justify-center mx-auto glow-orange">
        <AlertTriangle className="w-8 h-8 text-white" />
      </div>
      <h2 className="text-2xl font-black">Configuración requerida</h2>
      <p className="text-muted-foreground">Las tablas de revisión no existen aún. Ejecuta el script de migración en Supabase para habilitarlas.</p>
      <Button onClick={loadQueue} className="btn-orange">
        <RefreshCw className="w-4 h-4 mr-2" />
        Verificar de nuevo
      </Button>
    </div>
  )

  return (
    <div className="container mx-auto py-8 px-4 max-w-7xl space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black">Cola de <span className="text-gradient">Revisión</span></h1>
          <p className="text-muted-foreground mt-1">Documentos que requieren validación manual</p>
        </div>
        <Button onClick={loadQueue} variant="outline" disabled={loading} className="btn-orange-outline">
          <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Actualizar
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Pendientes',  value: stats.pending,                                       icon: FileText,     bg: 'bg-blue-500/10',   color: 'text-blue-400' },
          { label: 'En Revisión', value: stats.inReview,                                      icon: User,         bg: 'bg-yellow-500/10', color: 'text-yellow-400' },
          { label: 'Urgentes',    value: stats.slaBreach.breached + stats.slaBreach.urgent,   icon: AlertTriangle,bg: 'bg-red-500/10',    color: 'text-red-400' },
          { label: 'Completados', value: stats.completed,                                     icon: CheckCircle,  bg: 'bg-green-500/10',  color: 'text-green-400' },
        ].map(({ label, value, icon: Icon, bg, color }) => (
          <Card key={label}>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className={`p-2.5 rounded-xl ${bg}`}>
                  <Icon className={`w-5 h-5 ${color}`} />
                </div>
                <div>
                  <p className="text-2xl font-black">{value}</p>
                  <p className="text-xs text-muted-foreground">{label}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main grid */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Queue list */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold">Documentos Pendientes</h2>
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-muted-foreground" />
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="text-xs border border-border rounded-lg bg-secondary text-foreground px-3 py-1.5 focus:outline-none focus:border-primary/50"
              >
                <option value="all">Todos</option>
                <option value="urgent">Urgentes</option>
                <option value="critical">Prioridad Crítica</option>
                <option value="high">Prioridad Alta</option>
                <option value="medium">Prioridad Media</option>
                <option value="low">Prioridad Baja</option>
              </select>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="flex flex-col items-center gap-3">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
                <p className="text-sm text-muted-foreground">Cargando cola...</p>
              </div>
            </div>
          ) : filteredQueue.length === 0 ? (
            <Card>
              <CardContent className="py-16 text-center">
                <CheckCircle className="w-12 h-12 mx-auto text-green-400 mb-4" />
                <p className="text-lg font-semibold">Sin documentos pendientes</p>
                <p className="text-sm text-muted-foreground mt-1">Todos los documentos han sido revisados.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {filteredQueue.map(item => (
                <QueueItem
                  key={item.id}
                  item={item}
                  selected={selectedItem?.id === item.id}
                  onSelect={() => setSelectedItem(selectedItem?.id === item.id ? null : item)}
                />
              ))}
            </div>
          )}

          {error && error !== 'setup_required' && (
            <Card className="border-destructive/30 bg-destructive/5">
              <CardContent className="py-4">
                <div className="flex items-center gap-2 text-destructive text-sm">
                  <AlertTriangle className="w-4 h-4" />
                  {error}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Detail panel */}
        <div>
          {selectedItem ? (
            <ReviewPanel item={selectedItem} onClose={() => setSelectedItem(null)} onAction={handleReviewAction} />
          ) : (
            <Card className="border-dashed border-border">
              <CardContent className="py-20 text-center">
                <Eye className="w-12 h-12 mx-auto text-muted-foreground/40 mb-4" />
                <p className="text-base font-semibold">Selecciona un documento</p>
                <p className="text-sm text-muted-foreground mt-1">Haz clic en cualquier ítem de la lista para revisarlo</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
