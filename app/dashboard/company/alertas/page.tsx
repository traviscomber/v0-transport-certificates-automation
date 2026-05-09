'use client'

import { useState, useEffect } from 'react'
import { Alert } from '@/lib/alerts/types'
import { HelpBox } from '@/components/ui/help-box'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { AlertActionCard } from '@/components/alert-action-card'
import { RefreshCw, Trash2 } from 'lucide-react'
import { AlertTriangle, AlertCircle, Info } from 'lucide-react'

export default function AlertasPage() {
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedPriority, setSelectedPriority] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('')
  const [ejecutiva, setEjecutiva] = useState<string | null>(null)

  // Load alerts on mount
  useEffect(() => {
    loadAlerts()
  }, [ejecutiva, selectedStatus])

  const loadAlerts = async () => {
    setIsLoading(true)
    try {
      // For now, hardcode "Olga" as example - in production, get from user session
      const ejecutivaNombre = ejecutiva || 'Olga'
      
      const params = new URLSearchParams({
        limit: '100',
        sort: 'created_at.desc',
        ...(ejecutivaNombre && { ejecutiva: ejecutivaNombre }),
        ...(selectedStatus && { status: selectedStatus }),
      })
      
      const response = await fetch(`/api/alerts?${params.toString()}`)
      if (!response.ok) throw new Error('Failed to fetch alerts')
      
      const data = await response.json()
      if (data.alerts) {
        setAlerts(data.alerts.map((alert: any) => ({
          ...alert,
          status: alert.status || 'pendiente',
          timestamp: new Date(alert.created_at),
        })))
      }
      console.log('[v0] Loaded alerts for ejecutiva:', ejecutivaNombre, 'Count:', data.alerts?.length)
    } catch (error) {
      console.error('[v0] Error loading alerts:', error)
      setAlerts([])
    } finally {
      setIsLoading(false)
    }
  }

  const handleAlertAction = async (alertId: string, action: 'approve' | 'reject' | 'request_info', notes?: string) => {
    try {
      const response = await fetch(`/api/alerts/${alertId}/action`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-ejecutiva-name': ejecutiva || 'Olga',
        },
        body: JSON.stringify({ action, notes }),
      })

      if (!response.ok) throw new Error('Failed to process alert action')

      const result = await response.json()
      console.log('[v0] Alert action completed:', result)
      
      // Reload alerts after action
      await loadAlerts()
    } catch (error) {
      console.error('[v0] Error performing alert action:', error)
      throw error
    }
  }

  const deleteAlert = async (alertId: string) => {
    try {
      const response = await fetch(`/api/alerts/${alertId}`, {
        method: 'DELETE',
      })
      
      if (!response.ok) throw new Error('Failed to delete alert')
      
      // Remove alert from local state
      setAlerts(alerts.filter(a => a.id !== alertId))
    } catch (error) {
      console.error('[v0] Error deleting alert:', error)
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
    pending: alerts.filter(a => a.status === 'pendiente').length,
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
          <p className="text-foreground/80">
            Alertas para <span className="font-semibold text-orange-400">{ejecutiva || 'Olga'}</span>
          </p>
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
        title="Centro de Alertas Personalizadas"
        description="Ves solo tus alertas. Usa los botones de acción para aprobar, rechazar o solicitar información sobre documentos."
        tips={[
          "Haz clic en 'Actualizar' para cargar nuevas alertas",
          "Usa 'Aprobar', 'Rechazar' o 'Solicitar Info' directamente en cada alerta",
          "Las alertas resueltas se mostrarán en verde",
          "Filtra por estado, prioridad o categoría según sea necesario",
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
        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg dark:bg-yellow-950/30 dark:border-yellow-900">
          <div className="text-sm text-yellow-700 font-medium dark:text-yellow-300">Pendientes</div>
          <div className="text-2xl font-bold text-yellow-700 dark:text-yellow-300">{stats.pending}</div>
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
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          className="px-3 py-2 bg-background border border-input rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="">Todos los estados</option>
          <option value="pendiente">Pendiente</option>
          <option value="actioned">Procesada</option>
          <option value="resuelto">Resuelto</option>
        </select>
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
        <Button
          variant="outline"
          onClick={() => {
            setSearchQuery('')
            setSelectedPriority('')
            setSelectedCategory('')
            setSelectedStatus('')
          }}
        >
          Limpiar
        </Button>
      </div>

      {/* Alerts List with Action Cards */}
      <div>
        {isLoading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Cargando alertas para {ejecutiva || 'Olga'}...</p>
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
              <AlertActionCard
                key={alert.id}
                alert={alert}
                onAction={handleAlertAction}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

