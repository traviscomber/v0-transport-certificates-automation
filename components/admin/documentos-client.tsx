'use client'

import { useState, useMemo, useCallback, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { FileText, ExternalLink, CheckCircle, XCircle, Clock, Search, Filter, Eye } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { DocumentStatusUpdater } from './document-status-updater'
import { VisionResultsDialog } from './vision-results-dialog'

interface Document {
  id: string
  original_filename: string | null
  conductor_id: string
  validation_status: 'approved' | 'rejected' | 'pending'
  file_url?: string
  created_at: string
  ejecutiva?: string
  vision_status?: 'pending' | 'processing' | 'completed' | 'error'
  document_type?: string
  extracted_data?: any
  validation_result?: any
  anomalies_detected?: string[]
  ocr_text?: string
  vision_error?: string
  conductores: {
    id: string
    nombres: string
    apellido_paterno: string
    rut: string
  } | {
    id: string
    nombres: string
    apellido_paterno: string
    rut: string
  }[] | null
}

interface DocumentosClientProps {
  documents: Document[]
}

export function DocumentosClient({ documents: initialDocuments }: DocumentosClientProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'approved' | 'rejected' | 'pending'>('all')
  const [documents, setDocuments] = useState(initialDocuments)

  // Update documents when initialDocuments changes (e.g., after page refresh from upload)
  useEffect(() => {
    setDocuments(initialDocuments)
  }, [initialDocuments])

  // Helper to get conductor data from either object or array
  const getConductor = (conductores: any) => {
    if (Array.isArray(conductores) && conductores.length > 0) {
      return conductores[0]
    }
    return conductores || {}
  }

  // Handle status change for a document - update local state immediately, API will persist
  const handleStatusChange = useCallback((docId: string, newStatus: 'approved' | 'rejected' | 'pending') => {
    // Update locally for immediate UI feedback
    setDocuments(docs =>
      docs.map(doc =>
        doc.id === docId ? { ...doc, validation_status: newStatus } : doc
      )
    )
  }, [])

  // Handle vision scan for a document
  const handleScanVision = useCallback(async (docId: string) => {
    // Update local state to show processing
    setDocuments(docs =>
      docs.map(doc =>
        doc.id === docId ? { ...doc, vision_status: 'processing' } : doc
      )
    )

    try {
      const response = await fetch('/api/vision', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ documentId: docId })
      })

      const result = await response.json()

      if (response.ok && result.success) {
        // Update local state with vision results
        setDocuments(docs =>
          docs.map(doc =>
            doc.id === docId ? {
              ...doc,
              vision_status: 'completed',
              document_type: result.result.document_type,
              extracted_data: result.result,
              anomalies_detected: result.result.anomalies || []
            } : doc
          )
        )
      } else {
        setDocuments(docs =>
          docs.map(doc =>
            doc.id === docId ? { ...doc, vision_status: 'error', vision_error: result.error } : doc
          )
        )
      }
    } catch (error: any) {
      setDocuments(docs =>
        docs.map(doc =>
          doc.id === docId ? { ...doc, vision_status: 'error', vision_error: error.message } : doc
        )
      )
    }
  }, [])

  // Filter documents based on search and status
  const filteredDocuments = useMemo(() => {
    return documents.filter(doc => {
      const conductor = getConductor(doc.conductores)
      const filename = doc.original_filename || ''
      const conductorName = `${conductor.nombres || ''} ${conductor.apellido_paterno || ''}`
      
      const matchesSearch = 
        filename.toLowerCase().includes(searchQuery.toLowerCase()) ||
        conductorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (conductor.rut || '').includes(searchQuery)

      const matchesStatus = statusFilter === 'all' || doc.validation_status === statusFilter

      return matchesSearch && matchesStatus
    })
  }, [documents, searchQuery, statusFilter])

  // Calculate stats
  const stats = useMemo(() => ({
    total: documents.length,
    pending: documents.filter(d => d.validation_status === 'pending').length,
    approved: documents.filter(d => d.validation_status === 'approved').length,
    rejected: documents.filter(d => d.validation_status === 'rejected').length,
  }), [documents])

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      approved: 'Aprobado',
      rejected: 'Rechazado',
      pending: 'Pendiente',
    }
    return labels[status] || status
  }

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      approved: 'bg-green-100 text-green-700',
      rejected: 'bg-red-100 text-red-700',
      pending: 'bg-yellow-100 text-yellow-700',
    }
    return colors[status] || 'bg-gray-100 text-gray-700'
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="h-3 w-3" />
      case 'rejected':
        return <XCircle className="h-3 w-3" />
      case 'pending':
        return <Clock className="h-3 w-3" />
      default:
        return null
    }
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-sm text-muted-foreground">Total documentos</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
            <p className="text-sm text-muted-foreground">Pendientes</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-green-600">{stats.approved}</div>
            <p className="text-sm text-muted-foreground">Aprobados</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-red-600">{stats.rejected}</div>
            <p className="text-sm text-muted-foreground">Rechazados</p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4 flex-col sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Buscar por nombre, RUT o documento..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="rounded-md border bg-background px-3 py-2 text-sm"
            >
              <option value="all">Todos los estados</option>
              <option value="pending">Pendientes</option>
              <option value="approved">Aprobados</option>
              <option value="rejected">Rechazados</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Documents Table */}
      {filteredDocuments.length === 0 ? (
        <Card suppressHydrationWarning>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <FileText className="h-16 w-16 text-muted-foreground/50 mb-4" />
            <h3 className="text-lg font-semibold mb-2">No hay documentos</h3>
            <p className="text-muted-foreground text-center">
              {searchQuery || statusFilter !== 'all' 
                ? 'No se encontraron documentos que coincidan con tu búsqueda'
                : 'No hay documentos cargados'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card suppressHydrationWarning>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b bg-muted/50">
                  <tr>
                    <th className="text-left p-4 font-medium">Documento</th>
                    <th className="text-left p-4 font-medium">Conductor</th>
                    <th className="text-left p-4 font-medium">RUT</th>
                    <th className="text-left p-4 font-medium">Ejecutiva</th>
                    <th className="text-left p-4 font-medium">Tipo</th>
                    <th className="text-left p-4 font-medium">Visión</th>
                    <th className="text-left p-4 font-medium">Estado</th>
                    <th className="text-left p-4 font-medium">Fecha</th>
                    <th className="text-right p-4 font-medium">Acción</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredDocuments.map((doc) => (
                    <tr key={doc.id} className="border-b hover:bg-muted/50 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <FileText className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                          <span className="font-medium truncate max-w-[250px]">
                            {doc.original_filename || 'Sin nombre'}
                          </span>
                        </div>
                      </td>
                      <td className="p-4 text-sm">
                        {doc.conductores 
                          ? (() => {
                              const conductor = getConductor(doc.conductores)
                              return `${conductor.nombres || '-'} ${conductor.apellido_paterno || '-'}`
                            })()
                          : '-'}
                      </td>
                      <td className="p-4 text-sm text-muted-foreground">
                        {(() => {
                          const conductor = getConductor(doc.conductores)
                          return conductor.rut || '-'
                        })()}
                      </td>
                      <td className="p-4 text-sm font-medium">
                        {doc.ejecutiva || '-'}
                      </td>
                      <td className="p-4 text-sm">
                        <span className="inline-block px-2 py-1 rounded bg-blue-100 text-blue-800 text-xs font-medium">
                          {doc.document_type || 'Desconocido'}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          {doc.vision_status === 'completed' && (
                            <>
                              <span className="inline-flex items-center gap-1 text-xs text-green-600 bg-green-100 px-2 py-1 rounded">
                                <CheckCircle className="h-3 w-3" />
                                Listo
                              </span>
                              <VisionResultsDialog
                                documentType={doc.document_type}
                                extractedData={doc.extracted_data}
                                anomaliesDetected={doc.anomalies_detected}
                                ocrText={doc.ocr_text}
                              />
                            </>
                          )}
                          {doc.vision_status === 'pending' && (
                            <span className="inline-flex items-center gap-1 text-xs text-yellow-600 bg-yellow-100 px-2 py-1 rounded">
                              <Clock className="h-3 w-3" />
                              Pendiente
                            </span>
                          )}
                          {doc.vision_status === 'processing' && (
                            <span className="inline-flex items-center gap-1 text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded">
                              <Clock className="h-3 w-3" />
                              Procesando
                            </span>
                          )}
                          {doc.vision_status === 'error' && (
                            <>
                              <span 
                                className="inline-flex items-center gap-1 text-xs text-red-600 bg-red-100 px-2 py-1 rounded cursor-help"
                                title={doc.vision_error || 'Error desconocido'}
                              >
                                <XCircle className="h-3 w-3" />
                                Error
                              </span>
                              <VisionResultsDialog visionError={doc.vision_error} />
                            </>
                          )}
                          {!doc.vision_status && (
                            <span className="text-xs text-muted-foreground">-</span>
                          )}
                        </div>
                      </td>
                      <td className="p-4">
                        <DocumentStatusUpdater
                          documentId={doc.id}
                          currentStatus={doc.validation_status}
                          documentType="conductor"
                          onStatusChange={(newStatus) => handleStatusChange(doc.id, newStatus)}
                        />
                      </td>
                      <td className="p-4 text-sm text-muted-foreground">
                        {new Date(doc.created_at).toLocaleDateString('es-CL')}
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {doc.vision_status !== 'completed' && doc.vision_status !== 'processing' && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleScanVision(doc.id)}
                              className="text-xs"
                              title={doc.vision_status === 'error' ? 'Reintentar escaneo' : 'Escanear documento'}
                            >
                              <Eye className="h-3 w-3 mr-1" />
                              {doc.vision_status === 'error' ? 'Reintentar' : 'Escanear'}
                            </Button>
                          )}
                          {doc.vision_status === 'completed' && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleScanVision(doc.id)}
                              className="text-xs"
                              title="Re-escanear documento"
                            >
                              <Eye className="h-3 w-3 mr-1" />
                              Re-escanear
                            </Button>
                          )}
                          {doc.vision_status === 'processing' && (
                            <span className="text-xs text-blue-600">Escaneando...</span>
                          )}
                          {doc.vision_status === 'error' && doc.vision_error && (
                            <span 
                              className="text-xs text-red-600 max-w-[200px] truncate"
                              title={doc.vision_error}
                            >
                              Error: {doc.vision_error}
                            </span>
                          )}
                          {doc.file_url && (
                            <a 
                              href={doc.file_url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
                            >
                              Ver <ExternalLink className="h-3 w-3" />
                            </a>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="border-t p-4 text-sm text-muted-foreground text-center">
              Mostrando {filteredDocuments.length} de {documents.length} documentos
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
