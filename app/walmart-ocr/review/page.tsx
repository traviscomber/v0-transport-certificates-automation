'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  FileText, 
  Filter, 
  Loader2, 
  RefreshCw, 
  User,
  Eye,
  XCircle,
  AlertCircle,
  ChevronRight,
  BarChart3,
  HelpCircle
} from 'lucide-react'
import { HelpBox, QuickHelp } from '@/components/ui/help-box'

// Tipos
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
  // Datos del documento (si hay join)
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
  byPriority: {
    critical: number
    high: number
    medium: number
    low: number
  }
  slaBreach: {
    breached: number
    urgent: number
    warning: number
    ok: number
  }
}

// Componente de prioridad
function PriorityBadge({ priority }: { priority: string }) {
  const colors: Record<string, string> = {
    critical: 'bg-red-100 text-red-700 border-red-200',
    high: 'bg-orange-100 text-orange-700 border-orange-200',
    medium: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    low: 'bg-green-100 text-green-700 border-green-200'
  }
  const labels: Record<string, string> = {
    critical: 'Critica',
    high: 'Alta',
    medium: 'Media',
    low: 'Baja'
  }
  return (
    <Badge variant="outline" className={colors[priority] || colors.medium}>
      {labels[priority] || priority}
    </Badge>
  )
}

// Componente de estado SLA
function SLAStatus({ status, hoursRemaining }: { status: string; hoursRemaining: number }) {
  const config: Record<string, { icon: any; color: string; label: string }> = {
    breached: { icon: XCircle, color: 'text-red-600', label: 'SLA Vencido' },
    urgent: { icon: AlertTriangle, color: 'text-orange-600', label: 'Urgente' },
    warning: { icon: Clock, color: 'text-yellow-600', label: 'Por vencer' },
    ok: { icon: CheckCircle, color: 'text-green-600', label: 'En tiempo' }
  }
  const { icon: Icon, color, label } = config[status] || config.ok
  
  return (
    <div className={`flex items-center gap-1.5 text-sm ${color}`}>
      <Icon className="w-4 h-4" />
      <span>{label}</span>
      {hoursRemaining > 0 && status !== 'breached' && (
        <span className="text-xs opacity-75">({Math.round(hoursRemaining)}h)</span>
      )}
    </div>
  )
}

