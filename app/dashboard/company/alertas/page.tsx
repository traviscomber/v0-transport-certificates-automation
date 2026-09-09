'use client'

import { useEffect, useMemo, useState } from 'react'
import { RefreshCw } from 'lucide-react'
import { Alert } from '@/lib/alerts/types'
import { Button } from '@/components/ui/button'
import { AlertActionCard } from '@/components/alert-action-card'

export default function AlertasPage() {
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedPriority, setSelectedPriority] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('')
  const [profileResolved, setProfileResolved] = useState(false)

  useEffect(() => {
    const resolveProfile = async () => {
      try {
        const response = await fetch('/api/profile', { cache: 'no-store' })
        if (!response.ok) throw new Error(`Profile request failed (${response.status})`)
      } catch (error) {
        console.error('[alerts] Error resolving profile:', error)
      } finally {
        setProfileResolved(true)
      }
    }

    void resolveProfile()
  }, [])

  useEffect(() => {
    if (!profileResolved) return
    void loadAlerts()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profileResolved, selectedStatus])

  const loadAlerts = async () => {
    setIsLoading(true)
    setLoadError(null)
    try {
      const params = new URLSearchParams({
        limit: '100',
        sort: 'created_at.desc',
        ...(selectedStatus && { status: selectedStatus }),
      })

      const response = await fetch(`/api/alerts?${params.toString()}`, { cache: 'no-store' })
      if (!response.ok) throw new Error(`Failed to fetch alerts (${response.status})`)

      const data = await response.json()
      const alertList = Array.isArray(data) ? data : data.alerts || []
      setAlerts(alertList.map((alert: any) => ({ ...alert, status: alert.status || 'pendiente' })))
    } catch (error) {
      console.error('[alerts] Error loading alerts:', error)
      setAlerts([])
      setLoadError('No fue posible cargar la cola de alertas.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleAlertAction = async (
    alertId: string,
    action: 'resolve' | 'request_info',
    notes?: string,
  ) => {
    const response = await fetch(`/api/alerts/${alertId}/action`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, notes }),
    })

    if (!response.ok) throw new Error('Failed to process alert action')
    await loadAlerts()
  }

  const filteredAlerts = useMemo(() => {
    const query = searchQuery.trim().toLowerCase()
    return alerts.filter((alert) => {
      const matchesSearch =
        !query ||
        alert.title.toLowerCase().includes(query) ||
        alert.message?.toLowerCase().includes(query) ||
        String(alert.metadata?.transportista_nombre || '').toLowerCase().includes(query) ||
        String(alert.metadata?.transportista_rut || '').toLowerCase().includes(query)
      const matchesPriority = !selectedPriority || alert.priority === selectedPriority
      return matchesSearch && matchesPriority
    })
  }, [alerts, searchQuery, selectedPriority])

  const stats = useMemo(() => ({
    total: alerts.length,
    critical: alerts.filter((alert) => alert.priority === 'critical').length,
    high: alerts.filter((alert) => alert.priority === 'high').length,
    pending: alerts.filter((alert) => alert.status === 'pendiente').length,
    unread: alerts.filter((alert) => !alert.is_read).length,
  }), [alerts])

  return (
    <div className="space-y-7">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-3xl">
          <p className="mb-2 text-xs font-medium uppercase tracking-[0.14em] text-[var(--cf-text-muted)]">Centro de atención</p>
          <h1 className="text-2xl font-semibold tracking-[-0.03em] text-[var(--cf-text)] md:text-[28px]">Alertas operacionales</h1>
          <p className="mt-2 text-sm leading-6 text-[var(--cf-text-secondary)]">
            Prioriza excepciones, identifica al subcontratista afectado y deriva cualquier decisión documental al flujo canónico de Documentos.
          </p>
        </div>

        <Button
          onClick={loadAlerts}
          disabled={isLoading}
          variant="outline"
          className="h-10 gap-2 border-[var(--cf-border)] bg-transparent text-sm text-[var(--cf-text-secondary)] hover:bg-[var(--cf-surface-raised)] hover:text-[var(--cf-text)]"
        >
          <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          Actualizar
        </Button>
      </div>

      <section className="space-y-3" aria-labelledby="alert-summary-title">
        <SectionHeading
          eyebrow="Lectura rápida"
          title="Estado de la cola"
          description="Señales observadas en la carga actual. Los filtros no modifican los datos fuente."
          id="alert-summary-title"
        />
        <div className="overflow-hidden rounded-[6px] border border-[var(--cf-border)] bg-[var(--cf-surface)]">
          <div className="grid grid-cols-2 lg:grid-cols-5">
            <Metric label="Total" value={stats.total} />
            <Metric label="Críticas" value={stats.critical} tone="danger" divided />
            <Metric label="Alta prioridad" value={stats.high} tone="warning" divided />
            <Metric label="Pendientes" value={stats.pending} tone="attention" divided />
            <Metric label="No leídas" value={stats.unread} divided />
          </div>
        </div>
      </section>

      <section className="space-y-3" aria-labelledby="alert-filter-title">
        <SectionHeading
          eyebrow="Vista"
          title="Buscar y filtrar"
          description="Reduce la cola visible por estado, prioridad, subcontratista o RUT."
          id="alert-filter-title"
        />
        <div className="flex flex-col gap-3 border-y border-[var(--cf-border)] py-4 lg:flex-row lg:items-center">
          <input
            type="search"
            placeholder="Buscar por alerta, subcontratista o RUT"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            className="h-10 min-w-0 flex-1 rounded-[5px] border border-[var(--cf-border)] bg-[var(--cf-surface-raised)] px-3 text-sm text-[var(--cf-text)] outline-none placeholder:text-[var(--cf-text-muted)] focus:border-[var(--cf-accent)] focus:ring-2 focus:ring-[var(--cf-focus-ring)]/30"
          />
          <select
            value={selectedStatus}
            onChange={(event) => setSelectedStatus(event.target.value)}
            className="h-10 rounded-[5px] border border-[var(--cf-border)] bg-[var(--cf-surface-raised)] px-3 text-sm text-[var(--cf-text-secondary)] outline-none focus:border-[var(--cf-accent)] focus:ring-2 focus:ring-[var(--cf-focus-ring)]/30"
          >
            <option value="">Todos los estados</option>
            <option value="pendiente">Pendiente</option>
            <option value="actioned">Procesada</option>
            <option value="resuelto">Resuelto</option>
          </select>
          <select
            value={selectedPriority}
            onChange={(event) => setSelectedPriority(event.target.value)}
            className="h-10 rounded-[5px] border border-[var(--cf-border)] bg-[var(--cf-surface-raised)] px-3 text-sm text-[var(--cf-text-secondary)] outline-none focus:border-[var(--cf-accent)] focus:ring-2 focus:ring-[var(--cf-focus-ring)]/30"
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
              setSelectedStatus('')
            }}
            className="h-10 border-[var(--cf-border)] bg-transparent text-sm text-[var(--cf-text-secondary)] hover:bg-[var(--cf-surface-raised)] hover:text-[var(--cf-text)]"
          >
            Limpiar
          </Button>
        </div>
      </section>

      <section className="space-y-3" aria-labelledby="alert-queue-title">
        <div className="flex flex-col gap-2 border-b border-[var(--cf-border)] pb-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-[var(--cf-text-muted)]">Cola operacional</p>
            <h2 id="alert-queue-title" className="mt-1 text-base font-semibold text-[var(--cf-text)]">
              {filteredAlerts.length.toLocaleString('es-CL')} alertas visibles
            </h2>
          </div>
          <p className="text-xs text-[var(--cf-text-muted)]">Ordenadas por creación según la respuesta del servicio.</p>
        </div>

        {isLoading ? (
          <StatePanel>Cargando alertas…</StatePanel>
        ) : loadError ? (
          <div className="rounded-[6px] border border-[#45242B] bg-[var(--cf-surface)] px-5 py-6 text-sm text-[var(--cf-text-secondary)]">
            <p className="font-medium text-[#E17B8C]">{loadError}</p>
            <p className="mt-2 text-xs text-[var(--cf-text-muted)]">El estado vacío no se usa para ocultar errores de carga.</p>
            <Button
              variant="outline"
              onClick={loadAlerts}
              className="mt-4 h-9 border-[var(--cf-border)] bg-transparent text-xs text-[var(--cf-text-secondary)] hover:bg-[var(--cf-surface-raised)]"
            >
              Reintentar
            </Button>
          </div>
        ) : filteredAlerts.length === 0 ? (
          <StatePanel>{alerts.length === 0 ? 'No hay alertas en este momento.' : 'No hay alertas que coincidan con los filtros.'}</StatePanel>
        ) : (
          <div className="space-y-2">
            {filteredAlerts.map((alert) => (
              <AlertActionCard key={alert.id} alert={alert} onAction={handleAlertAction} />
            ))}
          </div>
        )}
      </section>
    </div>
  )
}

