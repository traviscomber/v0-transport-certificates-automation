'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { AlertCircle, AlertTriangle, Info, CheckCircle, Clock, X, ChevronRight } from 'lucide-react'
import { Input } from '@/components/ui/input'

interface Alert {
  id: string
  title: string
  message: string
  description?: string
  entity: string
  severity: 'critical' | 'warning' | 'info'
  timestamp: string
  action?: string
  details?: {
    affectedCount?: number
    nextAction?: string
    deadline?: string
  }
}

interface AlertsListProps {
  alerts?: Alert[]
}

export function AlertsList({ alerts: initialAlerts }: AlertsListProps) {
  const [alerts, setAlerts] = useState<Alert[]>(initialAlerts || [])
  const [loading, setLoading] = useState(!initialAlerts)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterSeverity, setFilterSeverity] = useState<'all' | 'critical' | 'warning' | 'info'>('all')
  const [dismissedIds, setDismissedIds] = useState<Set<string>>(new Set())
  const [selectedAlertId, setSelectedAlertId] = useState<string | null>(null)

  useEffect(() => {
    if (!initialAlerts) {
      const fetchAlerts = async () => {
        try {
          const response = await fetch('/api/company/alerts')
          const data = await response.json()
          setAlerts(data.alerts || [])
        } catch (error) {
          console.error('[v0] Error fetching alerts:', error)
        } finally {
          setLoading(false)
        }
      }
      fetchAlerts()
    }
  }, [initialAlerts])

  const filtered = alerts.filter(alert => {
    const matchesSearch = 
      alert.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      alert.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
      alert.entity.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesSeverity = filterSeverity === 'all' || alert.severity === filterSeverity
    const isNotDismissed = !dismissedIds.has(alert.id)
    
    return matchesSearch && matchesSeverity && isNotDismissed
  })

  const dismissAlert = (id: string) => {
    setDismissedIds(prev => new Set([...prev, id]))
  }

  const selectedAlert = alerts.find(a => a.id === selectedAlertId)

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical':
        return <AlertCircle className="w-5 h-5 text-red-600" />
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-amber-600" />
      case 'info':
        return <Info className="w-5 h-5 text-blue-600" />
      default:
        return <Info className="w-5 h-5" />
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-50 border-red-200 hover:border-red-300'
      case 'warning':
        return 'bg-amber-50 border-amber-200 hover:border-amber-300'
      case 'info':
        return 'bg-blue-50 border-blue-200 hover:border-blue-300'
      default:
        return 'bg-gray-50 border-gray-200'
    }
  }

  const getBadgeColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-100 text-red-800'
      case 'warning':
        return 'bg-amber-100 text-amber-800'
      case 'info':
        return 'bg-blue-100 text-blue-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const criticalCount = filtered.filter(a => a.severity === 'critical').length
  const warningCount = filtered.filter(a => a.severity === 'warning').length
  const infoCount = filtered.filter(a => a.severity === 'info').length

  return (
    <div className="space-y-6">
      {/* Filtros y búsqueda */}
      <div className="flex flex-col gap-4">
        <div className="flex gap-3 items-center">
          <div className="flex-1 relative">
            <AlertCircle className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-500" />
            <Input
              placeholder="Buscar alertas por título, mensaje o entidad..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-white border-slate-300 text-slate-900 placeholder-slate-500"
            />
          </div>
        </div>

        {/* Filtros por severidad */}
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setFilterSeverity('all')}
            className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
              filterSeverity === 'all'
                ? 'bg-slate-900 text-white'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Todas ({alerts.length - dismissedIds.size})
          </button>
          <button
            onClick={() => setFilterSeverity('critical')}
            className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
              filterSeverity === 'critical'
                ? 'bg-red-600 text-white'
                : 'bg-red-100 text-red-700 hover:bg-red-200'
            }`}
          >
            Críticas ({criticalCount})
          </button>
          <button
            onClick={() => setFilterSeverity('warning')}
            className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
              filterSeverity === 'warning'
                ? 'bg-amber-600 text-white'
                : 'bg-amber-100 text-amber-700 hover:bg-amber-200'
            }`}
          >
            Advertencias ({warningCount})
          </button>
          <button
            onClick={() => setFilterSeverity('info')}
            className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
              filterSeverity === 'info'
                ? 'bg-blue-600 text-white'
                : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
            }`}
          >
            Información ({infoCount})
          </button>
        </div>
      </div>

      {/* Resumen */}
      {!loading && (
        <div className="grid grid-cols-4 gap-3">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <AlertCircle className="w-5 h-5 text-red-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-red-600">{criticalCount}</div>
                <p className="text-xs text-slate-600">Críticas</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <AlertTriangle className="w-5 h-5 text-amber-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-amber-600">{warningCount}</div>
                <p className="text-xs text-slate-600">Advertencias</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <Info className="w-5 h-5 text-blue-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-blue-600">{infoCount}</div>
                <p className="text-xs text-slate-600">Información</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <CheckCircle className="w-5 h-5 text-green-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-green-600">{dismissedIds.size}</div>
                <p className="text-xs text-slate-600">Resueltas</p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Lista de alertas */}
      {loading ? (
        <div className="text-center py-12">
          <Clock className="w-8 h-8 text-slate-400 mx-auto mb-3 animate-spin" />
          <p className="text-slate-600">Cargando alertas...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 bg-slate-50 rounded-lg border border-slate-200">
          <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-3" />
          <p className="text-slate-700 font-medium">Todas las alertas han sido resueltas</p>
          <p className="text-slate-600 text-sm mt-1">
            {dismissedIds.size > 0 && `${dismissedIds.size} alertas dismissadas`}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((alert) => (
            <div
              key={alert.id}
              className={`p-4 rounded-lg border-2 transition-all cursor-pointer hover:shadow-md ${getSeverityColor(alert.severity)}`}
              onClick={() => setSelectedAlertId(alert.id)}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <div className="flex-shrink-0 pt-0.5">
                    {getSeverityIcon(alert.severity)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start gap-2 mb-1">
                      <h3 className="font-semibold text-slate-900">{alert.title}</h3>
                      <Badge className={`text-xs whitespace-nowrap ${getBadgeColor(alert.severity)}`}>
                        {alert.severity === 'critical' ? 'Crítica' : alert.severity === 'warning' ? 'Advertencia' : 'Info'}
                      </Badge>
                    </div>
                    <p className="text-sm text-slate-700 mb-2">{alert.message}</p>
                    <div className="flex items-center gap-4 text-xs text-slate-600">
                      <span className="font-medium">{alert.entity}</span>
                      <span>{new Date(alert.timestamp).toLocaleString('es-CL')}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  {alert.action && (
                    <button className="px-3 py-1.5 text-xs font-medium bg-slate-900 text-white rounded hover:bg-slate-800 transition-colors">
                      {alert.action}
                    </button>
                  )}
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      dismissAlert(alert.id)
                    }}
                    className="p-1.5 hover:bg-slate-200 rounded transition-colors text-slate-600 hover:text-slate-900"
                    title="Descartar alerta"
                  >
                    <X className="w-4 h-4" />
                  </button>
                  <ChevronRight className="w-4 h-4 text-slate-600" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Detail Modal */}
      {selectedAlert && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-slate-200 p-6 flex items-start justify-between">
              <div className="flex items-start gap-3 flex-1">
                <div className="flex-shrink-0">
                  {getSeverityIcon(selectedAlert.severity)}
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900">{selectedAlert.title}</h2>
                  <p className="text-sm text-slate-600 mt-1">{selectedAlert.entity}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedAlertId(null)}
                className="p-1.5 hover:bg-slate-100 rounded transition-colors text-slate-600 hover:text-slate-900 flex-shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Badges */}
              <div className="flex gap-2">
                <Badge className={`text-sm ${getBadgeColor(selectedAlert.severity)}`}>
                  {selectedAlert.severity === 'critical' ? 'Crítica' : selectedAlert.severity === 'warning' ? 'Advertencia' : 'Información'}
                </Badge>
                <Badge className="bg-slate-100 text-slate-800">
                  {new Date(selectedAlert.timestamp).toLocaleString('es-CL')}
                </Badge>
              </div>

              {/* Mensaje principal */}
              <div>
                <h3 className="text-sm font-semibold text-slate-600 uppercase mb-2">Descripción</h3>
                <p className="text-slate-900 leading-relaxed">{selectedAlert.message}</p>
              </div>

              {/* Descripción adicional si existe */}
              {selectedAlert.description && (
                <div>
                  <h3 className="text-sm font-semibold text-slate-600 uppercase mb-2">Detalles</h3>
                  <p className="text-slate-700 leading-relaxed">{selectedAlert.description}</p>
                </div>
              )}

              {/* Información adicional */}
              {selectedAlert.details && (
                <div className="space-y-3">
                  {selectedAlert.details.affectedCount && (
                    <div className="p-3 bg-slate-50 rounded border border-slate-200">
                      <p className="text-sm text-slate-600">Registros afectados</p>
                      <p className="text-lg font-bold text-slate-900">{selectedAlert.details.affectedCount}</p>
                    </div>
                  )}
                  {selectedAlert.details.deadline && (
                    <div className="p-3 bg-slate-50 rounded border border-slate-200">
                      <p className="text-sm text-slate-600">Fecha límite</p>
                      <p className="text-lg font-bold text-slate-900">{new Date(selectedAlert.details.deadline).toLocaleDateString('es-CL')}</p>
                    </div>
                  )}
                  {selectedAlert.details.nextAction && (
                    <div className="p-3 bg-blue-50 rounded border border-blue-200">
                      <p className="text-sm text-blue-600">Próxima acción recomendada</p>
                      <p className="text-slate-900 font-medium mt-1">{selectedAlert.details.nextAction}</p>
                    </div>
                  )}
                </div>
              )}

              {/* Acciones */}
              <div className="flex gap-3 pt-4">
                {selectedAlert.action && (
                  <button className="flex-1 px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors font-medium">
                    {selectedAlert.action}
                  </button>
                )}
                <button
                  onClick={() => {
                    dismissAlert(selectedAlert.id)
                    setSelectedAlertId(null)
                  }}
                  className="flex-1 px-4 py-2 bg-slate-100 text-slate-900 rounded-lg hover:bg-slate-200 transition-colors font-medium"
                >
                  Descartar
                </button>
                <button
                  onClick={() => setSelectedAlertId(null)}
                  className="flex-1 px-4 py-2 bg-slate-200 text-slate-900 rounded-lg hover:bg-slate-300 transition-colors font-medium"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
