'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Loader2, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { RejectedDocumentsList } from '@/components/rejected-documents-list'

export default function RechazadosPage() {
  const [allData, setAllData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/company/documents/rechazados', {
          cache: 'no-store',
        })
        const data = await response.json()
        setAllData(data)
      } catch (error) {
        console.error('[v0] Error fetching rejected documents:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const handleRefresh = async () => {
    setRefreshing(true)
    try {
      const response = await fetch('/api/company/documents/rechazados', {
        cache: 'no-store',
      })
      const data = await response.json()
      setAllData(data)
    } catch (error) {
      console.error('[v0] Error refreshing documents:', error)
    } finally {
      setRefreshing(false)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-7 w-7 animate-spin text-[var(--cf-accent)]" />
          <p className="text-sm text-[var(--cf-text-muted)]">Cargando documentos rechazados...</p>
        </div>
      </div>
    )
  }

  const totalRejected = (allData?.conductorDocs?.length || 0) + (allData?.subDocs?.length || 0)

  return (
    <div className="space-y-5">
      <header className="flex flex-col gap-3 border-b border-[var(--cf-line)] pb-5 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <Link href="/dashboard/company/documentos">
            <Button
              variant="ghost"
              size="sm"
              className="-ml-2 mb-2 h-8 rounded-[5px] px-2 text-xs text-[var(--cf-text-muted)] hover:bg-[var(--cf-surface-2)] hover:text-[var(--cf-text)]"
            >
              <ArrowLeft className="mr-1.5 h-3.5 w-3.5" />
              Documentos
            </Button>
          </Link>
          <p className="text-xs font-medium uppercase tracking-[0.16em] text-[var(--cf-text-muted)]">Requieren corrección</p>
          <h1 className="mt-2 text-2xl font-medium tracking-tight text-[var(--cf-text)]">Documentos Rechazados</h1>
          <p className="mt-2 text-sm text-[var(--cf-text-muted)]">
            {totalRejected.toLocaleString('es-CL')} documentos requieren corrección o nueva evidencia.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="rounded-[5px] border border-[var(--cf-line)] bg-[var(--cf-surface)] px-3 py-2 text-right">
            <p className="text-lg font-medium tabular-nums text-[var(--cf-danger)]">{totalRejected.toLocaleString('es-CL')}</p>
            <p className="text-[11px] uppercase tracking-[0.12em] text-[var(--cf-text-muted)]">Rechazados actuales</p>
          </div>
          <Button
            onClick={handleRefresh}
            disabled={refreshing}
            size="sm"
            variant="outline"
            className="h-9 rounded-[5px] border-[var(--cf-line)] bg-transparent px-3 text-xs text-[var(--cf-text-secondary)] hover:bg-[var(--cf-surface-2)] hover:text-[var(--cf-text)]"
          >
            <RefreshCw className={`mr-1.5 h-3.5 w-3.5 ${refreshing ? 'animate-spin' : ''}`} />
            Actualizar
          </Button>
        </div>
      </header>

      <div className="border-l-2 border-[var(--cf-danger)]/60 px-3 py-1 text-xs leading-5 text-[var(--cf-text-muted)]">
        Filtra por ejecutiva, empresa, tipo de documento y período desde el listado. El color rojo se reserva sólo para el estado rechazado.
      </div>

      <RejectedDocumentsList
        conductorDocs={allData?.conductorDocs || []}
        subDocs={allData?.subDocs || []}
      />
    </div>
  )
}
