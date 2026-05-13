'use client'

import { useEffect, useState } from 'react'
import { CheckCircle2 } from 'lucide-react'
import { ApprovedDocumentsList } from '@/components/approved-documents-list'

export default function ApprovedDocumentsPage() {
  const [conductorDocs, setConductorDocs] = useState([])
  const [subDocs, setSubDocs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchApprovedDocuments() {
      try {
        setLoading(true)
        const response = await fetch('/api/company/documents/aprobados')
        
        if (!response.ok) {
          throw new Error('Failed to fetch approved documents')
        }

        const data = await response.json()
        setConductorDocs(data.conductorDocs || [])
        setSubDocs(data.subDocs || [])
        setError(null)
      } catch (err) {
        console.error('[v0] Error fetching approved documents:', err)
        setError(err instanceof Error ? err.message : 'Error loading documents')
        setConductorDocs([])
        setSubDocs([])
      } finally {
        setLoading(false)
      }
    }

    fetchApprovedDocuments()
  }, [])

  const totalApproved = conductorDocs.length + subDocs.length

  return (
    <div className="flex flex-col gap-8 p-6">
      {/* Header */}
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-500/10 border border-green-500/20">
            <CheckCircle2 className="h-6 w-6 text-green-500" />
          </div>
          <h1 className="text-4xl font-bold text-white">Documentos Aprobados</h1>
        </div>
        <p className="text-slate-400">Historial completo de documentos aprobados • Total: {totalApproved} documentos</p>
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
        <ApprovedDocumentsList 
          conductorDocs={conductorDocs as any} 
          subDocs={subDocs as any} 
        />
      )}
    </div>
  )
}
