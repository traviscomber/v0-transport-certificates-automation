'use client'

import { useState, useEffect, useMemo } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { CheckCircle2, FileText, Calendar, User, Building2, Eye, Download, ChevronDown } from 'lucide-react'
import { PDFViewer } from '@/components/pdf-viewer'
import { useDocumentSync } from '@/contexts/document-sync-context'
import { getChileDate, getChileTime } from '@/lib/timezone-utils'
import { DocumentsByMonth } from '@/components/documents-by-month'
import { groupDocumentsByMonth } from '@/lib/document-grouping'
import { ApprovedDocumentCard } from '@/components/approved-document-card'

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
  approved_by?: string
  approved_by_email?: string
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
  const [displayCount, setDisplayCount] = useState(350) // Start with 350 documents to avoid overload
  const { onSync } = useDocumentSync()
  
  const LOAD_MORE_INCREMENT = 300 // Load 300 more documents at a time

  useEffect(() => {
    const unsubscribe = onSync((event) => {
      if (event.type === 'document_status_changed') {
        console.log('[v0] ApprovedDocumentsList: Received document_status_changed event, refetching...')
        // Add small delay to ensure database write is committed
        const timer = setTimeout(async () => {
          try {
            const response = await fetch('/api/company/documents/aprobados')
            if (response.ok) {
              const data = await response.json()
              console.log('[v0] ApprovedDocumentsList: Refetch successful, conductorDocs:', data.conductorDocs?.length, 'subDocs:', data.subDocs?.length)
              setConductorDocs(data.conductorDocs || [])
              setSubDocs(data.subDocs || [])
            } else {
              console.error('[v0] ApprovedDocumentsList: Refetch failed with status:', response.status)
            }
          } catch (error) {
            console.error('[v0] ApprovedDocumentsList: Error refetching approved docs:', error)
          }
        }, 500) // 500ms delay to ensure DB write
        return () => clearTimeout(timer)
      }
    })
    return unsubscribe
  }, [onSync])

  const allDocs = [...conductorDocs, ...subDocs].sort((a, b) => {
    try {
      const dateB = new Date(b.updated_at || b.reviewed_at || b.created_at || 0).getTime()
      const dateA = new Date(a.updated_at || a.reviewed_at || a.created_at || 0).getTime()
      return dateB - dateA
    } catch (e) {
      console.error('[v0] Error sorting approved docs:', e)
      return 0
    }
  })

  // Get unique executives for display only (not for filtering)
  const getExecutive = (doc: ApprovedDocument) => {
    return doc.approved_by_email?.split('@')[0] || doc.reviewed_by_ejecutiva || doc.ejecutiva || 'No especificado'
  }

  const getApprovalDate = (doc: ApprovedDocument) => {
    const dateStr = doc.validated_at || doc.approved_at || doc.updated_at || doc.reviewed_at || doc.created_at
    return getChileDate(dateStr)
  }

  const getApprovalTime = (doc: ApprovedDocument) => {
    const dateStr = doc.validated_at || doc.approved_at || doc.updated_at || doc.reviewed_at || doc.created_at
    return getChileTime(dateStr)
  }

  // Simplified: Just show all documents (date filtering is done in parent page component)
  const docsToDisplay = allDocs
  
  // Apply pagination - only show displayCount documents
  const paginatedDocs = docsToDisplay.slice(0, displayCount)
  const hasMore = docsToDisplay.length > displayCount
  const remainingCount = docsToDisplay.length - displayCount

  return (
    <>
      {/* DocumentFilter removed - using date filter in page instead */}
      
      {docsToDisplay.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 px-4">
          <p className="text-slate-400">No hay documentos aprobados</p>
        </div>
      ) : (
        <>
          <DocumentsByMonth
            monthsData={groupDocumentsByMonth(paginatedDocs, 'created_at', 'es')}
            renderDocument={(doc) => (
              <ApprovedDocumentCard
                key={doc.id}
                doc={doc}
                onPreview={setPreviewDoc}
                getExecutive={getExecutive}
              />
            )}
            emptyMessage="No hay documentos aprobados"
          />
          
          {/* Load More Button */}
          {hasMore && (
            <div className="flex flex-col items-center gap-3 py-6 px-4">
              <p className="text-sm text-slate-400">
                Mostrando {paginatedDocs.length} de {docsToDisplay.length} documentos
                {remainingCount > 0 && ` (+${remainingCount} más)`}
              </p>
              <Button
                onClick={() => setDisplayCount(prev => prev + LOAD_MORE_INCREMENT)}
                variant="outline"
                className="gap-2 border-slate-600 text-slate-300 hover:bg-slate-800/50"
              >
                <ChevronDown className="w-4 h-4" />
                Cargar {Math.min(LOAD_MORE_INCREMENT, remainingCount)} más documentos
              </Button>
            </div>
          )}
        </>
      )}

      {/* Preview Modal - No se cierra por click fuera, solo por X o Escape */}
      <Dialog open={!!previewDoc} onOpenChange={(open) => { if (!open) setPreviewDoc(null) }}>
        <DialogContent 
          className="max-w-4xl bg-slate-900 border-slate-700"
          onPointerDownOutside={(e) => e.preventDefault()}
        >
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
