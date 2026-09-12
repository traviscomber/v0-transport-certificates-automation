'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { PendingDocumentsList } from '@/components/pending-documents-list'

export default function PendientesPage() {
  const [allData, setAllData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/dashboard/pending-documents', {
          cache: 'no-store',
        })
        const data = await response.json()
        setAllData(data)
      } catch (error) {
        console.error('[v0] Error fetching pending documents:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-7 w-7 animate-spin text-[var(--cf-accent)]" />
          <p className="text-sm text-[var(--cf-text-muted)]">Cargando documentos pendientes...</p>
        </div>
      </div>
    )
  }

  const totalPending = (allData?.conductorDocs?.length || 0) + (allData?.subDocs?.length || 0)

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
          <p className="text-xs font-medium uppercase tracking-[0.16em] text-[var(--cf-text-muted)]">Revisión humana</p>
          <h1 className="mt-2 text-2xl font-medium tracking-tight text-[var(--cf-text)]">Documentos Pendientes</h1>
          <p className="mt-2 text-sm text-[var(--cf-text-muted)]">
            {totalPending.toLocaleString('es-CL')} documentos esperan revisión o resolución.
          </p>
        </div>

        <div className="rounded-[5px] border border-[var(--cf-line)] bg-[var(--cf-surface)] px-3 py-2 text-right">
          <p className="text-lg font-medium tabular-nums text-[var(--cf-text)]">{totalPending.toLocaleString('es-CL')}</p>
          <p className="text-[11px] uppercase tracking-[0.12em] text-[var(--cf-text-muted)]">Pendientes actuales</p>
        </div>
      </header>

      <PendingDocumentsList
        conductorDocs={allData?.conductorDocs || []}
        subDocs={allData?.subDocs || []}
      />
    </div>
  )
}
