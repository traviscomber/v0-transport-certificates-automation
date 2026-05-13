'use client'

import { useEffect, useState } from 'react'
import { XCircle } from 'lucide-react'
import { RejectedDocumentsList } from '@/components/rejected-documents-list'

export default function RejectedDocumentsPage() {
  const [conductorDocs, setConductorDocs] = useState([])
  const [subDocs, setSubDocs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchRejectedDocuments() {
      try {
        setLoading(true)
        const response = await fetch('/api/company/documents/rechazados')
        
        if (!response.ok) {
          throw new Error('Failed to fetch rejected documents')
        }

        const data = await response.json()
        setConductorDocs(data.conductorDocs || [])
        setSubDocs(data.subDocs || [])
        setError(null)
      } catch (err) {
        console.error('[v0] Error fetching rejected documents:', err)
        setError(err instanceof Error ? err.message : 'Error loading documents')
        setConductorDocs([])
        setSubDocs([])
      } finally {
        setLoading(false)
      }
    }

    fetchRejectedDocuments()
  }, [])

  const totalRejected = conductorDocs.length + subDocs.length

  return (
    <div className="flex flex-col gap-8 p-6">
      {/* Header */}
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-500/10 border border-red-500/20">
            <XCircle className="h-6 w-6 text-red-500" />
          </div>
          <h1 className="text-4xl font-bold text-white">Documentos Rechazados</h1>
        </div>
        <p className="text-slate-400">Historial completo de documentos rechazados • Total: {totalRejected} documentos</p>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-slate-400">Cargando documentos...</div>
        </div>
      ) : error ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-red-400">Error: {error}</div>
        </div>
      ) : (
        <RejectedDocumentsList 
          conductorDocs={conductorDocs as any} 
          subDocs={subDocs as any} 
        />
      )}
    </div>
  )
}
