'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Loader2, RefreshCw } from 'lucide-react'
import Link from 'next/link'
import { PendingDocumentsList } from '@/components/pending-documents-list'

export default function PendientesPage() {
  const [allData, setAllData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

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

    return () => {}
  }, [])

  const handleRefresh = async () => {
    setRefreshing(true)
    try {
      const response = await fetch('/api/dashboard/pending-documents', {
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
          <Loader2 className="h-8 w-8 text-orange-500 animate-spin" />
          <p className="text-slate-400">Cargando documentos...</p>
        </div>
      </div>
    )
  }

  const totalPending = (allData?.conductorDocs?.length || 0) + (allData?.subDocs?.length || 0)

  return (
    <div className="space-y-6">
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
              {totalPending} documentos para revisar
            </p>
          </div>
        </div>

        <Button
          onClick={handleRefresh}
          disabled={refreshing}
          className="bg-orange-500 hover:bg-orange-600 text-white"
          size="sm"
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
          Actualizar
        </Button>
      </div>

      <div className="rounded-lg border border-orange-500/20 bg-orange-500/5 p-4 text-sm text-slate-300">
        Filtra por ejecutiva, empresa, tipo de documento y período desde el listado.
      </div>

      <PendingDocumentsList
        conductorDocs={allData?.conductorDocs || []}
        subDocs={allData?.subDocs || []}
      />
    </div>
  )
}
