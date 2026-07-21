'use client'

import { useEffect, useMemo, useState } from 'react'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Loader2, RefreshCw } from 'lucide-react'
import Link from 'next/link'
import { ApprovedDocumentsList } from '@/components/approved-documents-list'
import { DatePeriodFilter } from '@/components/date-period-filter'
import { ALL_VALUE, filterByMonthYear, getMonthLabel, type DateFilterValue } from '@/lib/date-filters'
import { getDocumentPeriodDate } from '@/lib/document-period'

export default function AprobadosPage() {
  const [allData, setAllData] = useState<any>(null)
  const [period, setPeriod] = useState<DateFilterValue>({
    month: ALL_VALUE,
    year: ALL_VALUE,
  })
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/company/documents/aprobados', {
          cache: 'no-store',
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
  }, [])

  const filteredData = useMemo(() => {
    if (!allData) return null

    return {
      conductorDocs: filterByMonthYear<any>(
        allData.conductorDocs || [],
        (doc) => getDocumentPeriodDate(doc),
        period.month,
        period.year
      ),
      subDocs: filterByMonthYear<any>(
        allData.subDocs || [],
        (doc) => getDocumentPeriodDate(doc),
        period.month,
        period.year
      ),
    }
  }, [allData, period.month, period.year])

  const handleRefresh = async () => {
    setRefreshing(true)
    try {
      const response = await fetch('/api/company/documents/aprobados', {
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
  const periodLabel = getMonthLabel(period.month, period.year)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
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

      <div className="rounded-lg bg-gradient-to-r from-slate-800/70 to-slate-800/40 border border-blue-500/30 p-4 shadow-lg space-y-3">
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-blue-400" />
          <span className="text-sm font-semibold text-slate-100">Período histórico</span>
        </div>
        <DatePeriodFilter
          value={period}
          onChange={setPeriod}
          onClear={() => setPeriod({ month: ALL_VALUE, year: ALL_VALUE })}
        />
        <p className="text-sm text-slate-300">
          Mostrando {periodLabel.toLowerCase()} para revisión de ejecutivas.
        </p>
      </div>

      <ApprovedDocumentsList
        key={`approved-${period.month}-${period.year}-${filteredData?.subDocs?.length || 0}`}
        conductorDocs={filteredData?.conductorDocs || []}
        subDocs={filteredData?.subDocs || []}
      />
    </div>
  )
}
