'use client'

import { useEffect, useState, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Filter, Loader2, RefreshCw } from 'lucide-react'
import Link from 'next/link'
import { RejectedDocumentsList } from '@/components/rejected-documents-list'

export default function RechazadosPage() {
  const [allData, setAllData] = useState<any>(null)
  const [selectedEjecutiva, setSelectedEjecutiva] = useState<string>('all')
  const [dateFilter, setDateFilter] = useState<'all' | 'today' | 'week' | 'month'>('all')
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [ejecutivas, setEjecutivas] = useState<{ name: string; count: number }[]>([])

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/company/documents/rechazados', {
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
        console.error('[v0] Error fetching rejected documents:', error)
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

    // Calculate date range for filtering
    let minDate: Date | null = null
    if (dateFilter !== 'all') {
      const now = new Date()
      if (dateFilter === 'today') {
        minDate = new Date(now.getFullYear(), now.getMonth(), now.getDate())
      } else if (dateFilter === 'week') {
        minDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
      } else if (dateFilter === 'month') {
        minDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
      }
    }

    let filteredSubDocs = allData.subDocs || []
    let filteredConductorDocs = allData.conductorDocs || []

    // Apply ejecutiva filter
    if (selectedEjecutiva !== 'all') {
      filteredSubDocs = filteredSubDocs.filter((doc: any) => {
        const docEjecutiva = doc.reviewed_by_ejecutiva || 'Sin asignar'
        return docEjecutiva === selectedEjecutiva
      })
      filteredConductorDocs = filteredConductorDocs.filter((doc: any) => {
        const docEjecutiva = doc.ejecutiva || 'Sin asignar'
        return docEjecutiva === selectedEjecutiva
      })
    }

    // Apply date filter
    if (minDate) {
      filteredSubDocs = filteredSubDocs.filter((doc: any) => {
        const docDate = new Date(doc.updated_at || doc.created_at)
        return docDate >= minDate!
      })
      filteredConductorDocs = filteredConductorDocs.filter((doc: any) => {
        const docDate = new Date(doc.updated_at || doc.created_at)
        return docDate >= minDate!
      })
    }

    return {
      conductorDocs: filteredConductorDocs,
      subDocs: filteredSubDocs
    }
  }, [allData, selectedEjecutiva, dateFilter])

  const handleRefresh = async () => {
    setRefreshing(true)
    try {
      const response = await fetch('/api/company/documents/rechazados', {
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
          <Loader2 className="h-8 w-8 text-red-500 animate-spin" />
          <p className="text-slate-400">Cargando documentos...</p>
        </div>
      </div>
    )
  }

  const totalRejected = (allData?.conductorDocs?.length || 0) + (allData?.subDocs?.length || 0)
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
            <h1 className="text-2xl font-bold text-slate-100">Documentos Rechazados</h1>
            <p className="text-sm text-slate-400">
              {filteredCount} de {totalRejected} documentos
            </p>
          </div>
        </div>
        
        <Button
          onClick={handleRefresh}
          disabled={refreshing}
          className="bg-red-600 hover:bg-red-700 text-white"
          size="sm"
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
          Actualizar
        </Button>
      </div>

      {/* Ejecutiva Filter - REMOVED: All executivas see all documents */}

      {/* Date Filter */}
      <div className="rounded-lg bg-gradient-to-r from-slate-800/70 to-slate-800/40 border border-blue-500/30 p-4 shadow-lg">
        <div className="flex items-center gap-3 mb-4">
          <Filter className="h-5 w-5 text-blue-400" />
          <span className="text-sm font-semibold text-slate-100">Filtrar por Fecha:</span>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setDateFilter('all')}
            className={`px-3 py-2 text-sm font-medium rounded-full transition-all hover:scale-105 cursor-pointer ${
              dateFilter === 'all'
                ? 'bg-blue-500 text-white border border-blue-600'
                : 'bg-slate-700 text-slate-200 border border-slate-600 hover:bg-slate-600'
            }`}
          >
            Todos
          </button>

          <button
            type="button"
            onClick={() => setDateFilter('today')}
            className={`px-3 py-2 text-sm font-medium rounded-full transition-all hover:scale-105 cursor-pointer ${
              dateFilter === 'today'
                ? 'bg-blue-500 text-white border border-blue-600'
                : 'bg-slate-700 text-slate-200 border border-slate-600 hover:bg-slate-600'
            }`}
          >
            Hoy
          </button>

          <button
            type="button"
            onClick={() => setDateFilter('week')}
            className={`px-3 py-2 text-sm font-medium rounded-full transition-all hover:scale-105 cursor-pointer ${
              dateFilter === 'week'
                ? 'bg-blue-500 text-white border border-blue-600'
                : 'bg-slate-700 text-slate-200 border border-slate-600 hover:bg-slate-600'
            }`}
          >
            Última semana
          </button>

          <button
            type="button"
            onClick={() => setDateFilter('month')}
            className={`px-3 py-2 text-sm font-medium rounded-full transition-all hover:scale-105 cursor-pointer ${
              dateFilter === 'month'
                ? 'bg-blue-500 text-white border border-blue-600'
                : 'bg-slate-700 text-slate-200 border border-slate-600 hover:bg-slate-600'
            }`}
          >
            Último mes
          </button>
        </div>
      </div>

      {/* Documents List - key forces re-render when filter changes */}
      <RejectedDocumentsList
        key={`${selectedEjecutiva}-${filteredData?.subDocs?.length || 0}`}
        conductorDocs={filteredData?.conductorDocs || []}
        subDocs={filteredData?.subDocs || []}
      />
    </div>
  )
}
