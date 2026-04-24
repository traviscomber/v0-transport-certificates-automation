'use client'

import { useState, useEffect } from 'react'
import { HelpBox } from '@/components/ui/help-box'
import { Button } from '@/components/ui/button'
import { AlertItem } from '@/components/alerts/alert-item'
import { AlertFilters } from '@/components/alerts/alert-filters'
import { AlertStats } from '@/components/alerts/alert-stats'
import { useGeneratedAlerts } from '@/hooks/useGeneratedAlerts'
import { RefreshCw, Download } from 'lucide-react'

interface Alert {
  id: string
  type: 'warning' | 'error' | 'success' | 'info'
  title: string
  description: string
  timestamp: Date
  entityType?: 'driver' | 'subcontractor' | 'document' | 'system'
  entityId?: string
  entityName?: string
  actionUrl?: string
  actionLabel?: string
  read?: boolean
}

export default function AlertasPage() {
  const { alerts: generatedAlerts, isLoading, refetch } = useGeneratedAlerts()
  const [filteredAlerts, setFilteredAlerts] = useState<Alert[]>([])
  const [isRefreshing, setIsRefreshing] = useState(false)

  // Filters
  const [selectedType, setSelectedType] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('')
  const [searchQuery, setSearchQuery] = useState('')

  // Combine generated alerts with any stored alerts
  const [allAlerts, setAllAlerts] = useState<Alert[]>([])

  useEffect(() => {
    // For now, use only generated alerts
    // In the future, this could also include persisted alerts from the database
    setAllAlerts(generatedAlerts)
  }, [generatedAlerts])

  // Apply filters whenever they change
  useEffect(() => {
    applyFilters()
  }, [allAlerts, selectedType, selectedStatus, searchQuery])

  const applyFilters = () => {
    let filtered = allAlerts

    // Filter by type
    if (selectedType) {
      filtered = filtered.filter((a) => a.type === selectedType)
    }

    // Filter by status
    if (selectedStatus === 'unread') {
      filtered = filtered.filter((a) => !a.read)
    } else if (selectedStatus === 'read') {
      filtered = filtered.filter((a) => a.read)
    }

    // Filter by search
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (a) =>
          a.title.toLowerCase().includes(query) ||
          a.description.toLowerCase().includes(query) ||
          a.entityName?.toLowerCase().includes(query)
      )
    }

    setFilteredAlerts(filtered)
  }

  const handleRefresh = async () => {
    setIsRefreshing(true)
    await refetch()
    setIsRefreshing(false)
  }

  const handleReset = () => {
    setSelectedType('')
    setSelectedStatus('')
    setSearchQuery('')
  }

  // Calculate stats
  const stats = {
    total: allAlerts.length,
    warnings: allAlerts.filter((a) => a.type === 'warning').length,
    errors: allAlerts.filter((a) => a.type === 'error').length,
    info: allAlerts.filter((a) => a.type === 'info' || a.type === 'success').length,
    unread: allAlerts.filter((a) => !a.read).length,
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Alertas y Notificaciones</h1>
          <p className="text-muted-foreground">
            Mantente informado de eventos importantes en tu operación
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isRefreshing}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            Actualizar
          </Button>
          <Button
            variant="outline"
            size="sm"
          >
            <Download className="w-4 h-4 mr-2" />
            Exportar
          </Button>
        </div>
      </div>

      <HelpBox
        variant="info"
        title="Centro de Alertas"
        description="Recibe notificaciones automáticas sobre documentos próximos a vencer, cambios de estado y otros eventos importantes de tu operación."
        tips={[
          "Las alertas se generan automáticamente cada 5 minutos",
          "Presta atención a las alertas de vencimiento de documentos",
          "Usa los filtros para encontrar alertas específicas rápidamente",
        ]}
      />

      <AlertStats
        total={stats.total}
        warnings={stats.warnings}
        errors={stats.errors}
        info={stats.info}
        unread={stats.unread}
      />

      <AlertFilters
        selectedType={selectedType}
        selectedStatus={selectedStatus}
        searchQuery={searchQuery}
        onTypeChange={setSelectedType}
        onStatusChange={setSelectedStatus}
        onSearchChange={setSearchQuery}
        onReset={handleReset}
      />

      {isLoading ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Generando alertas del sistema...</p>
        </div>
      ) : filteredAlerts.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">
            {allAlerts.length === 0 ? 'No hay alertas activas' : 'No hay alertas que coincidan con los filtros'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredAlerts.map((alert) => (
            <AlertItem key={alert.id} {...alert} />
          ))}
        </div>
      )}
    </div>
  )
}
