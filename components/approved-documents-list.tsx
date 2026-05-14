'use client'

import { useState, useEffect, useMemo } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { CheckCircle2, FileText, Calendar, User, Building2, Eye, Download } from 'lucide-react'
import { PDFViewer } from '@/components/pdf-viewer'
import { useDocumentSync } from '@/contexts/document-sync-context'
import { getChileDate, getChileTime } from '@/lib/timezone-utils'
import { DocumentFilter, type DocumentFilters } from '@/components/document-filter'

interface ApprovedDocument {
  id: string
  original_filename?: string
  document_name?: string
  validation_status?: string
  status?: string
  file_url?: string
  created_at: string
  updated_at?: string
  reviewed_at?: string
  validated_at?: string
  ejecutiva?: string
  approved_at?: string
  reviewed_by_ejecutiva?: string
  docType?: { code: string; nombre: string }
  conductores?: { id: string; nombres: string; apellido_paterno: string; rut: string }
  transportistas?: { id: string; razon_social: string; rut: string }
}

interface Props {
  conductorDocs: ApprovedDocument[]
  subDocs: ApprovedDocument[]
}

export function ApprovedDocumentsList({ conductorDocs: initialConductorDocs, subDocs: initialSubDocs }: Props) {
  const [conductorDocs, setConductorDocs] = useState(initialConductorDocs)
  const [subDocs, setSubDocs] = useState(initialSubDocs)
  const [previewDoc, setPreviewDoc] = useState<ApprovedDocument | null>(null)
  const [filters, setFilters] = useState<DocumentFilters>({ searchQuery: '' })
  const { onSync } = useDocumentSync()

  useEffect(() => {
    const unsubscribe = onSync((event) => {
      if (event.type === 'document_status_changed') {
        const refetch = async () => {
          try {
            const response = await fetch('/api/company/documents/aprobados')
            if (response.ok) {
              const data = await response.json()
              setConductorDocs(data.conductorDocs || [])
              setSubDocs(data.subDocs || [])
            }
          } catch (error) {
            console.error('[v0] Error refetching approved docs:', error)
          }
        }
        refetch()
      }
    })
    return unsubscribe
  }, [onSync])

  const allDocs = [...conductorDocs, ...subDocs].sort(
    (a, b) => new Date(b.updated_at || b.reviewed_at || b.created_at).getTime() - new Date(a.updated_at || a.reviewed_at || a.created_at).getTime()
  )

  const getExecutive = (doc: ApprovedDocument) => {
    return doc.ejecutiva || doc.reviewed_by_ejecutiva || 'No especificado'
  }

  const getApprovalDate = (doc: ApprovedDocument) => {
    const dateStr = doc.updated_at || doc.reviewed_at || doc.created_at
    return getChileDate(dateStr)
  }

  const getApprovalTime = (doc: ApprovedDocument) => {
    const dateStr = doc.validated_at || doc.approved_at || doc.updated_at || doc.reviewed_at || doc.created_at
    return getChileTime(dateStr)
  }

  // Get unique executives and companies for filter options
  const executives = useMemo(() => {
    const execs = new Map<string, string>()
    allDocs.forEach((doc) => {
      const exec = getExecutive(doc)
      if (exec && exec !== 'No especificado') {
        execs.set(exec, exec)
      }
    })
    return Array.from(execs).map(([id, nombre]) => ({ id, nombre }))
  }, [allDocs])

  const companies = useMemo(() => {
    const comps = new Map<string, { nombre: string; rut: string }>()
    allDocs.forEach((doc) => {
      try {
        if (doc.transportistas) {
          const comp = Array.isArray(doc.transportistas) ? doc.transportistas[0] : doc.transportistas
          if (comp && comp.razon_social) {
            comps.set(comp.id || comp.rut, { nombre: comp.razon_social, rut: comp.rut || '' })
          }
        }
        // For subcontractor docs, try to get company from subcontractor_rut
        if ((doc as any).subcontractor_rut && !doc.transportistas) {
          comps.set((doc as any).subcontractor_rut, { nombre: 'Empresa', rut: (doc as any).subcontractor_rut })
        }
      } catch (e) {
        console.log('[v0] Error extracting company:', e)
      }
    })
    return Array.from(comps).map(([id, data]) => ({ id, ...data }))
  }, [allDocs])

  // Filter documents based on filter criteria
  const filteredDocs = useMemo(() => {
    return allDocs.filter((doc) => {
      // Search query
      if (filters.searchQuery) {
        const query = filters.searchQuery.toLowerCase()
        const filename = (doc.original_filename || doc.document_name || '').toLowerCase()
        const company = doc.transportistas ? ((Array.isArray(doc.transportistas) ? doc.transportistas[0]?.razon_social : doc.transportistas?.razon_social) || '') : ''
        const conductor = doc.conductores ? ((Array.isArray(doc.conductores) ? doc.conductores[0]?.nombres : doc.conductores?.nombres) || '') : ''
        
        if (!filename.includes(query) && !company.toLowerCase().includes(query) && !conductor.toLowerCase().includes(query)) {
          return false
        }
      }

      // Executive filter
      if (filters.executiveId) {
        if (getExecutive(doc) !== filters.executiveId) {
          return false
        }
      }

      // Company filter
      if (filters.companyId) {
        try {
          const docCompany = doc.transportistas ? (Array.isArray(doc.transportistas) ? doc.transportistas[0]?.id : doc.transportistas?.id) : (doc as any).subcontractor_rut
          if (docCompany !== filters.companyId) {
            return false
          }
        } catch (e) {
          return false
        }
      }

      return true
    })
  }, [allDocs, filters])

  if (allDocs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4">
        <div className="rounded-full bg-green-500/10 p-3 mb-4">
          <CheckCircle2 className="h-12 w-12 text-green-500" />
        </div>
        <p className="text-lg font-medium text-slate-300">No hay documentos aprobados aún</p>
        <p className="text-sm text-slate-500 mt-2">Los documentos aprobados aparecerán aquí</p>
      </div>
    )
  }

  return (
    <>
      <DocumentFilter 
        onFilterChange={setFilters}
        executives={executives}
        companies={companies}
      />
      
      {filteredDocs.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 px-4">
          <p className="text-slate-400">No hay documentos que coincidan con los filtros seleccionados</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredDocs.map((doc) => (
          <Card key={doc.id} className="bg-gradient-to-r from-slate-900/80 to-slate-800/80 border-slate-700/50 hover:border-green-500/30 transition-all hover:shadow-lg hover:shadow-green-500/10">
            <CardContent className="p-6">
              <div className="flex items-start justify-between gap-6">
                {/* Left section with icon and details */}
                <div className="flex items-start gap-4 flex-1 min-w-0">
                  <div className="flex-shrink-0">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-500/10 border border-green-500/20">
                      <FileText className="h-6 w-6 text-green-500" />
                    </div>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-white truncate text-lg">
                      {doc.original_filename || doc.document_name}
                    </h3>
                    
                    <div className="mt-3 space-y-2">
                      {doc.conductores && (
                        <div className="flex items-center gap-2 text-sm text-slate-200">
                          <User className="h-4 w-4 flex-shrink-0 text-slate-300" />
                          <span className="truncate">
                            {doc.conductores.nombres} {doc.conductores.apellido_paterno}
                          </span>
                          <span className="text-xs text-slate-300 flex-shrink-0">
                            ({doc.conductores.rut})
                          </span>
                        </div>
                      )}
                      
                      {doc.transportistas && (
                        <div className="flex items-center gap-2 text-sm text-slate-200">
                          <Building2 className="h-4 w-4 flex-shrink-0 text-slate-300" />
                          <span className="truncate">{(Array.isArray(doc.transportistas) ? doc.transportistas[0]?.razon_social : doc.transportistas?.razon_social) || 'N/A'}</span>
                          <span className="text-xs text-slate-300 flex-shrink-0">
                            ({(Array.isArray(doc.transportistas) ? doc.transportistas[0]?.rut : doc.transportistas?.rut) || 'N/A'})
                          </span>
                        </div>
                      )}
                      
                      <div className="flex items-center gap-2 text-sm text-slate-200">
                        <Calendar className="h-4 w-4 flex-shrink-0 text-slate-300" />
                        <span>{getApprovalDate(doc)}</span>
                        <span className="text-xs text-slate-300 flex-shrink-0 ml-2">
                          {getApprovalTime(doc)}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-2 text-sm text-slate-200">
                        <User className="h-4 w-4 flex-shrink-0 text-slate-300" />
                        <span className="truncate text-xs">Aprobado por: {getExecutive(doc)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right section with status and buttons */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  <Badge className="bg-green-500/20 text-green-300 border-green-500/30 whitespace-nowrap">
                    ✓ Aprobado
                  </Badge>
                  {doc.docType && (
                    <Badge variant="outline" className="text-xs bg-blue-500/10 border-blue-500/30 text-blue-300 whitespace-nowrap">
                      {doc.docType.nombre}
                    </Badge>
                  )}
                  {doc.file_url && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPreviewDoc(doc)}
                      className="text-xs gap-1 border-blue-400/50 text-blue-300 hover:bg-blue-500/20"
                      title="Ver documento"
                    >
                      <Eye className="h-4 w-4" />
                      Ver
                    </Button>
                  )}
                  {doc.file_url && (
                    <a href={doc.file_url} download target="_blank" rel="noopener noreferrer">
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-xs gap-1 border-slate-400/50 text-slate-300 hover:bg-slate-500/20"
                        title="Descargar documento"
                      >
                        <Download className="h-4 w-4" />
                        Descar
                      </Button>
                    </a>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
          ))}
        </div>
      )}

      {/* Preview Modal */}
      <Dialog open={!!previewDoc} onOpenChange={(open) => !open && setPreviewDoc(null)}>
        <DialogContent className="max-w-4xl bg-slate-900 border-slate-700">
          <DialogHeader>
            <DialogTitle>{previewDoc?.original_filename || previewDoc?.document_name}</DialogTitle>
          </DialogHeader>
          
          {previewDoc?.file_url && (
            <div className="w-full">
              {previewDoc.file_url.toLowerCase().endsWith('.pdf') ? (
                <PDFViewer
                  url={previewDoc.file_url}
                  filename={previewDoc.original_filename || previewDoc?.document_name || 'document.pdf'}
                />
              ) : (
                // Fallback for non-PDF files (images, etc)
                <div className="flex justify-center items-center bg-slate-900 rounded-lg p-4 max-h-[60vh] overflow-auto">
                  <img
                    src={previewDoc.file_url}
                    alt="Preview"
                    className="max-w-full max-h-[50vh] object-contain"
                  />
                </div>
              )}
            </div>
          )}

          {!previewDoc?.file_url && (
            <div className="w-full h-96 bg-slate-800 rounded-lg flex items-center justify-center">
              <p className="text-muted-foreground">No hay documento disponible para previsualizar</p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
