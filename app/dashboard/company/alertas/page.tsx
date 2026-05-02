'use client'

import { useState, useEffect } from 'react'
import { HelpBox } from '@/components/ui/help-box'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { RefreshCw } from 'lucide-react'
import { AlertTriangle, AlertCircle, Info } from 'lucide-react'

interface Alert {
  id: string
  type: string
  title: string
  message: string
  priority: 'critical' | 'high' | 'medium' | 'low'
  category?: string
  is_read: boolean
  is_dismissed: boolean
  action_url?: string
  metadata?: Record<string, any>
  created_at: string
  timestamp?: Date
}

export default function AlertasPage() {
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedPriority, setSelectedPriority] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')

  // Load alerts on mount
  useEffect(() => {
    loadAlerts()
  }, [])

  const loadAlerts = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/alerts?limit=100&sort=created_at.desc')
      if (!response.ok) throw new Error('Failed to fetch alerts')
      
      const data = await response.json()
      if (data.alerts) {
        setAlerts(data.alerts.map((alert: any) => ({
          ...alert,
          timestamp: new Date(alert.created_at),
        })))
      }
    } catch (error) {
      console.error('[v0] Error loading alerts:', error)
      setAlerts([])
    } finally {
      setIsLoading(false)
    }
  }

  const filteredAlerts = alerts.filter((alert) => {
    const matchesSearch =
      alert.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      alert.message?.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesPriority = !selectedPriority || alert.priority === selectedPriority
    const matchesCategory = !selectedCategory || alert.type === selectedCategory

    return matchesSearch && matchesPriority && matchesCategory
  })

  const stats = {
    total: alerts.length,
    critical: alerts.filter(a => a.priority === 'critical').length,
    high: alerts.filter(a => a.priority === 'high').length,
    medium: alerts.filter(a => a.priority === 'medium').length,
    low: alerts.filter(a => a.priority === 'low').length,
    unread: alerts.filter(a => !a.is_read).length,
  }

  const getAlertIcon = (priority: string) => {
    switch (priority) {
      case 'critical':
        return <AlertTriangle className="w-5 h-5 text-red-500" />
      case 'high':
        return <AlertCircle className="w-5 h-5 text-orange-500" />
      case 'medium':
        return <Info className="w-5 h-5 text-blue-500" />
      case 'low':
        return <Info className="w-5 h-5 text-gray-500" />
      default:
        return <Info className="w-5 h-5 text-gray-500" />
    }
  }

  const getAlertColor = (priority: string, isDismissed: boolean, alertType?: string) => {
    if (isDismissed) return 'border-l-4 border-l-gray-400 bg-gray-900/25 opacity-60'
    
    // Color by document status if available
    if (alertType) {
      switch (alertType) {
        case 'DOCUMENT_REJECTED':
          return 'border-l-4 border-l-orange-500 bg-orange-900/25'
        case 'DOCUMENT_APPROVED':
          return 'border-l-4 border-l-green-500 bg-green-900/25'
        case 'DOCUMENT_PENDING':
          return 'border-l-4 border-l-amber-400 bg-amber-900/40'
        default:
          break
      }
    }
    
    // Fallback to priority-based coloring
    switch (priority) {
      case 'critical':
        return 'border-l-4 border-l-red-500 bg-red-900/25'
      case 'high':
        return 'border-l-4 border-l-orange-500 bg-orange-900/25'
      case 'medium':
        return 'border-l-4 border-l-blue-500 bg-blue-900/25'
      case 'low':
        return 'border-l-4 border-l-slate-500 bg-slate-900/25'
      default:
        return 'border-l-4 border-l-slate-500 bg-slate-900/25'
    }
  }

  const getPriorityBadgeColor = (priority: string) => {
    switch (priority) {
      case 'critical':
        return 'bg-red-600 text-white'
      case 'high':
        return 'bg-orange-600 text-white'
      case 'medium':
        return 'bg-blue-600 text-white'
      case 'low':
        return 'bg-gray-600 text-white'
      default:
        return 'bg-gray-600 text-white'
    }
  }

  const formatTime = (date: string | Date) => {
    const d = typeof date === 'string' ? new Date(date) : date
    const now = new Date()
    const diff = now.getTime() - d.getTime()
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (minutes < 1) return 'Ahora'
    if (minutes < 60) return `Hace ${minutes}m`
    if (hours < 24) return `Hace ${hours}h`
    if (days < 7) return `Hace ${days}d`
    return d.toLocaleDateString('es-ES')
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Alertas y Notificaciones</h1>
          <p className="text-foreground/80">Mantente informado de eventos importantes en tu operación</p>
        </div>
        <Button
          onClick={loadAlerts}
          disabled={isLoading}
          variant="outline"
          size="sm"
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          Actualizar
        </Button>
      </div>

      {/* Help Box */}
      <HelpBox
        variant="info"
        title="Centro de Alertas"
        description="Monitorea eventos importantes en tu operación: documentos próximos a vencer, cambios de estado, y actividad del sistema."
        tips={[
          "Haz clic en 'Actualizar' para generar nuevas alertas",
          "Usa los filtros para encontrar alertas específicas",
          "Las alertas se generan en tiempo real desde los datos de tu operación",
        ]}
      />

      {/* Stats Cards */}
      <div className="grid grid-cols-6 gap-4">
        <div className="p-4 bg-card border border-border rounded-lg">
          <div className="text-sm text-muted-foreground font-medium">Total</div>
          <div className="text-2xl font-bold text-foreground">{stats.total}</div>
        </div>
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg dark:bg-red-950/30 dark:border-red-900">
          <div className="text-sm text-red-700 font-medium dark:text-red-300">Críticas</div>
          <div className="text-2xl font-bold text-red-700 dark:text-red-300">{stats.critical}</div>
        </div>
        <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg dark:bg-orange-950/30 dark:border-orange-900">
          <div className="text-sm text-orange-700 font-medium dark:text-orange-300">Altas</div>
          <div className="text-2xl font-bold text-orange-700 dark:text-orange-300">{stats.high}</div>
        </div>
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg dark:bg-blue-950/30 dark:border-blue-900">
          <div className="text-sm text-blue-700 font-medium dark:text-blue-300">Medias</div>
          <div className="text-2xl font-bold text-blue-700 dark:text-blue-300">{stats.medium}</div>
        </div>
        <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg dark:bg-gray-950/30 dark:border-gray-900">
          <div className="text-sm text-gray-700 font-medium dark:text-gray-300">Bajas</div>
          <div className="text-2xl font-bold text-gray-700 dark:text-gray-300">{stats.low}</div>
        </div>
        <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg dark:bg-purple-950/30 dark:border-purple-900">
          <div className="text-sm text-purple-700 font-medium dark:text-purple-300">No leídas</div>
          <div className="text-2xl font-bold text-purple-700 dark:text-purple-300">{stats.unread}</div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-4 flex-wrap">
        <input
          type="text"
          placeholder="Buscar alertas..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="flex-1 min-w-64 px-3 py-2 bg-background border border-input rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
        />
        <select
          value={selectedPriority}
          onChange={(e) => setSelectedPriority(e.target.value)}
          className="px-3 py-2 bg-background border border-input rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="">Todas las prioridades</option>
          <option value="critical">Crítica</option>
          <option value="high">Alta</option>
          <option value="medium">Media</option>
          <option value="low">Baja</option>
        </select>
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="px-3 py-2 bg-background border border-input rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="">Todas las categorías</option>
          <option value="DOCUMENT_REJECTED">Documentos Rechazados</option>
          <option value="DOCUMENT_APPROVED">Documentos Aprobados</option>
          <option value="DOCUMENT_EXPIRATION">Vencimientos</option>
          <option value="DOCUMENT_UPLOADED">Documentos Subidos</option>
        </select>
        <Button
          variant="outline"
          onClick={() => {
            setSearchQuery('')
            setSelectedPriority('')
            setSelectedCategory('')
          }}
        >
          Limpiar
        </Button>
      </div>

      {/* Alerts List */}
      <div>
        {isLoading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Cargando alertas...</p>
          </div>
        ) : filteredAlerts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">
              {alerts.length === 0 ? 'No hay alertas en este momento' : 'No hay alertas que coincidan con los filtros'}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredAlerts.map((alert) => (
              <div
                key={alert.id}
                className={`p-4 border rounded-lg flex items-start gap-4 transition-all ${getAlertColor(alert.priority, alert.is_dismissed, alert.type)}`}
              >
                <div className="flex-shrink-0 mt-1">
                  {getAlertIcon(alert.priority)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="font-semibold text-foreground dark:text-white">{alert.title}</h3>
                    <Badge className={getPriorityBadgeColor(alert.priority)}>
                      {alert.priority.toUpperCase()}
                    </Badge>
                    {alert.is_dismissed && (
                      <Badge variant="outline" className="text-xs">Descartada</Badge>
                    )}
                    {!alert.is_read && (
                      <div className="w-2 h-2 rounded-full bg-primary"></div>
                    )}
                  </div>
                  <p className="text-sm text-foreground/85 dark:text-slate-200">{alert.message}</p>
                  <div className="flex items-center gap-3 mt-3 flex-wrap">
                    <span className="text-xs text-foreground/70 dark:text-slate-400">{formatTime(alert.created_at)}</span>
                    {alert.category && (
                      <Badge variant="outline" className="text-xs">
                        {alert.category.replace('_', ' ')}
                      </Badge>
                    )}
                    {alert.action_url && (
                      <a
                        href={
                          alert.metadata?.conductor_id
                            ? `/dashboard/company/conductores?id=${alert.metadata.conductor_id}`
                            : alert.action_url
                        }
                        className="flex items-center gap-1 px-2 py-1 text-xs font-semibold text-primary hover:bg-primary/10 rounded transition-colors"
                      >
                        Ver detalles →
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
