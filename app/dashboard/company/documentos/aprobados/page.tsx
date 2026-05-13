'use client'

import { useEffect, useState, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Filter, Loader2, RefreshCw } from 'lucide-react'
import Link from 'next/link'
import { ApprovedDocumentsList } from '@/components/approved-documents-list'

export default function AprobadosPage() {
  const [allData, setAllData] = useState<any>(null)
  const [selectedEjecutiva, setSelectedEjecutiva] = useState<string>('all')
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [ejecutivas, setEjecutivas] = useState<{ name: string; count: number }[]>([])

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/company/documents/aprobados', {
          cache: 'no-store'
        })
        const data = await response.json()
        setAllData(data)

        // Extract unique ejecutivas from BOTH conductor and subcontractor documents
        const ejecutivasMap = new Map<string, number>()
        
        // Count from subcontractor documents
        data.subDocs?.forEach((doc: any) => {
          const ejecutiva = doc.reviewed_by_ejecutiva || 'Sin asignar'
          ejecutivasMap.set(ejecutiva, (ejecutivasMap.get(ejecutiva) || 0) + 1)
        })
        
        // Count from conductor documents
        data.conductorDocs?.forEach((doc: any) => {
          const ejecutiva = doc.ejecutiva || 'Sin asignar'
          ejecutivasMap.set(ejecutiva, (ejecutivasMap.get(ejecutiva) || 0) + 1)
        })

        // Sort: "Sin asignar" last, others by count descending
        const sorted = Array.from(ejecutivasMap.entries())
          .map(([name, count]) => ({ name, count }))
          .sort((a, b) => {
            if (a.name === 'Sin asignar') return 1
            if (b.name === 'Sin asignar') return -1
            return b.count - a.count
          })

        setEjecutivas(sorted)
      } catch (error) {
        console.error('[v0] Error fetching approved documents:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchData, 30000)
    
    return () => clearInterval(interval)
  }, [])

  const filteredData = useMemo(() => {
    if (!allData) return null

    if (selectedEjecutiva === 'all') {
      return allData
    }

    const filteredSubDocs = allData.subDocs?.filter((doc: any) => {
      const docEjecutiva = doc.reviewed_by_ejecutiva || 'Sin asignar'
      return docEjecutiva === selectedEjecutiva
    }) || []

    const filteredConductorDocs = allData.conductorDocs?.filter((doc: any) => {
      const docEjecutiva = doc.ejecutiva || 'Sin asignar'
      return docEjecutiva === selectedEjecutiva
    }) || []

    return {
      conductorDocs: filteredConductorDocs,
      subDocs: filteredSubDocs
    }
  }, [allData, selectedEjecutiva])

  const handleRefresh = async () => {
    setRefreshing(true)
    try {
      const response = await fetch('/api/company/documents/aprobados', {
        cache: 'no-store'
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
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 text-green-500 animate-spin" />
          <p className="text-slate-400">Cargando documentos...</p>
        </div>
      </div>
    )
  }

  const totalApproved = (allData?.conductorDocs?.length || 0) + (allData?.subDocs?.length || 0)
  const filteredCount = (filteredData?.conductorDocs?.length || 0) + (filteredData?.subDocs?.length || 0)

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
            <h1 className="text-2xl font-bold text-slate-100">Documentos Aprobados</h1>
            <p className="text-sm text-slate-400">
              {filteredCount} de {totalApproved} documentos
            </p>
          </div>
        </div>
        
        <Button
          onClick={handleRefresh}
          disabled={refreshing}
          className="bg-green-600 hover:bg-green-700 text-white"
          size="sm"
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
          Actualizar
        </Button>
      </div>

      {/* Ejecutiva Filter - Enhanced */}
      <div className="rounded-lg bg-gradient-to-r from-slate-800/70 to-slate-800/40 border border-green-500/30 p-4 shadow-lg">
        <div className="flex items-center gap-3 mb-4">
          <Filter className="h-5 w-5 text-green-400" />
          <span className="text-sm font-semibold text-slate-100">Filtrar por Ejecutiva:</span>
          <span className="ml-auto text-xs text-slate-400 bg-slate-700/50 px-2 py-1 rounded">
            {ejecutivas.length} ejecutivas
          </span>
        </div>

        {ejecutivas.length === 0 ? (
          <p className="text-sm text-slate-400 italic">
            Todos los documentos están sin asignar a una ejecutiva específica
          </p>
        ) : (
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setSelectedEjecutiva('all')}
              className={`px-3 py-2 text-sm font-medium rounded-full transition-all hover:scale-105 cursor-pointer ${
                selectedEjecutiva === 'all'
                  ? 'bg-green-600 text-white border border-green-700'
                  : 'bg-slate-700 text-slate-200 border border-slate-600 hover:bg-slate-600'
              }`}
            >
              Todas ({totalApproved})
            </button>

            {ejecutivas.map(({ name, count }) => (
              <button
                key={name}
                type="button"
                onClick={() => setSelectedEjecutiva(name)}
                className={`px-3 py-2 text-sm font-medium rounded-full transition-all hover:scale-105 cursor-pointer ${
                  selectedEjecutiva === name
                    ? 'bg-green-600 text-white border border-green-700'
                    : 'bg-slate-700 text-slate-200 border border-slate-600 hover:bg-slate-600'
                }`}
              >
                {name === 'Sin asignar' ? '📋' : '👤'} {name} ({count})
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Documents List - key forces re-render when filter changes */}
      <ApprovedDocumentsList
        key={`${selectedEjecutiva}-${filteredData?.subDocs?.length || 0}`}
        conductorDocs={filteredData?.conductorDocs || []}
        subDocs={filteredData?.subDocs || []}
      />
    </div>
  )
}
