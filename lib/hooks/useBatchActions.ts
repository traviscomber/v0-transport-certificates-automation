'use client'

import { useState, useCallback } from 'react'

export interface BatchActionResult {
  success: boolean
  updated_count: number
  action: string
  timestamp: string
  error?: string
}

/**
 * Hook for batch operations on anomalies
 * Handles selection, batch processing, and state management
 */
export function useBatchActions() {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const toggleSelect = useCallback((id: string) => {
    setSelectedIds(prev => {
      const newSet = new Set(prev)
      if (newSet.has(id)) {
        newSet.delete(id)
      } else {
        newSet.add(id)
      }
      return newSet
    })
  }, [])

  const toggleSelectAll = useCallback((ids: string[]) => {
    if (selectedIds.size === ids.length) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(ids))
    }
  }, [selectedIds.size])

  const clearSelection = useCallback(() => {
    setSelectedIds(new Set())
  }, [])

  const performBatchAction = useCallback(
    async (action: string, notes?: string): Promise<BatchActionResult | null> => {
      if (selectedIds.size === 0) {
        setError('No anomalies selected')
        return null
      }

      setIsProcessing(true)
      setError(null)

      try {
        const response = await fetch('/api/anomalies/batch', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            anomaly_ids: Array.from(selectedIds),
            action,
            notes,
          }),
          credentials: 'include',
        })

        if (!response.ok) {
          const data = await response.json()
          setError(data.error || 'Failed to perform batch action')
          return null
        }

        const result = await response.json()
        clearSelection()
        return result
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error'
        setError(message)
        console.error('[v0] Batch action error:', err)
        return null
      } finally {
        setIsProcessing(false)
      }
    },
    [selectedIds, clearSelection]
  )

  return {
    selectedIds: Array.from(selectedIds),
    selectedCount: selectedIds.size,
    isProcessing,
    error,
    toggleSelect,
    toggleSelectAll,
    clearSelection,
    performBatchAction,
  }
}
