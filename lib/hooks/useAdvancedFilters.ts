import { useMemo, useCallback, useState } from 'react'
import { AnomalyWithDetails, AnomalySeverity } from '@/lib/anomalies/types'

export interface AdvancedFilters {
  severity?: AnomalySeverity[]
  anomalyType?: string[]
  status?: string[]
  dateRange?: {
    from: Date
    to: Date
  }
  companyId?: string
  driverName?: string
  searchText?: string
}

export function useAdvancedFilters(anomalies: AnomalyWithDetails[]) {
  const [filters, setFilters] = useState<AdvancedFilters>({})

  const filteredAnomalies = useMemo(() => {
    return anomalies.filter(anomaly => {
      // Severity filter
      if (filters.severity && filters.severity.length > 0) {
        if (!filters.severity.includes(anomaly.severity as AnomalySeverity)) {
          return false
        }
      }

      // Anomaly type filter
      if (filters.anomalyType && filters.anomalyType.length > 0) {
        if (!filters.anomalyType.includes(anomaly.anomaly_type)) {
          return false
        }
      }

      // Status filter
      if (filters.status && filters.status.length > 0) {
        const anomalyStatus = anomaly.action_taken || 'pending'
        if (!filters.status.includes(anomalyStatus)) {
          return false
        }
      }

      // Date range filter
      if (filters.dateRange) {
        const detectedDate = new Date(anomaly.detected_at)
        if (detectedDate < filters.dateRange.from || detectedDate > filters.dateRange.to) {
          return false
        }
      }

      // Company filter
      if (filters.companyId && anomaly.company_id !== filters.companyId) {
        return false
      }

      // Driver name filter
      if (filters.driverName && !anomaly.driver_name?.toLowerCase().includes(filters.driverName.toLowerCase())) {
        return false
      }

      // Search text filter
      if (filters.searchText) {
        const searchLower = filters.searchText.toLowerCase()
        const searchableFields = [
          anomaly.driver_name,
          anomaly.driver_rut,
          anomaly.company_name,
          anomaly.document_type,
          anomaly.anomaly_type,
        ].filter(Boolean).join(' ').toLowerCase()

        if (!searchableFields.includes(searchLower)) {
          return false
        }
      }

      return true
    })
  }, [anomalies, filters])

  const updateFilters = useCallback((newFilters: AdvancedFilters) => {
    setFilters(newFilters)
  }, [])

  const clearFilters = useCallback(() => {
    setFilters({})
  }, [])

  return {
    filters,
    filteredAnomalies,
    updateFilters,
    clearFilters,
    hasActiveFilters: Object.values(filters).some(v => v !== undefined && v !== null && (Array.isArray(v) ? v.length > 0 : true)),
  }
}
