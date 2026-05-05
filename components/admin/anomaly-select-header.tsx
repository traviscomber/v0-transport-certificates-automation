'use client'

import { Button } from '@/components/ui/button'
import { Download, Trash2 } from 'lucide-react'
import { useState } from 'react'

interface AnomalySelectHeaderProps {
  totalItems: number
  selectedCount: number
  onSelectAll: (checked: boolean) => void
  onBatchApprove: () => void
  onBatchReject: () => void
  onBatchExport: () => void
  onBatchDelete: () => void
  isLoading?: boolean
}

export function AnomalySelectHeader({
  totalItems,
  selectedCount,
  onSelectAll,
  onBatchApprove,
  onBatchReject,
  onBatchExport,
  onBatchDelete,
  isLoading,
}: AnomalySelectHeaderProps) {
  const [showActions, setShowActions] = useState(false)

  const hasSelection = selectedCount > 0

  return (
    <div className="flex items-center justify-between gap-4 p-4 bg-muted/50 rounded-lg border">
      <div className="flex items-center gap-3">
        <input
          type="checkbox"
          checked={selectedCount === totalItems && totalItems > 0}
          onChange={(e) => onSelectAll(e.target.checked)}
          disabled={totalItems === 0}
          aria-label="Select all anomalies"
          className="w-4 h-4 rounded"
        />
        <span className="text-sm font-medium text-muted-foreground">
          {selectedCount > 0
            ? `${selectedCount} de ${totalItems} seleccionado(s)`
            : `${totalItems} anomalías`}
        </span>
      </div>

      {hasSelection && (
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onBatchApprove}
            disabled={isLoading}
            className="text-green-600 hover:text-green-700"
          >
            Aprobar ({selectedCount})
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={onBatchReject}
            disabled={isLoading}
            className="text-red-600 hover:text-red-700"
          >
            Rechazar ({selectedCount})
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={onBatchExport}
            disabled={isLoading}
          >
            <Download className="h-4 w-4 mr-1" />
            Exportar
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={onBatchDelete}
            disabled={isLoading}
            className="text-red-600 hover:text-red-700"
          >
            <Trash2 className="h-4 w-4 mr-1" />
            Eliminar
          </Button>
        </div>
      )}
    </div>
  )
}
