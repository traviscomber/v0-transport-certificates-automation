import { useMemo, useCallback, useRef, useEffect, useState } from 'react'
import { AnomalyWithDetails } from './types'

/**
 * Memoization key generator for anomaly tables
 * Prevents unnecessary re-renders when props haven't changed
 */
export function generateAnomalyKey(anomaly: AnomalyWithDetails): string {
  return `${anomaly.id}_${anomaly.updated_at}_${anomaly.action_taken}`
}

/**
 * Virtual scroll calculator for rendering only visible items
 * Significantly improves performance for 100+ items
 */
export interface VirtualScrollState {
  startIndex: number
  endIndex: number
  offsetY: number
}

export function calculateVirtualScroll(
  itemCount: number,
  itemHeight: number,
  containerHeight: number,
  scrollY: number
): VirtualScrollState {
  const startIndex = Math.max(0, Math.floor(scrollY / itemHeight))
  const endIndex = Math.min(itemCount, Math.ceil((scrollY + containerHeight) / itemHeight))

  return {
    startIndex,
    endIndex,
    offsetY: startIndex * itemHeight,
  }
}

/**
 * Hook for efficient filtering and sorting of anomalies
 * Memoizes results to prevent unnecessary recalculations
 */
export function useAnomalyFiltering(
  anomalies: AnomalyWithDetails[],
  filters: {
    severity?: string
    anomalyType?: string
    actionTaken?: string | null
    search?: string
  }
) {
  return useMemo(() => {
    return anomalies.filter(anomaly => {
      // Severity filter
      if (filters.severity && filters.severity !== 'all' && anomaly.severity !== filters.severity) {
        return false
      }

      // Anomaly type filter
      if (filters.anomalyType && filters.anomalyType !== 'all' && anomaly.anomaly_type !== filters.anomalyType) {
        return false
      }

      // Action taken filter
      if (filters.actionTaken !== undefined) {
        if (filters.actionTaken === 'pending' && anomaly.action_taken !== null) {
          return false
        }
        if (filters.actionTaken && filters.actionTaken !== 'pending' && anomaly.action_taken !== filters.actionTaken) {
          return false
        }
      }

      // Search filter (across multiple fields)
      if (filters.search) {
        const query = filters.search.toLowerCase()
        return (
          anomaly.driver_name?.toLowerCase().includes(query) ||
          anomaly.driver_rut?.toLowerCase().includes(query) ||
          anomaly.company_name?.toLowerCase().includes(query) ||
          anomaly.document_type?.toLowerCase().includes(query) ||
          anomaly.anomaly_type?.toLowerCase().includes(query) ||
          false
        )
      }

      return true
    })
  }, [anomalies, filters])
}

/**
 * Hook for debounced search input
 * Prevents excessive re-renders while typing
 */
export function useDebouncedSearch(value: string, delay: number = 300) {
  const [debouncedValue, setDebouncedValue] = useState(value)
  const timeoutRef = useRef<NodeJS.Timeout>()

  useEffect(() => {
    timeoutRef.current = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [value, delay])

  return debouncedValue
}

/**
 * Hook for batch processing anomalies
 * Processes items in chunks to avoid blocking the UI
 */
export function useBatchProcessing<T>(
  items: T[],
  processor: (item: T) => void,
  batchSize: number = 50
) {
  const [processed, setProcessed] = useState<number>(0)
  const [isProcessing, setIsProcessing] = useState(false)

  useEffect(() => {
    if (items.length === 0) {
      setProcessed(0)
      return
    }

    setIsProcessing(true)
    let currentBatch = 0

    const processBatch = () => {
      const start = currentBatch * batchSize
      const end = Math.min(start + batchSize, items.length)

      for (let i = start; i < end; i++) {
        processor(items[i])
      }

      currentBatch++
      setProcessed(end)

      if (end < items.length) {
        // Schedule next batch
        requestIdleCallback(processBatch, { timeout: 100 })
      } else {
        setIsProcessing(false)
      }
    }

    requestIdleCallback(processBatch, { timeout: 100 })
  }, [items, processor, batchSize])

  return { processed, isProcessing, progress: (processed / items.length) * 100 }
}

/**
 * Memoization comparator for anomaly objects
 * Used with React.memo to prevent unnecessary re-renders
 */
export function areAnomaliesEqual(
  prev: AnomalyWithDetails,
  next: AnomalyWithDetails
): boolean {
  return (
    prev.id === next.id &&
    prev.action_taken === next.action_taken &&
    prev.action_taken_at === next.action_taken_at &&
    prev.action_notes === next.action_notes &&
    prev.updated_at === next.updated_at
  )
}

/**
 * Calculate optimal table row height for virtualization
 * Returns pixel value for consistent row height
 */
export const ANOMALY_ROW_HEIGHT = 72 // pixels
export const ANOMALY_HEADER_HEIGHT = 48 // pixels

/**
 * Pagination helper for API calls
 * Optimizes large result sets
 */
export interface PaginationState {
  page: number
  limit: number
  total: number
  totalPages: number
}

export function calculatePagination(
  total: number,
  page: number,
  limit: number
): PaginationState {
  return {
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
  }
}

/**
 * Sorting utilities for anomaly columns
 */
export type SortDirection = 'asc' | 'desc'

export function sortAnomalies(
  anomalies: AnomalyWithDetails[],
  sortBy: keyof AnomalyWithDetails,
  direction: SortDirection = 'asc'
): AnomalyWithDetails[] {
  return [...anomalies].sort((a, b) => {
    const aValue = a[sortBy]
    const bValue = b[sortBy]

    if (aValue === null || aValue === undefined) return 1
    if (bValue === null || bValue === undefined) return -1

    const isAsc = direction === 'asc'

    if (typeof aValue === 'string' && typeof bValue === 'string') {
      return isAsc ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue)
    }

    if (typeof aValue === 'number' && typeof bValue === 'number') {
      return isAsc ? aValue - bValue : bValue - aValue
    }

    if (aValue instanceof Date && bValue instanceof Date) {
      const aTime = new Date(aValue).getTime()
      const bTime = new Date(bValue).getTime()
      return isAsc ? aTime - bTime : bTime - aTime
    }

    return 0
  })
}
