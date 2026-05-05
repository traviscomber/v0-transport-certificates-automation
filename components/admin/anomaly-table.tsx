'use client'

import { memo } from 'react'
import { AnomalyWithDetails } from '@/lib/anomalies/types'
import { CheckCircle, AlertTriangle } from 'lucide-react'
import { AnomalyRow } from './anomaly-row'

interface AnomalyTableProps {
  anomalies: AnomalyWithDetails[]
  loading?: boolean
  onViewDetails: (anomaly: AnomalyWithDetails) => void
}

/**
 * Optimized anomaly table with:
 * - Memoized row components to prevent unnecessary re-renders
 * - Proper loading state with skeleton UI
 * - Empty state handling
 * - Uses AnomalyRow component which implements React.memo
 */
export const AnomalyTable = memo(
  function AnomalyTable({ anomalies, loading, onViewDetails }: AnomalyTableProps) {
    if (loading) {
      return (
        <div className="flex items-center justify-center py-8">
          <p className="text-muted-foreground">Cargando anomalías...</p>
        </div>
      )
    }

    if (anomalies.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-12">
          <CheckCircle className="h-12 w-12 text-green-500 mb-4" />
          <p className="text-lg font-semibold text-foreground">Sin anomalías detectadas</p>
          <p className="text-sm text-muted-foreground mt-2">Todos los documentos se ven bien.</p>
        </div>
      )
    }

    return (
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="px-4 py-3 text-left font-semibold">Tipo de Anomalía</th>
              <th className="px-4 py-3 text-left font-semibold">Severidad</th>
              <th className="px-4 py-3 text-left font-semibold">Documento</th>
              <th className="px-4 py-3 text-left font-semibold">Conductor</th>
              <th className="px-4 py-3 text-left font-semibold">Detectado</th>
              <th className="px-4 py-3 text-left font-semibold">Estado</th>
              <th className="px-4 py-3 text-right font-semibold">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {anomalies.map(anomaly => (
              <AnomalyRow
                key={anomaly.id}
                anomaly={anomaly}
                onViewDetails={onViewDetails}
              />
            ))}
          </tbody>
        </table>
      </div>
    )
  }
)

AnomalyTable.displayName = 'AnomalyTable'
