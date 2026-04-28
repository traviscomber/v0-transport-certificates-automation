/**
 * Orchestration Monitoring Dashboard
 * Interfaz para monitorear en tiempo real el sistema de orquestación
 * y las comunicaciones entre módulos
 */

'use client'

import React, { useEffect, useState } from 'react'
import { OrchestrationAPI } from '@/lib/orchestration'

interface SystemStatus {
  modules: any[]
  recentEvents: any[]
  pendingActions: any[]
  recentDecisions: any[]
  timestamp: Date
}

interface CommunicationStats {
  totalRequests: number
  averageDuration: string
  requestsByModule: Record<string, number>
  requestsByType: Record<string, number>
  slowestRequests: any[]
}

export function OrchestrationMonitoringDashboard() {
  const [systemStatus, setSystemStatus] = useState<SystemStatus | null>(null)
  const [commStats, setCommStats] = useState<CommunicationStats | null>(null)
  const [insights, setInsights] = useState<string[]>([])
  const [selectedEntityId, setSelectedEntityId] = useState<string>('')
  const [recommendations, setRecommendations] = useState<string[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const updateDashboard = () => {
      try {
        // Obtener status del sistema
        const status = OrchestrationAPI.getSystemStatus() as SystemStatus
        setSystemStatus(status)

        // Obtener estadísticas de comunicación
        const stats = OrchestrationAPI.getCommunicationStats() as CommunicationStats
        setCommStats(stats)

        // Obtener insights
        const systemInsights = OrchestrationAPI.getInsights()
        setInsights(systemInsights)

        // Obtener recomendaciones si hay entityId
        if (selectedEntityId) {
          const recs = OrchestrationAPI.getRecommendations(selectedEntityId)
          setRecommendations(recs)
        }

        setLoading(false)
      } catch (error) {
        console.error('Error updating dashboard:', error)
      }
    }

    updateDashboard()
    const interval = setInterval(updateDashboard, 5000) // Actualizar cada 5 segundos

    return () => clearInterval(interval)
  }, [selectedEntityId])

  if (loading) {
    return <div className="p-8 text-center">Cargando sistema de orquestación...</div>
  }

  return (
    <div className="space-y-6 p-8 bg-gray-50">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">
          🎛️ Panel de Control - Sistema de Orquestación
        </h1>
        <p className="text-gray-600 mt-2">
          Monitoreo en tiempo real de comunicación entre módulos e inteligencia compartida
        </p>
      </div>

      {/* Estado de Módulos */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {systemStatus?.modules.map((module: any) => (
          <div
            key={module.name}
            className="bg-white rounded-lg shadow p-4 border-l-4 border-blue-500"
          >
            <h3 className="font-semibold text-gray-900">{module.name}</h3>
            <div className="mt-2 space-y-1 text-sm text-gray-600">
              <div>
                Estado:{' '}
                <span className={module.isHealthy ? 'text-green-600' : 'text-red-600'}>
                  {module.isHealthy ? '✓ Saludable' : '✗ Error'}
                </span>
              </div>
              <div>Eventos: {module.eventCount}</div>
              <div>Acciones: {module.actionCount}</div>
              <div>Errores: {module.errorCount}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Eventos Recientes */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">📊 Eventos Recientes</h2>
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {systemStatus?.recentEvents.slice(0, 10).map((event: any) => (
            <div key={event.id} className="flex items-start space-x-3 p-2 hover:bg-gray-50">
              <span className="text-2xl">
                {event.source === 'alerts' && '🔔'}
                {event.source === 'documents' && '📄'}
                {event.source === 'notifications' && '📧'}
                {event.source === 'compliance' && '✓'}
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900">{event.type}</p>
                <p className="text-xs text-gray-500">
                  {event.context?.entityName} • {new Date(event.timestamp).toLocaleTimeString()}
                </p>
              </div>
              <span
                className={`text-xs font-semibold px-2 py-1 rounded ${
                  event.priority > 7
                    ? 'bg-red-100 text-red-800'
                    : event.priority > 4
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-green-100 text-green-800'
                }`}
              >
                P{event.priority}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Estadísticas de Comunicación */}
      {commStats && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">💬 Comunicaciones</h2>
            <div className="space-y-3">
              <div>
                <div className="text-sm text-gray-600">Total de Solicitudes</div>
                <div className="text-3xl font-bold text-blue-600">{commStats.totalRequests}</div>
              </div>
              <div>
                <div className="text-sm text-gray-600">Duración Promedio</div>
                <div className="text-2xl font-bold text-green-600">
                  {commStats.averageDuration}ms
                </div>
              </div>
            </div>
          </div>

          {/* Solicitudes por Módulo */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">📈 Por Módulo</h2>
            <div className="space-y-2">
              {Object.entries(commStats.requestsByModule).map(([module, count]: [string, any]) => (
                <div key={module} className="flex justify-between text-sm">
                  <span className="text-gray-600">{module}</span>
                  <span className="font-semibold text-gray-900">{count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Inteligencia Compartida - Insights */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">💡 Insights Inteligentes</h2>
        <div className="space-y-3">
          {insights.length > 0 ? (
            insights.map((insight, idx) => (
              <div
                key={idx}
                className="flex items-start space-x-3 p-3 bg-blue-50 rounded-lg border border-blue-200"
              >
                <span className="text-lg">💭</span>
                <p className="text-sm text-gray-700">{insight}</p>
              </div>
            ))
          ) : (
            <p className="text-sm text-gray-500">No hay insights disponibles aún</p>
          )}
        </div>
      </div>

      {/* Recomendaciones Personalizadas */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          🎯 Recomendaciones Inteligentes
        </h2>
        <div className="mb-4">
          <input
            type="text"
            placeholder="Ingresa ID de entidad para ver recomendaciones..."
            value={selectedEntityId}
            onChange={(e) => setSelectedEntityId(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
          />
        </div>
        {selectedEntityId && recommendations.length > 0 ? (
          <div className="space-y-2">
            {recommendations.map((rec, idx) => (
              <div key={idx} className="flex items-start space-x-2 p-2">
                <span className="text-lg">✨</span>
                <p className="text-sm text-gray-700">{rec}</p>
              </div>
            ))}
          </div>
        ) : selectedEntityId ? (
          <p className="text-sm text-gray-500">
            No hay recomendaciones para esta entidad
          </p>
        ) : (
          <p className="text-sm text-gray-500">
            Ingresa un ID de entidad para ver recomendaciones personalizadas
          </p>
        )}
      </div>

      {/* Acciones Pendientes */}
      {systemStatus?.pendingActions && systemStatus.pendingActions.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">⏳ Acciones Pendientes</h2>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {systemStatus.pendingActions.map((action: any) => (
              <div key={action.id} className="p-2 bg-yellow-50 border border-yellow-200 rounded">
                <p className="text-sm font-medium text-gray-900">{action.type}</p>
                <p className="text-xs text-gray-600">Módulo: {action.targetModule}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Decisiones Recientes */}
      {systemStatus?.recentDecisions && systemStatus.recentDecisions.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            🤖 Decisiones Automáticas Recientes
          </h2>
          <div className="space-y-3">
            {systemStatus.recentDecisions.slice(0, 5).map((decision: any) => (
              <div key={decision.id} className="p-3 bg-purple-50 rounded-lg border border-purple-200">
                <div className="flex justify-between items-start mb-2">
                  <span className="font-semibold text-gray-900">{decision.type}</span>
                  <span className="text-sm font-semibold text-purple-600">
                    {decision.confidence}% confianza
                  </span>
                </div>
                <p className="text-sm text-gray-700">{decision.reason}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Información del Sistema */}
      <div className="bg-gray-100 rounded-lg p-4 text-xs text-gray-600">
        <p>
          Última actualización: {systemStatus?.timestamp && new Date(systemStatus.timestamp).toLocaleTimeString()}
        </p>
        <p className="mt-1">
          El sistema se actualiza automáticamente cada 5 segundos. Todos los eventos, decisiones y
          comunicaciones se registran en la base de conocimiento compartida.
        </p>
      </div>
    </div>
  )
}
