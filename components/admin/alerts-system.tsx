'use client'

import { useEffect, useState } from 'react'
import useSWR from 'swr'
import { AlertCircle, CheckCircle, Clock, Trash2 } from 'lucide-react'

interface ComplianceAlert {
  id: string
  entity_type: 'conductor' | 'company'
  entity_id: string
  alert_type: string
  severity: 'info' | 'medium' | 'high'
  title: string
  message: string
  days_until_action: number | null
  status: 'active' | 'acknowledged' | 'resolved'
  created_at: string
}

interface AdminAlertsProps {
  adminId?: string
}

export function AdminAlertsSystem({ adminId }: AdminAlertsProps) {
  const [alerts, setAlerts] = useState<ComplianceAlert[]>([])
  const [filter, setFilter] = useState<'all' | 'high' | 'medium' | 'low'>('all')
  const [loading, setLoading] = useState(true)

  const fetcher = async () => {
    try {
      const response = await fetch('/api/compliance/alerts', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      })
      const data = await response.json()
      return data.alerts
    } catch (error) {
      console.error('[v0] Error fetching alerts:', error)
      return []
    }
  }

  const { data: alertsData, isLoading } = useSWR('/compliance/alerts', fetcher, {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    refreshInterval: 60000, // Refresh every minute
  })

  useEffect(() => {
    if (alertsData) {
      setAlerts(alertsData)
      setLoading(false)
    }
  }, [alertsData])

  const handleAcknowledge = async (alertId: string) => {
    try {
      await fetch('/api/compliance/alerts/acknowledge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ alertId }),
      })
      setAlerts(alerts.map((a) => (a.id === alertId ? { ...a, status: 'acknowledged' } : a)))
    } catch (error) {
      console.error('[v0] Error acknowledging alert:', error)
    }
  }

  const handleResolve = async (alertId: string) => {
    try {
      await fetch('/api/compliance/alerts/resolve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ alertId }),
      })
      setAlerts(alerts.filter((a) => a.id !== alertId))
    } catch (error) {
      console.error('[v0] Error resolving alert:', error)
    }
  }

  const filteredAlerts =
    filter === 'all' ? alerts : alerts.filter((a) => a.severity === (filter === 'low' ? 'info' : filter))

  const severityCounts = {
    high: alerts.filter((a) => a.severity === 'high').length,
    medium: alerts.filter((a) => a.severity === 'medium').length,
    low: alerts.filter((a) => a.severity === 'info').length,
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high':
        return 'bg-red-50 border-red-200'
      case 'medium':
        return 'bg-yellow-50 border-yellow-200'
      case 'info':
        return 'bg-blue-50 border-blue-200'
      default:
        return 'bg-gray-50 border-gray-200'
    }
  }

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'high':
        return <AlertCircle className="w-5 h-5 text-red-600" />
      case 'medium':
        return <Clock className="w-5 h-5 text-yellow-600" />
      case 'info':
        return <CheckCircle className="w-5 h-5 text-blue-600" />
      default:
        return <AlertCircle className="w-5 h-5 text-gray-600" />
    }
  }

  if (loading || isLoading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="animate-spin">
          <div className="h-8 w-8 border-4 border-blue-200 border-t-blue-600 rounded-full"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Alert Summary */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="text-2xl font-bold text-red-600">{severityCounts.high}</div>
          <div className="text-sm text-red-800 mt-1">Alertas Críticas</div>
        </div>
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="text-2xl font-bold text-yellow-600">{severityCounts.medium}</div>
          <div className="text-sm text-yellow-800 mt-1">Alertas Moderadas</div>
        </div>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="text-2xl font-bold text-blue-600">{severityCounts.low}</div>
          <div className="text-sm text-blue-800 mt-1">Alertas Bajas</div>
        </div>
      </div>

      {/* Filter */}
      <div className="flex gap-2">
        {(['all', 'high', 'medium', 'low'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === f ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
            }`}
          >
            {f === 'all' ? 'Todas' : f === 'high' ? 'Críticas' : f === 'medium' ? 'Moderadas' : 'Bajas'}
          </button>
        ))}
      </div>

      {/* Alerts List */}
      <div className="space-y-3">
        {filteredAlerts.length === 0 ? (
          <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
            <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-2" />
            <p className="text-green-800 font-medium">No hay alertas pendientes</p>
            <p className="text-green-700 text-sm mt-1">Todos los documentos están al día</p>
          </div>
        ) : (
          filteredAlerts.map((alert) => (
            <div
              key={alert.id}
              className={`border rounded-lg p-4 ${getSeverityColor(alert.severity)} hover:shadow-md transition-shadow`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3 flex-1">
                  {getSeverityIcon(alert.severity)}
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">{alert.title}</h3>
                    <p className="text-sm text-gray-700 mt-1">{alert.message}</p>
                    <p className="text-xs text-gray-600 mt-2">
                      {alert.entity_type === 'conductor' ? 'Conductor' : 'Empresa'} | {new Date(alert.created_at).toLocaleDateString('es-CL')}
                    </p>
                    {alert.days_until_action !== null && alert.days_until_action <= 30 && (
                      <p className="text-xs font-bold text-red-600 mt-1">Acción requerida en {alert.days_until_action} días</p>
                    )}
                  </div>
                </div>
                <div className="flex gap-2 ml-4">
                  {alert.status === 'active' && (
                    <button
                      onClick={() => handleAcknowledge(alert.id)}
                      className="px-3 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 transition-colors"
                    >
                      Reconocer
                    </button>
                  )}
                  <button
                    onClick={() => handleResolve(alert.id)}
                    className="px-3 py-2 bg-gray-600 text-white rounded text-sm hover:bg-gray-700 transition-colors flex items-center gap-1"
                  >
                    <Trash2 className="w-4 h-4" />
                    Resolver
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Summary */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-800">
        <p className="font-medium mb-2">Información del Sistema de Alertas</p>
        <ul className="list-disc list-inside space-y-1 text-xs">
          <li>Las alertas se generan automáticamente diariamente</li>
          <li>Los documentos próximos a vencer generan alertas con 30 días de anticipación</li>
          <li>Las alertas críticas aparecen cuando quedan menos de 7 días</li>
          <li>Puedes reconocer o resolver alertas manualmente</li>
        </ul>
      </div>
    </div>
  )
}
