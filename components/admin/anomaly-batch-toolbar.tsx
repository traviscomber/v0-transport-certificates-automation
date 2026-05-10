'use client'

import { memo, useState } from 'react'
import { Button } from '@/components/ui/button'
import { CheckCircle, XCircle, AlertTriangle, Copy, Download, X } from 'lucide-react'
import { useBatchActions } from '@/lib/hooks/useBatchActions'

interface AnomalyBatchToolbarProps {
  totalCount: number
  onActionComplete?: () => void
}

/**
 * Batch operations toolbar for anomalies
 * Shows selected count and provides quick action buttons
 */
export const AnomalyBatchToolbar = memo(function AnomalyBatchToolbar({
  totalCount,
  onActionComplete,
}: AnomalyBatchToolbarProps) {
  const { selectedCount, selectedIds, isProcessing, error, clearSelection, performBatchAction } =
    useBatchActions()
  const [notes, setNotes] = useState('')
  const [showNotes, setShowNotes] = useState(false)

  if (selectedCount === 0) {
    return null
  }

  const handleApprove = async () => {
    const result = await performBatchAction('approved', notes)
    if (result?.success) {
      setNotes('')
      setShowNotes(false)
      onActionComplete?.()
    }
  }

  const handleReject = async () => {
    const result = await performBatchAction('rejected', notes)
    if (result?.success) {
      setNotes('')
      setShowNotes(false)
      onActionComplete?.()
    }
  }

  return (
    <div className="sticky bottom-0 left-0 right-0 bg-blue-50 border-t border-blue-200 p-4 shadow-lg">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-blue-900">
              {selectedCount} de {totalCount} seleccionados
            </span>
            {error && <span className="text-red-600 text-sm">{error}</span>}
          </div>

          <div className="flex items-center gap-2">
            {showNotes && (
              <input
                type="text"
                placeholder="Agregar notas..."
                value={notes}
                onChange={e => setNotes(e.target.value)}
                className="px-2 py-1 border rounded text-sm"
                disabled={isProcessing}
              />
            )}

            <Button
              size="sm"
              variant="outline"
              onClick={() => setShowNotes(!showNotes)}
              disabled={isProcessing}
            >
              <AlertTriangle className="h-4 w-4 mr-1" />
              Notas
            </Button>

            <Button
              size="sm"
              onClick={handleApprove}
              disabled={isProcessing}
              className="bg-green-600 hover:bg-green-700"
            >
              <CheckCircle className="h-4 w-4 mr-1" />
              Aprobar ({selectedCount})
            </Button>

            <Button
              size="sm"
              onClick={handleReject}
              disabled={isProcessing}
              className="bg-red-600 hover:bg-red-700"
            >
              <XCircle className="h-4 w-4 mr-1" />
              Rechazar ({selectedCount})
            </Button>

            <Button
              size="sm"
              variant="outline"
              onClick={clearSelection}
              disabled={isProcessing}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
})

AnomalyBatchToolbar.displayName = 'AnomalyBatchToolbar'
