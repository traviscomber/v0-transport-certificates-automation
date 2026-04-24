'use client'

import { useState, useEffect } from 'react'
import { HelpBox } from '@/components/ui/help-box'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { RefreshCw } from 'lucide-react'
import { AlertTriangle, AlertCircle, CheckCircle, Info } from 'lucide-react'

interface Alert {
  id: string
  type: 'warning' | 'error' | 'success' | 'info'
  title: string
  description: string
  timestamp: Date
  entityType?: string
  entityName?: string
  actionUrl?: string
  actionLabel?: string
}

export default function AlertasPage() {
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedType, setSelectedType] = useState('')

  // Load alerts on mount
  useEffect(() => {
    loadAlerts()
  }, [])

  const loadAlerts = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/alerts/generate')
      const data = await response.json()
      
      if (data.alerts) {
        setAlerts(data.alerts)
        console.log('[v0] Loaded', data.alerts.length, 'alerts')
      }
    } catch (error) {
      console.error('[v0] Error loading alerts:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const filteredAlerts = alerts.filter((alert) => {
    const matchesSearch = 
      alert.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      alert.description.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesType = !selectedType || alert.type === selectedType
    
    return matchesSearch && matchesType
  })

  const stats = {
    total: alerts.length,
    warnings: alerts.filter(a => a.type === 'warning').length,
    errors: alerts.filter(a => a.type === 'error').length,
    success: alerts.filter(a => a.type === 'success').length,
    info: alerts.filter(a => a.type === 'info').length,
  }

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-orange-500" />
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-500" />
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-500" />
      case 'info':
        return <Info className="w-5 h-5 text-blue-500" />
      default:
        return <Info className="w-5 h-5 text-gray-500" />
    }
  }

  const getAlertColor = (type: string) => {
    switch (type) {
      case 'warning':
        return 'border-orange-200 bg-orange-50'
      case 'error':
        return 'border-red-200 bg-red-50'
      case 'success':
        return 'border-green-200 bg-green-50'
      case 'info':
        return 'border-blue-200 bg-blue-50'
      default:
        return 'border-gray-200 bg-gray-50'
    }
  }

  const formatTime = (date: Date) => {
    const d = new Date(date)
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
      <div className="grid grid-cols-5 gap-4">
        <div className="p-4 bg-card border border-border rounded-lg">
          <div className="text-sm text-muted-foreground font-medium">Total</div>
          <div className="text-2xl font-bold text-foreground">{stats.total}</div>
        </div>
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg dark:bg-red-950/30 dark:border-red-900">
          <div className="text-sm text-red-700 font-medium dark:text-red-300">Errores</div>
          <div className="text-2xl font-bold text-red-700 dark:text-red-300">{stats.errors}</div>
        </div>
        <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg dark:bg-orange-950/30 dark:border-orange-900">
          <div className="text-sm text-orange-700 font-medium dark:text-orange-300">Advertencias</div>
          <div className="text-2xl font-bold text-orange-700 dark:text-orange-300">{stats.warnings}</div>
        </div>
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg dark:bg-green-950/30 dark:border-green-900">
          <div className="text-sm text-green-700 font-medium dark:text-green-300">Éxito</div>
          <div className="text-2xl font-bold text-green-700 dark:text-green-300">{stats.success}</div>
        </div>
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg dark:bg-blue-950/30 dark:border-blue-900">
          <div className="text-sm text-blue-700 font-medium dark:text-blue-300">Info</div>
          <div className="text-2xl font-bold text-blue-700 dark:text-blue-300">{stats.info}</div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <input
          type="text"
          placeholder="Buscar alertas..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="flex-1 px-3 py-2 bg-background border border-input rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
        />
        <select
          value={selectedType}
          onChange={(e) => setSelectedType(e.target.value)}
          className="px-3 py-2 bg-background border border-input rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="">Todos los tipos</option>
          <option value="error">Errores</option>
          <option value="warning">Advertencias</option>
          <option value="success">Éxito</option>
          <option value="info">Información</option>
        </select>
        <Button
          variant="outline"
          onClick={() => {
            setSearchQuery('')
            setSelectedType('')
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
                className={`p-4 border rounded-lg flex items-start gap-4 ${getAlertColor(alert.type)}`}
              >
                <div className="flex-shrink-0 mt-1">
                  {getAlertIcon(alert.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-foreground">{alert.title}</h3>
                  <p className="text-sm text-foreground/75 mt-1">{alert.description}</p>
                  <div className="flex items-center gap-3 mt-3">
                    <span className="text-xs text-muted-foreground">{formatTime(alert.timestamp)}</span>
                    {alert.entityType && (
                      <Badge variant="outline" className="text-xs">
                        {alert.entityType}
                      </Badge>
                    )}
                    {alert.actionUrl && (
                      <a
                        href={alert.actionUrl}
                        className="text-xs font-semibold text-primary hover:text-primary/80 underline"
                      >
                        {alert.actionLabel || 'Ver'}
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
