'use client'

import { useState, useEffect } from 'react'
import { HelpBox } from '@/components/ui/help-box'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { RefreshCw, Copy, Check } from 'lucide-react'
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
  const [copiedRut, setCopiedRut] = useState<string | null>(null)

  // Load alerts on mount
  useEffect(() => {
    loadAlerts()
  }, [])

  const loadAlerts = async () => {
    setIsLoading(true)
    try {
      console.log('[v0] Fetching alerts from /api/alerts/generate...')
      const response = await fetch('/api/alerts/generate')
      console.log('[v0] Response status:', response.status)
      const data = await response.json()
      console.log('[v0] Response data:', data)
      
      if (data.alerts) {
        console.log('[v0] Loaded', data.alerts.length, 'alerts')
        // Convert timestamp strings to Date objects
        const alertsWithDates = data.alerts.map((alert: any) => ({
          ...alert,
          timestamp: new Date(alert.timestamp),
        }))
        setAlerts(alertsWithDates)
      } else {
        console.warn('[v0] No alerts property in response')
        setAlerts([])
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
        return 'border-orange-300 bg-orange-100 dark:border-orange-700 dark:bg-orange-900/50'
      case 'error':
        return 'border-red-300 bg-red-100 dark:border-red-700 dark:bg-red-900/50'
      case 'success':
        return 'border-green-300 bg-green-100 dark:border-green-700 dark:bg-green-900/50'
      case 'info':
        return 'border-blue-300 bg-blue-100 dark:border-blue-700 dark:bg-blue-900/50'
      default:
        return 'border-gray-300 bg-gray-100 dark:border-gray-700 dark:bg-gray-900/50'
    }
  }

  const formatTime = (date: Date | string) => {
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

  const handleCopyRut = async (rut: string, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    try {
      await navigator.clipboard.writeText(rut)
      setCopiedRut(rut)
      setTimeout(() => setCopiedRut(null), 2000)
    } catch (error) {
      console.error('[v0] Error copying RUT:', error)
    }
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
                className={`p-4 border rounded-lg flex items-start gap-4 transition-all ${getAlertColor(alert.type)}`}
              >
                <div className="flex-shrink-0 mt-1">
                  {getAlertIcon(alert.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-foreground dark:text-white">{alert.title}</h3>
                  <p className="text-sm text-foreground/85 dark:text-slate-200 mt-1">{alert.description}</p>
                  <div className="flex items-center gap-3 mt-3 flex-wrap">
                    <span className="text-xs text-foreground/70 dark:text-slate-400">{formatTime(alert.timestamp)}</span>
                    {alert.entityType && (
                      <Badge variant="outline" className="text-xs">
                        {alert.entityType}
                      </Badge>
                    )}
                    {alert.actionUrl && (
                      <button
                        onClick={(e) => handleCopyRut(alert.actionUrl!, e)}
                        className="flex items-center gap-1 px-2 py-1 text-xs font-semibold text-primary hover:bg-primary/10 rounded transition-colors"
                      >
                        {copiedRut === alert.actionUrl ? (
                          <>
                            <Check className="w-3 h-3" />
                            Copiado
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            {alert.actionLabel}
                          </>
                        )}
                      </button>
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
