'use client'

import { useState, useEffect } from 'react'
import { Alert } from '@/lib/alerts/types'
import { HelpBox } from '@/components/ui/help-box'
import { Button } from '@/components/ui/button'
import { AlertActionCard } from '@/components/alert-action-card'
import { RefreshCw } from 'lucide-react'

export default function AlertasPage() {
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedPriority, setSelectedPriority] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('')
  const [ejecutiva, setEjecutiva] = useState<string | null>(null)
  const [profileResolved, setProfileResolved] = useState(false)

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const response = await fetch('/api/profile', { cache: 'no-store' })
        if (!response.ok) throw new Error(`Profile request failed (${response.status})`)
        const profile = await response.json()
        setEjecutiva(profile.full_name || profile.email || null)
      } catch (error) {
        console.error('[v0] Error loading alert profile:', error)
        setEjecutiva(null)
      } finally {
        setProfileResolved(true)
      }
    }

    loadProfile()
  }, [])

  useEffect(() => {
    if (!profileResolved) return
    loadAlerts()
  }, [profileResolved, selectedStatus])

  const loadAlerts = async () => {
    setIsLoading(true)
    try {
      // Keep this view aligned with the dashboard alert preview.
      // Alerts are currently generic because alerts_log.ejecutiva_nombre is not populated.
      // The authenticated profile is used for display/audit actions, not as a list filter.
      const params = new URLSearchParams({
        limit: '100',
        sort: 'created_at.desc',
        ...(selectedStatus && { status: selectedStatus }),
      })

      const response = await fetch(`/api/alerts?${params.toString()}`, { cache: 'no-store' })
      if (!response.ok) throw new Error(`Failed to fetch alerts (${response.status})`)

      const data = await response.json()
      const alertList = Array.isArray(data) ? data : (data.alerts || [])
      setAlerts(alertList.map((alert: any) => ({
        ...alert,
        status: alert.status || 'pendiente',
      })))
      console.log('[v0] Loaded generic alerts for portal:', alertList.length)
    } catch (error) {
      console.error('[v0] Error loading alerts:', error)
      setAlerts([])
    } finally {
      setIsLoading(false)
    }
  }

  const handleAlertAction = async (alertId: string, action: 'approve' | 'reject' | 'request_info', notes?: string) => {
    if (!ejecutiva) throw new Error('No authenticated alert user')

    try {
      const response = await fetch(`/api/alerts/${alertId}/action`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-ejecutiva-name': ejecutiva,
        },
        body: JSON.stringify({ action, notes }),
      })

      if (!response.ok) throw new Error('Failed to process alert action')
      await loadAlerts()
    } catch (error) {
      console.error('[v0] Error performing alert action:', error)
      throw error
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
    unread: alerts.filter(a => !a.is_read).length,
    pending: alerts.filter(a => a.status === 'pendiente').length,
  }

  const displayName = ejecutiva || 'Usuario'

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Alertas y Notificaciones</h1>
          <p className="text-foreground/80">
            Centro de alertas · <span className="font-semibold text-orange-400">{displayName}</span>
          </p>
        </div>
        <Button onClick={loadAlerts} disabled={isLoading} variant="outline" size="sm">
          <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          Actualizar
        </Button>
      </div>

      <HelpBox
        variant="info"
        title="Centro de Alertas"
        description="Vista consolidada de alertas operacionales. Usa los botones de acción para aprobar, rechazar o solicitar información cuando corresponda."
        tips={[
          "Haz clic en 'Actualizar' para cargar nuevas alertas",
          "Usa 'Aprobar', 'Rechazar' o 'Solicitar Info' directamente en cada alerta",
          "Las alertas resueltas se mostrarán en verde",
          "Filtra por estado, prioridad o categoría según sea necesario",
        ]}
      />

      <div className="grid grid-cols-6 gap-4">
        <div className="p-4 bg-card border border-border rounded-lg"><div className="text-sm text-muted-foreground font-medium">Total</div><div className="text-2xl font-bold text-foreground">{stats.total}</div></div>
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg dark:bg-red-950/30 dark:border-red-900"><div className="text-sm text-red-700 font-medium dark:text-red-300">Críticas</div><div className="text-2xl font-bold text-red-700 dark:text-red-300">{stats.critical}</div></div>
        <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg dark:bg-orange-950/30 dark:border-orange-900"><div className="text-sm text-orange-700 font-medium dark:text-orange-300">Altas</div><div className="text-2xl font-bold text-orange-700 dark:text-orange-300">{stats.high}</div></div>
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg dark:bg-blue-950/30 dark:border-blue-900"><div className="text-sm text-blue-700 font-medium dark:text-blue-300">Medias</div><div className="text-2xl font-bold text-blue-700 dark:text-blue-300">{stats.medium}</div></div>
        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg dark:bg-yellow-950/30 dark:border-yellow-900"><div className="text-sm text-yellow-700 font-medium dark:text-yellow-300">Pendientes</div><div className="text-2xl font-bold text-yellow-700 dark:text-yellow-300">{stats.pending}</div></div>
        <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg dark:bg-purple-950/30 dark:border-purple-900"><div className="text-sm text-purple-700 font-medium dark:text-purple-300">No leídas</div><div className="text-2xl font-bold text-purple-700 dark:text-purple-300">{stats.unread}</div></div>
      </div>

      <div className="flex gap-4 flex-wrap">
        <input type="text" placeholder="Buscar alertas..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="flex-1 min-w-64 px-3 py-2 bg-background border border-input rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary" />
        <select value={selectedStatus} onChange={(e) => setSelectedStatus(e.target.value)} className="px-3 py-2 bg-background border border-input rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary">
          <option value="">Todos los estados</option><option value="pendiente">Pendiente</option><option value="actioned">Procesada</option><option value="resuelto">Resuelto</option>
        </select>
        <select value={selectedPriority} onChange={(e) => setSelectedPriority(e.target.value)} className="px-3 py-2 bg-background border border-input rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary">
          <option value="">Todas las prioridades</option><option value="critical">Crítica</option><option value="high">Alta</option><option value="medium">Media</option><option value="low">Baja</option>
        </select>
        <Button variant="outline" onClick={() => { setSearchQuery(''); setSelectedPriority(''); setSelectedCategory(''); setSelectedStatus('') }}>Limpiar</Button>
      </div>

      <div>
        {isLoading ? (
          <div className="text-center py-12"><p className="text-muted-foreground">Cargando alertas...</p></div>
        ) : filteredAlerts.length === 0 ? (
          <div className="text-center py-12"><p className="text-muted-foreground">{alerts.length === 0 ? 'No hay alertas en este momento' : 'No hay alertas que coincidan con los filtros'}</p></div>
        ) : (
          <div className="space-y-3">{filteredAlerts.map((alert) => <AlertActionCard key={alert.id} alert={alert} onAction={handleAlertAction} />)}</div>
        )}
      </div>
    </div>
  )
}
