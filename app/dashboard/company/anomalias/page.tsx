'use client'

import { useState, useEffect } from 'react'
import { AnomalyWithDetails } from '@/lib/anomalies/types'
import { AnomalyTable } from '@/components/admin/anomaly-table'
import { AnomalyDetailDialog } from '@/components/admin/anomaly-detail-dialog'
import { AnomalyFilters, AnomalyFilterState } from '@/components/admin/anomaly-filters'
import { Button } from '@/components/ui/button'
import { AlertTriangle, RefreshCw } from 'lucide-react'

export default function AnomaliesPage() {
  const [anomalies, setAnomalies] = useState<AnomalyWithDetails[]>([])
  const [selectedAnomaly, setSelectedAnomaly] = useState<AnomalyWithDetails | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filters, setFilters] = useState<AnomalyFilterState>({})
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [limit] = useState(25)
  const [mounted, setMounted] = useState(false)

  // Initialize only on client
  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) return
    fetchAnomalies()
  }, [filters, page, mounted])

  const fetchAnomalies = async () => {
    setLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams()
      if (filters.severity) params.append('severity', filters.severity)
      if (filters.actionTaken) params.append('actionTaken', filters.actionTaken)
      params.append('page', page.toString())
      params.append('limit', limit.toString())

      const response = await fetch(`/api/anomalies/list?${params}`)
      if (!response.ok) throw new Error('Failed to fetch anomalies')

      const data = await response.json()
      setAnomalies(data.anomalies || [])
      setTotal(data.total || 0)
    } catch (err) {
      console.error('[v0] Error fetching anomalies:', err)
      setError(err instanceof Error ? err.message : 'Error al cargar anomalías')
    } finally {
      setLoading(false)
    }
  }

  const handleViewDetails = (anomaly: AnomalyWithDetails) => {
    setSelectedAnomaly(anomaly)
    setDialogOpen(true)
  }

  const handleActionTaken = async (action: string, notes: string) => {
    if (!selectedAnomaly) return

    try {
      const response = await fetch('/api/anomalies/action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          anomaly_id: selectedAnomaly.id,
          action,
          notes: notes || undefined,
        }),
      })

      if (!response.ok) throw new Error('Failed to update anomaly')

      // Send email alert
      if (action !== 'pending') {
        await fetch('/api/notifications/send-email-alert', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            anomaly_id: selectedAnomaly.id,
            recipient_email: 'admin@transporteslabe.cl',
            recipient_name: 'Administrador',
            anomaly_type: selectedAnomaly.anomaly_type,
            severity: selectedAnomaly.severity,
            description: selectedAnomaly.description,
            driver_name: selectedAnomaly.driver_name,
          }),
        })
      }

      setDialogOpen(false)
      setSelectedAnomaly(null)
      // Refresh the list
      fetchAnomalies()
    } catch (error) {
      console.error('[v0] Error updating anomaly:', error)
    }
  }

  const handleFilterChange = (newFilters: AnomalyFilterState) => {
    setFilters(newFilters)
    setPage(1)
  }

  if (!mounted) {
    return null
  }

  const totalPages = Math.ceil(total / limit)
  const pendingCount = anomalies.filter(a => !a.action_taken).length
  const criticalCount = anomalies.filter(a => a.severity === 'critical' && !a.action_taken).length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <AlertTriangle className="h-8 w-8 text-orange-500" />
            Dashboard de Anomalías
          </h1>
          <p className="text-muted-foreground mt-2">
            Centro de control para documentos con anomalías detectadas
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            setPage(1)
            fetchAnomalies()
          }}
          disabled={loading}
          className="gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Actualizar
        </Button>
      </div>

      {error && (
        <div className="bg-destructive/10 border border-destructive text-destructive px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-card border rounded-lg p-4">
          <p className="text-sm font-medium text-muted-foreground">Total de Anomalías</p>
          <p className="text-3xl font-bold mt-2">{total}</p>
        </div>
        <div className="bg-card border rounded-lg p-4">
          <p className="text-sm font-medium text-muted-foreground">Pendientes</p>
          <p className="text-3xl font-bold text-yellow-600 mt-2">{pendingCount}</p>
        </div>
        <div className="bg-card border rounded-lg p-4">
          <p className="text-sm font-medium text-muted-foreground">Críticas Pendientes</p>
          <p className="text-3xl font-bold text-red-600 mt-2">{criticalCount}</p>
        </div>
      </div>

      {/* Filters */}
      <AnomalyFilters onFilterChange={handleFilterChange} loading={loading} />

      {/* Table */}
      <div className="bg-card border rounded-lg">
        <AnomalyTable
          anomalies={anomalies}
          loading={loading}
          onViewDetails={handleViewDetails}
        />
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 py-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1 || loading}
          >
            Anterior
          </Button>
          <span className="text-sm text-muted-foreground">
            Página {page} de {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages || loading}
          >
            Siguiente
          </Button>
        </div>
      )}

      {/* Detail Dialog */}
      {selectedAnomaly && (
        <AnomalyDetailDialog
          anomaly={selectedAnomaly}
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          onActionTaken={handleActionTaken}
          loading={loading}
        />
      )}
    </div>
  )
}
