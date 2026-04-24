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

export default function AlertasPage() {
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [filteredAlerts, setFilteredAlerts] = useState<Alert[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)

  // Filters
  const [selectedType, setSelectedType] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('')
  const [searchQuery, setSearchQuery] = useState('')

  // Load alerts
  useEffect(() => {
    loadAlerts()
  }, [])

  // Apply filters whenever they change
  useEffect(() => {
    applyFilters()
  }, [alerts, selectedType, selectedStatus, searchQuery])

  const loadAlerts = async () => {
    setIsLoading(true)
    try {
      // Genera alertas simuladas basadas en datos reales del sistema
      const mockAlerts: Alert[] = [
        {
          id: '1',
          type: 'warning',
          title: 'Documentos próximos a vencer',
          description: 'Hay 5 licencias de conducir que vencen en los próximos 7 días',
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
          entityType: 'document',
          entityName: 'Licencias de conducir',
          actionLabel: 'Ver conductores',
          read: false,
        },
        {
          id: '2',
          type: 'warning',
          title: 'Seguro próximo a vencer',
          description: 'El seguro de responsabilidad civil vence en 14 días',
          timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
          entityType: 'document',
          entityName: 'Seguro RC',
          actionLabel: 'Ver detalles',
          read: false,
        },
        {
          id: '3',
          type: 'error',
          title: 'Documento rechazado',
          description: 'La licencia de Aldo Bustamante Ortega fue rechazada por información incompleta',
          timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000),
          entityType: 'driver',
          entityName: 'Aldo Bustamante Ortega',
          actionUrl: '/dashboard/company/conductores?search=Aldo',
          actionLabel: 'Revisar',
          read: false,
        },
        {
          id: '4',
          type: 'success',
          title: 'Documento aprobado',
          description: 'La licencia de conducir de Juan Pérez fue aprobada correctamente',
          timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000),
          entityType: 'driver',
          entityName: 'Juan Pérez',
          read: true,
        },
        {
          id: '5',
          type: 'info',
          title: 'Nuevo conductor agregado',
          description: 'Se agregó un nuevo conductor al sistema',
          timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
          entityType: 'driver',
          entityName: 'Carlos López',
          read: true,
        },
        {
          id: '6',
          type: 'warning',
          title: 'Subcontratista sin documentos actualizados',
          description: 'Empresa Transportes X tiene documentos vencidos',
          timestamp: new Date(Date.now() - 48 * 60 * 60 * 1000),
          entityType: 'subcontractor',
          entityName: 'Empresa Transportes X',
          actionLabel: 'Actualizar',
          read: true,
        },
      ]
      setAlerts(mockAlerts)
    } catch (error) {
      console.error('[v0] Error loading alerts:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const applyFilters = () => {
    let filtered = alerts

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
    await loadAlerts()
    setIsRefreshing(false)
  }

  const handleReset = () => {
    setSelectedType('')
    setSelectedStatus('')
    setSearchQuery('')
  }

  // Calculate stats
  const stats = {
    total: alerts.length,
    warnings: alerts.filter((a) => a.type === 'warning').length,
    errors: alerts.filter((a) => a.type === 'error').length,
    info: alerts.filter((a) => a.type === 'info' || a.type === 'success').length,
    unread: alerts.filter((a) => !a.read).length,
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
        description="Recibe notificaciones sobre documentos próximos a vencer, cambios de estado y otros eventos importantes de tu operación."
        tips={[
          "Las alertas se actualizan en tiempo real",
          "Presta atención a las alertas de vencimiento de documentos",
          "Revisa regularmente para estar al día con tu operación",
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
          <p className="text-muted-foreground">Cargando alertas...</p>
        </div>
      ) : filteredAlerts.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">
            {alerts.length === 0 ? 'No hay alertas' : 'No hay alertas que coincidan con los filtros'}
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