function SectionHeading({ eyebrow, title, description, id }: { eyebrow: string; title: string; description: string; id: string }) {
  return (
    <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between sm:gap-6">
      <div>
        <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-[var(--cf-text-muted)]">{eyebrow}</p>
        <h2 id={id} className="mt-1 text-base font-semibold text-[var(--cf-text)]">{title}</h2>
      </div>
      <p className="max-w-xl text-xs leading-5 text-[var(--cf-text-muted)] sm:text-right">{description}</p>
    </div>
  )
}

function Metric({ label, value, tone, divided }: { label: string; value: number; tone?: 'danger' | 'warning' | 'attention'; divided?: boolean }) {
  const indicator = tone === 'danger'
    ? 'bg-[#E17B8C]'
    : tone === 'warning'
      ? 'bg-[#E6A35A]'
      : tone === 'attention'
        ? 'bg-[#D9B65C]'
        : 'bg-[var(--cf-text-muted)]'

  return (
    <div className={`min-w-0 p-4 ${divided ? 'border-l border-[var(--cf-border)]' : ''}`}>
      <div className="flex items-center gap-2">
        <span className={`h-1.5 w-1.5 rounded-full ${indicator}`} />
        <span className="text-xs font-medium text-[var(--cf-text-muted)]">{label}</span>
      </div>
      <p className="mt-2 text-2xl font-semibold tabular-nums tracking-[-0.03em] text-[var(--cf-text)]">{value}</p>
    </div>
  )
}

function StatePanel({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-[6px] border border-[var(--cf-border)] bg-[var(--cf-surface)] px-6 py-10 text-center text-sm text-[var(--cf-text-muted)]">
      {children}
    </div>
  )
}
