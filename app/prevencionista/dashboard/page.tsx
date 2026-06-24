'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { FileText, CheckCircle, Users, Download, Eye } from 'lucide-react'

interface ApprovedDocument {
  id: string
  file_name: string
  document_type_id: string
  created_at: string
  file_url: string
  subcontractor_id: string
  type_code: string
}

interface DocumentStats {
  totalApproved: number
  totalSubcontractors: number
  documentTypes: number
}

export default function PrevencionistaDashboard() {
  const [stats, setStats] = useState<DocumentStats | null>(null)
  const [documents, setDocuments] = useState<ApprovedDocument[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    async function loadData() {
      try {
        // Get document types
        const { data: types } = await supabase
          .from('subcontractor_document_types')
          .select('id, code')
          .eq('is_active', true)
          .order('code')

        // Get ALL approved documents using pagination
        const allDocs: ApprovedDocument[] = []
        let offset = 0
        const batchSize = 1000
        let hasMore = true

        while (hasMore) {
          const { data: batch } = await supabase
            .from('subcontractor_documents')
            .select('id, file_name, document_type_id, created_at, file_url, subcontractor_id')
            .eq('status', 'approved')
            .order('created_at', { ascending: false })
            .range(offset, offset + batchSize - 1)

          if (!batch || batch.length === 0) {
            hasMore = false
          } else {
            allDocs.push(...batch)
            offset += batchSize
          }
        }

        // Map document type codes
        const typesMap = new Map((types as any[])?.map((t: any) => [t.id, t.code]) || [])
        const mappedDocs = allDocs.map((d: any) => ({
          ...d,
          type_code: typesMap.get(d.document_type_id) || 'UNKNOWN'
        }))

        // Get stats
        const { data: subcontractors } = await supabase
          .from('subcontractor_documents')
          .select('subcontractor_id')
          .eq('status', 'approved')

        const uniqueSubcontractors = new Set(
          (subcontractors as any[])?.map((d: any) => d.subcontractor_id)
        ).size

        setDocuments(mappedDocs.slice(0, 10)) // Show first 10 on dashboard
        setStats({
          totalApproved: allDocs.length,
          totalSubcontractors: uniqueSubcontractors,
          documentTypes: types?.length || 0,
        })
      } catch (error) {
        console.error('Error loading data:', error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [supabase])

  const handleDownload = async (doc: ApprovedDocument) => {
    try {
      const response = await fetch(doc.file_url)
      if (!response.ok) {
        throw new Error('Error downloading file')
      }

      const blob = await response.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = doc.file_name
      document.body.appendChild(a)
      a.click()
      URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      console.error('Error downloading document:', error)
      alert('Error al descargar el documento')
    }
  }

  const handlePreview = (doc: ApprovedDocument) => {
    window.open(doc.file_url, '_blank')
  }

  return (
    <div className="min-h-screen bg-slate-950">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-100 mb-2">
            Panel de Prevención
          </h1>
          <p className="text-slate-400">
            Acceso de solo lectura a documentos aprobados
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-slate-900 border-slate-700">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-300 flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                Documentos Aprobados
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-100">
                {loading ? '-' : stats?.totalApproved}
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Disponibles para revisar
              </p>
            </CardContent>
          </Card>

          <Card className="bg-slate-900 border-slate-700">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-300 flex items-center gap-2">
                <Users className="w-4 h-4 text-blue-500" />
                Subcontratistas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-100">
                {loading ? '-' : stats?.totalSubcontractors}
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Con documentos aprobados
              </p>
            </CardContent>
          </Card>

          <Card className="bg-slate-900 border-slate-700">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-300 flex items-center gap-2">
                <FileText className="w-4 h-4 text-purple-500" />
                Tipos de Documentos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-100">
                {loading ? '-' : stats?.documentTypes}
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Disponibles en el sistema
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Recent Documents */}
        <Card className="bg-slate-900 border-slate-700">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Documentos Recientes</CardTitle>
                <CardDescription>Últimos 10 documentos aprobados</CardDescription>
              </div>
              <Link href="/prevencionista/documentos">
                <Button variant="outline" size="sm" className="text-teal-400 border-teal-400/50 hover:bg-teal-500/10">
                  Ver todos
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8 text-slate-400">
                Cargando documentos...
              </div>
            ) : documents.length === 0 ? (
              <div className="text-center py-8 text-slate-400">
                No hay documentos aprobados
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-700">
                      <th className="text-left py-3 px-4 text-slate-400 font-medium">Nombre</th>
                      <th className="text-left py-3 px-4 text-slate-400 font-medium">Tipo</th>
                      <th className="text-left py-3 px-4 text-slate-400 font-medium">Fecha</th>
                      <th className="text-right py-3 px-4 text-slate-400 font-medium">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {documents.map(doc => (
                      <tr key={doc.id} className="border-b border-slate-800 hover:bg-slate-800/50">
                        <td className="py-3 px-4 text-slate-100 flex items-center gap-2">
                          <FileText className="w-4 h-4 text-slate-500" />
                          <span className="truncate">{doc.file_name}</span>
                        </td>
                        <td className="py-3 px-4 text-slate-300 text-xs">
                          {doc.type_code}
                        </td>
                        <td className="py-3 px-4 text-slate-400 text-xs">
                          {new Date(doc.created_at).toLocaleDateString('es-CL')}
                        </td>
                        <td className="py-3 px-4 text-right flex gap-2 justify-end">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handlePreview(doc)}
                            className="text-blue-400 hover:bg-blue-500/20"
                            title="Ver documento"
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDownload(doc)}
                            className="text-teal-400 hover:bg-teal-500/20"
                            title="Descargar documento"
                          >
                            <Download className="w-4 h-4" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
