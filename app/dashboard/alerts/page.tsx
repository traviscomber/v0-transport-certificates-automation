'use client'

import { useState } from 'react'
import { useAlerts } from '@/hooks/useAlerts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Bell, AlertTriangle, CheckCircle, Clock, Filter, X } from 'lucide-react'

/**
 * Página de Dashboard de Alertas
 * 
 * Muestra:
 * - Estadísticas generales de alertas
 * - Lista filtrable de alertas con diferentes vistas
 * - Opciones para marcar como leídas, eliminar, etc
 * - Gráficos y métricas educativas
 */

export default function AlertsPage() {
  const { alerts, loading, unreadCount, criticalAlerts, refresh, markAsRead, getByType } = useAlerts({
    autoRefresh: true,
    limit: 100
  })

  const [filterType, setFilterType] = useState<string | null>(null)
  const [filterPriority, setFilterPriority] = useState<string | null>(null)
  const [showOnlyUnread, setShowOnlyUnread] = useState(false)

  // Filtrar alertas basado en filtros activos
  let filteredAlerts = alerts

  if (filterType) {
    filteredAlerts = filteredAlerts.filter(a => a.type === filterType)
  }

  if (filterPriority) {
    filteredAlerts = filteredAlerts.filter(a => a.priority === filterPriority)
  }

  if (showOnlyUnread) {
    filteredAlerts = filteredAlerts.filter(a => !a.read)
  }

  // Estadísticas para mostrar
  const stats = {
    total: alerts.length,
    unread: unreadCount,
    critical: criticalAlerts.length,
    today: alerts.filter(a => {
      const today = new Date()
      const alertDate = new Date(a.created_at)
      return alertDate.toDateString() === today.toDateString()
    }).length
  }

  return (
    <div className="space-y-6 p-6">
      {/* Encabezado con título */}
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Alertas del Sistema</h1>
        <p className="text-slate-400">Panel centralizado de notificaciones y alertas</p>
      </div>

      {/* Tarjetas de estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard
          title="Total de Alertas"
          value={stats.total}
          icon={<Bell className="w-6 h-6" />}
          color="blue"
        />
        <StatCard
          title="No Leídas"
          value={stats.unread}
          icon={<Clock className="w-6 h-6" />}
          color="orange"
        />
        <StatCard
          title="Críticas"
          value={stats.critical}
          icon={<AlertTriangle className="w-6 h-6" />}
          color="red"
        />
        <StatCard
          title="Hoy"
          value={stats.today}
          icon={<CheckCircle className="w-6 h-6" />}
          color="green"
        />
      </div>

      {/* Controles de filtro */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-3">
            {/* Botón Solo No Leídas */}
            <Button
              variant={showOnlyUnread ? 'default' : 'outline'}
              onClick={() => setShowOnlyUnread(!showOnlyUnread)}
              className="flex items-center gap-2"
            >
              {showOnlyUnread && <X className="w-4 h-4" />}
              {showOnlyUnread ? 'Limpiar filtro' : 'Solo no leídas'}
            </Button>

            {/* Botones de Prioridad */}
            {['critical', 'high', 'normal', 'low'].map(priority => (
              <Button
                key={priority}
                variant={filterPriority === priority ? 'default' : 'outline'}
                onClick={() => setFilterPriority(filterPriority === priority ? null : priority)}
              >
                {priority.charAt(0).toUpperCase() + priority.slice(1)}
              </Button>
            ))}

            {/* Botón para refrescar */}
            <Button
              variant="outline"
              onClick={refresh}
              disabled={loading}
            >
              {loading ? 'Cargando...' : 'Refrescar'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Lista de alertas */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>
              Alertas {filteredAlerts.length > 0 && `(${filteredAlerts.length})`}
            </CardTitle>
            {filteredAlerts.some(a => !a.read) && (
              <Button
                variant="ghost"
                onClick={() => markAsRead(filteredAlerts.filter(a => !a.read).map(a => a.id))}
                className="text-xs"
              >
                Marcar todo como leído
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-12 text-slate-400">
              Cargando alertas...
            </div>
          ) : filteredAlerts.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              {alerts.length === 0 ? 'Sin alertas' : 'Sin alertas que coincidan con los filtros'}
            </div>
          ) : (
            <div className="space-y-3">
              {filteredAlerts.map(alert => (
                <AlertItem
                  key={alert.id}
                  alert={alert}
                  onMarkAsRead={markAsRead}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

/**
 * Componente de Tarjeta de Estadística
 * Muestra un número y un título con un icono
 */
function StatCard({
  title,
  value,
  icon,
  color = 'blue'
}: {
  title: string
  value: number
  icon: React.ReactNode
  color?: 'blue' | 'orange' | 'red' | 'green'
}) {
  const colorClasses = {
    blue: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    orange: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
    red: 'bg-red-500/20 text-red-400 border-red-500/30',
    green: 'bg-green-500/20 text-green-400 border-green-500/30'
  }

  return (
    <Card className={`border ${colorClasses[color]}`}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-slate-400 mb-2">{title}</p>
            <p className="text-3xl font-bold">{value}</p>
          </div>
          <div className={`${colorClasses[color]} p-3 rounded-lg`}>
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

/**
 * Componente de Item de Alerta
 * Muestra un alerta individual con opción de marcar como leída
 */
function AlertItem({
  alert,
  onMarkAsRead
}: {
  alert: any
  onMarkAsRead: (id: string) => void
}) {
  const priorityColors = {
    critical: 'text-red-400 bg-red-500/20',
    high: 'text-orange-400 bg-orange-500/20',
    normal: 'text-blue-400 bg-blue-500/20',
    low: 'text-slate-400 bg-slate-500/20'
  }

  const getPriorityColor = (priority: string) => {
    return priorityColors[priority as keyof typeof priorityColors] || 'text-slate-400'
  }

  return (
    <div
      className={`p-4 rounded-lg border transition-all ${
        alert.read
          ? 'border-slate-700/50 bg-slate-900/30'
          : 'border-slate-600 bg-slate-800/50 hover:bg-slate-800/70'
      }`}
    >
      <div className="flex items-start gap-4">
        {/* Icono según tipo */}
        <div className="mt-1">
          {alert.priority === 'critical' && (
            <AlertTriangle className="w-5 h-5 text-red-500" />
          )}
          {alert.priority === 'high' && (
            <AlertTriangle className="w-5 h-5 text-orange-500" />
          )}
          {alert.priority !== 'critical' && alert.priority !== 'high' && (
            <Bell className="w-5 h-5 text-blue-500" />
          )}
        </div>

        {/* Contenido */}
        <div className="flex-1">
          <div className="flex items-start justify-between gap-4 mb-2">
            <div>
              <h3 className={`font-semibold ${alert.read ? 'text-slate-400' : 'text-foreground'}`}>
                {alert.title}
              </h3>
              <p className="text-sm text-slate-400 mt-1">{alert.message}</p>
            </div>
            <span className={`text-xs font-semibold px-2 py-1 rounded ${getPriorityColor(alert.priority)}`}>
              {alert.priority.toUpperCase()}
            </span>
          </div>

          {/* Pie de página */}
          <div className="flex items-center justify-between text-xs text-slate-500 mt-3">
            <span>{new Date(alert.created_at).toLocaleString('es-ES')}</span>
            {!alert.read && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onMarkAsRead(alert.id)}
                className="text-xs"
              >
                Marcar como leída
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
