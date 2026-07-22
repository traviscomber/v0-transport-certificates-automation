'use client'

import { useEffect, useState } from 'react'
import { Loader2 } from 'lucide-react'
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
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 text-orange-500 animate-spin" />
          <p className="text-slate-400">Cargando documentos...</p>
        </div>
      </div>
    )
  }

  return (
    <PendingDocumentsList
      conductorDocs={allData?.conductorDocs || []}
      subDocs={allData?.subDocs || []}
    />
  )
}
