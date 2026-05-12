'use client'

import { useEffect, useState, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Filter, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { PendingDocumentsList } from '@/components/pending-documents-list'
import { Badge } from '@/components/ui/badge'

export default function PendientesPage() {
  const [allData, setAllData] = useState<any>(null)
  const [selectedEjecutiva, setSelectedEjecutiva] = useState<string>('all')
  const [loading, setLoading] = useState(true)
  const [ejecutivas, setEjecutivas] = useState<{ name: string; count: number }[]>([])

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/dashboard/pending-documents', {
          cache: 'no-store'
        })
        const data = await response.json()
        setAllData(data)

        // Extract unique ejecutivas with counts
        const ejecutivasMap = new Map<string, number>()
        data.subDocs?.forEach((doc: any) => {
          const ejecutiva = doc.ejecutiva || 'Sin asignar'
          ejecutivasMap.set(ejecutiva, (ejecutivasMap.get(ejecutiva) || 0) + 1)
        })

        const sorted = Array.from(ejecutivasMap.entries())
          .map(([name, count]) => ({ name, count }))
          .sort((a, b) => b.count - a.count)

        setEjecutivas(sorted)
      } catch (error) {
        console.error('[v0] Error fetching pending documents:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const filteredData = useMemo(() => {
    if (!allData) return null

    if (selectedEjecutiva === 'all') {
      return allData
    }

    return {
      ...allData,
      subDocs: allData.subDocs?.filter((doc: any) =>
        (doc.ejecutiva || 'Sin asignar') === selectedEjecutiva
      ) || []
    }
  }, [allData, selectedEjecutiva])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 text-orange-500 animate-spin" />
          <p className="text-slate-400">Cargando documentos...</p>
        </div>
      </div>
    )
  }

  const totalPending = allData?.subDocs?.length || 0
  const filteredCount = filteredData?.subDocs?.length || 0

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/dashboard/company/documentos">
            <Button variant="ghost" size="sm" className="text-slate-400 hover:text-slate-200">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-slate-100">Documentos Pendientes</h1>
            <p className="text-sm text-slate-400">
              {filteredCount} de {totalPending} documentos
            </p>
          </div>
        </div>
      </div>

      {/* Ejecutiva Filter */}
      <div className="rounded-lg bg-slate-800/50 border border-slate-700 p-4">
        <div className="flex items-center gap-3 mb-4">
          <Filter className="h-4 w-4 text-slate-400" />
          <span className="text-sm font-medium text-slate-200">Filtrar por ejecutiva:</span>
        </div>

        <div className="flex flex-wrap gap-2">
          <Badge
            variant={selectedEjecutiva === 'all' ? 'default' : 'outline'}
            className="cursor-pointer px-3 py-1.5"
            onClick={() => setSelectedEjecutiva('all')}
          >
            Todas ({totalPending})
          </Badge>

          {ejecutivas.map(({ name, count }) => (
            <Badge
              key={name}
              variant={selectedEjecutiva === name ? 'default' : 'outline'}
              className="cursor-pointer px-3 py-1.5"
              onClick={() => setSelectedEjecutiva(name)}
            >
              {name} ({count})
            </Badge>
          ))}
        </div>
      </div>

      {/* Documents List */}
      <PendingDocumentsList
        conductorDocs={filteredData?.conductorDocs || []}
        subDocs={filteredData?.subDocs || []}
      />
    </div>
  )
}
