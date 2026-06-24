'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Download, FileText, Filter } from 'lucide-react'
import Link from 'next/link'

interface ApprovedDocument {
  id: string
  file_name: string
  document_type_id: string
  created_at: string
  file_url: string
  subcontractor_id: string
  type_code: string
}

export default function PrevencionistaDocumentos() {
  const [documents, setDocuments] = useState<ApprovedDocument[]>([])
  const [filteredDocuments, setFilteredDocuments] = useState<ApprovedDocument[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [typeFilter, setTypeFilter] = useState<string>('')
  const [documentTypes, setDocumentTypes] = useState<{ id: string; code: string }[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize] = useState(50)
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

        setDocumentTypes(types || [])

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

        setDocuments(mappedDocs)
        setFilteredDocuments(mappedDocs)
      } catch (error) {
        console.error('Error loading documents:', error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [supabase])

  // Apply filters
  useEffect(() => {
    let filtered = documents

    if (searchTerm) {
      filtered = filtered.filter(d =>
        d.file_name.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (typeFilter) {
      filtered = filtered.filter(d => d.type_code === typeFilter)
    }

    setFilteredDocuments(filtered)
    setCurrentPage(1) // Reset to first page when filters change
  }, [searchTerm, typeFilter, documents])

  // Pagination
  const totalPages = Math.ceil(filteredDocuments.length / pageSize)
  const startIndex = (currentPage - 1) * pageSize
  const endIndex = startIndex + pageSize
  const displayedDocuments = filteredDocuments.slice(startIndex, endIndex)

  const handleDownload = async (doc: ApprovedDocument) => {
    try {
      // file_url is already a public URL, we can download directly
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
    // Navigate directly to file URL (opens in new tab)
    const link = document.createElement('a')
    link.href = doc.file_url
    link.target = '_blank'
    link.rel = 'noopener noreferrer'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="min-h-screen bg-slate-950">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-slate-100 mb-2">
                Documentos Aprobados
              </h1>
              <p className="text-slate-400">
                Solo lectura y descarga de documentos aprobados
              </p>
            </div>
            <Link href="/prevencionista/dashboard">
              <Button variant="outline" className="text-slate-400 border-slate-600">
                Volver al Dashboard
              </Button>
            </Link>
          </div>
        </div>

        {/* Filters */}
        <Card className="bg-slate-900 border-slate-700 mb-6">
          <CardHeader className="pb-4">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Filter className="w-4 h-4" />
              Filtros
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-slate-300 mb-2 block">
                  Buscar por nombre
                </label>
                <Input
                  placeholder="Ej: liquidacion..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="bg-slate-800 border-slate-600 text-slate-100"
                />
              </div>
              <div>
                <label className="text-sm text-slate-300 mb-2 block">
                  Tipo de documento
                </label>
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-md text-slate-100"
                >
                  <option value="">Todos los tipos</option>
                  {documentTypes.map(type => (
                    <option key={type.id} value={type.code}>
                      {type.code}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Documents Table */}
        <Card className="bg-slate-900 border-slate-700">
          <CardHeader>
            <CardTitle>
              {filteredDocuments.length} documentos encontrados
              {totalPages > 1 && ` (Página ${currentPage} de ${totalPages})`}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8 text-slate-400">
                Cargando documentos...
              </div>
            ) : filteredDocuments.length === 0 ? (
              <div className="text-center py-8 text-slate-400">
                No hay documentos que coincidan con los filtros
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-slate-700">
                        <th className="text-left py-3 px-4 text-slate-400 font-medium">
                          Nombre del archivo
                        </th>
                        <th className="text-left py-3 px-4 text-slate-400 font-medium">
                          Tipo
                        </th>
                        <th className="text-left py-3 px-4 text-slate-400 font-medium">
                          Fecha
                        </th>
                        <th className="text-right py-3 px-4 text-slate-400 font-medium">
                          Acción
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {displayedDocuments.map(doc => (
                        <tr
                          key={doc.id}
                          className="border-b border-slate-800 hover:bg-slate-800/50"
                        >
                          <td className="py-3 px-4 text-slate-100 flex items-center gap-2">
                            <FileText className="w-4 h-4 text-slate-500" />
                            <span className="truncate">{doc.file_name}</span>
                          </td>
                          <td className="py-3 px-4 text-slate-300">
                            {doc.type_code}
                          </td>
                          <td className="py-3 px-4 text-slate-400">
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
                              <FileText className="w-4 h-4" />
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

                {/* Pagination Controls */}
                {totalPages > 1 && (
                  <div className="mt-6 flex items-center justify-between">
                    <div className="text-sm text-slate-400">
                      Mostrando {startIndex + 1} a {Math.min(endIndex, filteredDocuments.length)} de {filteredDocuments.length}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                        disabled={currentPage === 1}
                        className="text-slate-400 border-slate-600"
                      >
                        Anterior
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                        disabled={currentPage === totalPages}
                        className="text-slate-400 border-slate-600"
                      >
                        Siguiente
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>

        {/* Info */}
        <Card className="bg-slate-900 border-slate-700 mt-6">
          <CardHeader>
            <CardTitle className="text-sm">Información</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-slate-400 space-y-2">
            <p>
              • Solo puedes ver y descargar documentos con estado "Aprobado"
            </p>
            <p>
              • No tienes permisos para crear, editar o eliminar documentos
            </p>
            <p>
              • Contacta al administrador si necesitas más información
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