// Componente de item de cola
function QueueItem({ item, onSelect }: { item: ReviewQueueItem; onSelect: (item: ReviewQueueItem) => void }) {
  return (
    <Card 
      className="cursor-pointer hover:border-primary transition-colors"
      onClick={() => onSelect(item)}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <PriorityBadge priority={item.priority} />
              <Badge variant="secondary" className="text-xs">
                {item.document_type_name || 'Documento'}
              </Badge>
            </div>
            
            <p className="text-sm font-medium truncate mb-1">
              {item.review_reason}
            </p>
            
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <span>ID: {item.document_id.slice(0, 8)}...</span>
              {item.confidence_score && (
                <span>Confianza: {Math.round(item.confidence_score * 100)}%</span>
              )}
            </div>
          </div>
          
          <div className="flex flex-col items-end gap-2">
            <SLAStatus status={item.sla_status} hoursRemaining={item.hours_remaining} />
            <ChevronRight className="w-5 h-5 text-muted-foreground" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// Componente de estadisticas
function StatsCard({ stats }: { stats: QueueStats }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-100">
              <FileText className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.pending}</p>
              <p className="text-xs text-muted-foreground">Pendientes</p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-yellow-100">
              <User className="w-5 h-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.inReview}</p>
              <p className="text-xs text-muted-foreground">En Revision</p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-red-100">
              <AlertTriangle className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.slaBreach.breached + stats.slaBreach.urgent}</p>
              <p className="text-xs text-muted-foreground">Urgentes</p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-green-100">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.completed}</p>
              <p className="text-xs text-muted-foreground">Completados</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// Panel de detalle de revision
function ReviewDetailPanel({ 
  item, 
  onClose, 
  onAction 
}: { 
  item: ReviewQueueItem
  onClose: () => void
  onAction: (action: string, data?: any) => Promise<void>
}) {
  const [loading, setLoading] = useState(false)
  const [notes, setNotes] = useState('')

  const handleAction = async (action: string) => {
    setLoading(true)
    await onAction(action, { notes })
    setLoading(false)
  }

  return (
    <Card className="border-2 border-primary">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Revisar Documento</CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>
            Cerrar
          </Button>
        </div>
        <CardDescription>
          Revisa los datos extraidos y toma una decision
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <QuickHelp text="Lee los datos extraidos abajo. Si estan correctos, presiona 'Aprobar'. Si hay errores, puedes 'Corregir' o 'Rechazar' el documento." />
        
        {/* Info del documento */}
        <div className="grid grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg">
          <div>
            <p className="text-xs text-muted-foreground">ID Documento</p>
            <p className="font-mono text-sm">{item.document_id.slice(0, 12)}...</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Tipo</p>
            <p className="text-sm">{item.document_type_name || 'Sin clasificar'}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Razon de Revision</p>
            <p className="text-sm">{item.review_reason}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Confianza OCR</p>
            <p className="text-sm">{item.confidence_score ? `${Math.round(item.confidence_score * 100)}%` : 'N/A'}</p>
          </div>
        </div>

        {/* Flags/Alertas */}
        {item.flags && item.flags.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-medium">Alertas Detectadas:</p>
            <div className="space-y-1">
              {item.flags.map((flag: any, idx: number) => (
                <div 
                  key={idx} 
                  className={`flex items-center gap-2 p-2 rounded text-sm ${
                    flag.level === 'critical' ? 'bg-red-50 text-red-700' :
                    flag.level === 'warning' ? 'bg-yellow-50 text-yellow-700' :
                    'bg-blue-50 text-blue-700'
                  }`}
                >
                  <AlertCircle className="w-4 h-4" />
                  <span>{flag.message}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Notas */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Notas de Revision (opcional):</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Escribe aqui cualquier observacion sobre este documento..."
            className="w-full p-3 rounded-lg border text-sm min-h-[80px]"
          />
        </div>

        {/* Botones de accion */}
        <div className="flex gap-2 pt-2">
          <Button 
            className="flex-1 bg-green-600 hover:bg-green-700"
            onClick={() => handleAction('approve')}
            disabled={loading}
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4 mr-2" />}
            Aprobar
          </Button>
          <Button 
            variant="outline"
            className="flex-1 border-yellow-500 text-yellow-600 hover:bg-yellow-50"
            onClick={() => handleAction('correct')}
            disabled={loading}
          >
            <Eye className="w-4 h-4 mr-2" />
            Corregir
          </Button>
          <Button 
            variant="outline"
            className="flex-1 border-red-500 text-red-600 hover:bg-red-50"
            onClick={() => handleAction('reject')}
            disabled={loading}
          >
            <XCircle className="w-4 h-4 mr-2" />
            Rechazar
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

// Componente principal
export default function ReviewPage() {
  const [loading, setLoading] = useState(true)
  const [queue, setQueue] = useState<ReviewQueueItem[]>([])
  const [stats, setStats] = useState<QueueStats>({
    total: 0,
    pending: 0,
    inReview: 0,
    completed: 0,
    escalated: 0,
    byPriority: { critical: 0, high: 0, medium: 0, low: 0 },
    slaBreach: { breached: 0, urgent: 0, warning: 0, ok: 0 }
  })
  const [selectedItem, setSelectedItem] = useState<ReviewQueueItem | null>(null)
  const [filter, setFilter] = useState<string>('all')
  const [error, setError] = useState<string | null>(null)

  // Cargar cola de revision
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
        // Si la tabla no existe, mostrar mensaje educativo
        if (data.error?.includes('does not exist') || data.error?.includes('relation')) {
          setError('setup_required')
        } else {
          setError(data.error || 'Error al cargar la cola')
        }
      }
    } catch (err) {
      console.error('[v0] Error loading queue:', err)
      setError('Error de conexion. Verifica tu conexion a internet.')
    } finally {
      setLoading(false)
    }
  }

  // Manejar accion de revision
  const handleReviewAction = async (action: string, data?: any) => {
    if (!selectedItem) return
    
    try {
      const response = await fetch(`/api/v2/review-queue/${selectedItem.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: action === 'approve' ? 'complete' : action === 'reject' ? 'complete' : 'complete',
          reviewerId: 'demo-user', // En produccion vendria del auth
          decision: action === 'approve' ? 'approved' : action === 'reject' ? 'rejected' : 'needs_correction',
          notes: data?.notes
        })
      })
      
      const result = await response.json()
      
      if (result.success) {
        setSelectedItem(null)
        loadQueue() // Recargar cola
      } else {
        alert('Error: ' + result.error)
      }
    } catch (err) {
      console.error('[v0] Error performing action:', err)
      alert('Error al procesar la accion')
    }
  }

  useEffect(() => {
    loadQueue()
  }, [])

  // Filtrar items
  const filteredQueue = queue.filter(item => {
    if (filter === 'all') return true
    if (filter === 'urgent') return item.sla_status === 'urgent' || item.sla_status === 'breached'
    return item.priority === filter
  })

  // Si hay error de configuracion
  if (error === 'setup_required') {
    return (
      <div className="space-y-6 max-w-3xl mx-auto p-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-[#18181B]">Portal de Revision</h1>
          <p className="text-[#71717A]">Sistema de revision manual de documentos OCR</p>
        </div>

        <HelpBox
          variant="steps"
          title="Configuracion Requerida"
          description="Antes de usar el Portal de Revision, necesitas crear las tablas en tu base de datos:"
          steps={[
            {
              step: 1,
              title: "Ve a tu proyecto en Supabase",
              description: "Abre supabase.com e ingresa a tu proyecto."
            },
            {
              step: 2,
              title: "Abre el SQL Editor",
              description: "En el menu lateral, haz clic en 'SQL Editor' y luego en 'Nueva Query'."
            },
            {
              step: 3,
              title: "Ejecuta el script de migracion",
              description: "Copia el contenido del archivo scripts/create-review-queue-tables.sql y pegalo en el editor."
            },
            {
              step: 4,
              title: "Presiona Run",
              description: "Haz clic en el boton 'Run' o presiona Ctrl+Enter para ejecutar el script."
            }
          ]}
        />

        <Button onClick={loadQueue} className="w-full">
          <RefreshCw className="w-4 h-4 mr-2" />
          Verificar Configuracion
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold text-[#18181B]">Portal de Revision</h1>
          <p className="text-[#71717A]">Revisa y valida documentos que requieren atencion manual</p>
        </div>
        <Button onClick={loadQueue} variant="outline" disabled={loading}>
          <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Actualizar
        </Button>
      </div>

      {/* Ayuda educativa */}
      <HelpBox
        variant="info"
        title="Como usar el Portal de Revision"
        description="Aqui aparecen los documentos que la IA no pudo validar automaticamente y necesitan revision humana."
        tips={[
          "Los documentos con etiqueta ROJA 'Critica' o 'Urgente' deben revisarse primero.",
          "Haz clic en cualquier documento de la lista para ver sus detalles y tomar una decision.",
          "Puedes APROBAR si los datos estan correctos, CORREGIR si hay errores menores, o RECHAZAR si el documento es invalido.",
          "El tiempo SLA indica cuanto tiempo tienes para revisar cada documento antes de que se escale."
        ]}
      />

      {/* Estadisticas */}
      <StatsCard stats={stats} />

      {/* Contenido principal */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Lista de cola */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Cola de Revision</h2>
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-muted-foreground" />
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="text-sm border rounded-md px-2 py-1"
              >
                <option value="all">Todos</option>
                <option value="urgent">Urgentes</option>
                <option value="critical">Prioridad Critica</option>
                <option value="high">Prioridad Alta</option>
                <option value="medium">Prioridad Media</option>
                <option value="low">Prioridad Baja</option>
              </select>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
            </div>
          ) : filteredQueue.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <CheckCircle className="w-12 h-12 mx-auto text-green-500 mb-4" />
                <p className="text-lg font-medium">No hay documentos pendientes</p>
                <p className="text-sm text-muted-foreground">
                  Todos los documentos han sido revisados. Buen trabajo!
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {filteredQueue.map(item => (
                <QueueItem 
                  key={item.id} 
                  item={item} 
                  onSelect={setSelectedItem}
                />
              ))}
            </div>
          )}
        </div>

        {/* Panel de detalle */}
        <div>
          {selectedItem ? (
            <ReviewDetailPanel
              item={selectedItem}
              onClose={() => setSelectedItem(null)}
              onAction={handleReviewAction}
            />
          ) : (
            <Card className="border-dashed">
              <CardContent className="py-12 text-center">
                <Eye className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-lg font-medium">Selecciona un documento</p>
                <p className="text-sm text-muted-foreground">
                  Haz clic en cualquier documento de la lista para revisarlo
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Error */}
      {error && error !== 'setup_required' && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="py-4">
            <div className="flex items-center gap-2 text-red-700">
              <AlertTriangle className="w-5 h-5" />
              <span>{error}</span>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
