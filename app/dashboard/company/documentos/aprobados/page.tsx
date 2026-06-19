'use client'

import { useEffect, useState, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Filter, Loader2, RefreshCw, Calendar } from 'lucide-react'
import Link from 'next/link'
import { ApprovedDocumentsList } from '@/components/approved-documents-list'

export default function AprobadosPage() {
  const [allData, setAllData] = useState<any>(null)
  const today = new Date()
  const [selectedMonth, setSelectedMonth] = useState(String(today.getMonth() + 1).padStart(2, '0'))
  const [selectedYear, setSelectedYear] = useState(String(today.getFullYear()))
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/company/documents/aprobados', {
          cache: 'no-store'
        })
        const data = await response.json()
        setAllData(data)
      } catch (error) {
        console.error('[v0] Error fetching approved documents:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
    
    // Auto-refresh every 30 seconds - DISABLED to prevent closing preview
    // const interval = setInterval(fetchData, 30000)
    
    return () => {
      // Cleanup if we ever add back the interval
    }
  }, [])

  const filteredData = useMemo(() => {
    if (!allData) return null

    // Calculate date range for selected month/year
    const monthNum = parseInt(selectedMonth, 10)
    const yearNum = parseInt(selectedYear, 10)
    const startDate = new Date(yearNum, monthNum - 1, 1)
    const endDate = new Date(yearNum, monthNum, 0)

    let filteredSubDocs = allData.subDocs || []
    let filteredConductorDocs = allData.conductorDocs || []

    // Apply month/year filter
    filteredSubDocs = filteredSubDocs.filter((doc: any) => {
      const docDate = new Date(doc.updated_at || doc.created_at)
      return docDate >= startDate && docDate <= endDate
    })
    filteredConductorDocs = filteredConductorDocs.filter((doc: any) => {
      const docDate = new Date(doc.updated_at || doc.created_at)
      return docDate >= startDate && docDate <= endDate
    })

    return {
      conductorDocs: filteredConductorDocs,
      subDocs: filteredSubDocs
    }
  }, [allData, selectedMonth, selectedYear])

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

      {/* Ejecutiva Filter - REMOVED: All executivas see all documents */}

      {/* Date Filter */}
      <div className="rounded-lg bg-gradient-to-r from-slate-800/70 to-slate-800/40 border border-blue-500/30 p-4 shadow-lg">
        <div className="flex items-center gap-3 mb-4">
          <Calendar className="h-5 w-5 text-blue-400" />
          <span className="text-sm font-semibold text-slate-100">Selecciona Período:</span>
        </div>

        <div className="flex gap-3 items-end">
          <div className="flex-1">
            <label className="text-xs font-semibold text-slate-300 mb-2 block">Mes</label>
            <select 
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="w-full rounded-md border border-slate-600 bg-slate-700/50 px-3 py-2 text-sm text-white"
            >
              <option value="01">Enero</option>
              <option value="02">Febrero</option>
              <option value="03">Marzo</option>
              <option value="04">Abril</option>
              <option value="05">Mayo</option>
              <option value="06">Junio</option>
              <option value="07">Julio</option>
              <option value="08">Agosto</option>
              <option value="09">Septiembre</option>
              <option value="10">Octubre</option>
              <option value="11">Noviembre</option>
              <option value="12">Diciembre</option>
            </select>
          </div>
          <div className="flex-1">
            <label className="text-xs font-semibold text-slate-300 mb-2 block">Año</label>
            <select 
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="w-full rounded-md border border-slate-600 bg-slate-700/50 px-3 py-2 text-sm text-white"
            >
              <option value="2024">2024</option>
              <option value="2025">2025</option>
              <option value="2026">2026</option>
            </select>
          </div>
        </div>
      </div>
            Último mes
          </button>
        </div>
      </div>

      {/* Documents List - key forces re-render when filter changes */}
      <ApprovedDocumentsList
        key={`approved-${dateFilter}-${filteredData?.subDocs?.length || 0}`}
        conductorDocs={filteredData?.conductorDocs || []}
        subDocs={filteredData?.subDocs || []}
      />
    </div>
  )
}
