'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { CheckCircle2, FileText, Calendar, User, Building2 } from 'lucide-react'
import { useDocumentSync } from '@/contexts/document-sync-context'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

interface ApprovedDocument {
  id: string
  original_filename?: string
  document_name?: string
  validation_status?: string
  status?: string
  file_url: string
  created_at: string
  updated_at?: string
  reviewed_at?: string
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

  const getApprovalDate = (doc: ApprovedDocument) => {
    const dateStr = doc.updated_at || doc.reviewed_at || doc.created_at
    return format(new Date(dateStr), "d 'de' MMMM 'de' yyyy", { locale: es })
  }

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
      <div className="space-y-4">
        {allDocs.map((doc) => (
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
                        <div className="flex items-center gap-2 text-sm text-slate-400">
                          <User className="h-4 w-4 flex-shrink-0 text-slate-500" />
                          <span className="truncate">
                            {doc.conductores.nombres} {doc.conductores.apellido_paterno}
                          </span>
                          <span className="text-xs text-slate-600 flex-shrink-0">
                            ({doc.conductores.rut})
                          </span>
                        </div>
                      )}
                      
                      {doc.transportistas && (
                        <div className="flex items-center gap-2 text-sm text-slate-400">
                          <Building2 className="h-4 w-4 flex-shrink-0 text-slate-500" />
                          <span className="truncate">{doc.transportistas.razon_social}</span>
                          <span className="text-xs text-slate-600 flex-shrink-0">
                            ({doc.transportistas.rut})
                          </span>
                        </div>
                      )}
                      
                      <div className="flex items-center gap-2 text-sm text-slate-400">
                        <Calendar className="h-4 w-4 flex-shrink-0 text-slate-500" />
                        <span>{getApprovalDate(doc)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right section with status and button */}
                <div className="flex items-center gap-3 flex-shrink-0">
                  <Badge className="bg-green-500/20 text-green-300 border-green-500/30 whitespace-nowrap">
                    ✓ Aprobado
                  </Badge>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPreviewDoc(doc)}
                    className="border-slate-600 hover:bg-slate-800/50 whitespace-nowrap"
                  >
                    Ver
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Preview Modal */}
      <Dialog open={!!previewDoc} onOpenChange={(open) => !open && setPreviewDoc(null)}>
        <DialogContent className="max-w-4xl bg-slate-900 border-slate-700">
          <DialogHeader>
            <DialogTitle>{previewDoc?.original_filename || previewDoc?.document_name}</DialogTitle>
          </DialogHeader>
          
          {previewDoc?.file_url && (
            <div className="w-full bg-black rounded-lg overflow-hidden">
              {previewDoc.file_url.toLowerCase().includes('.pdf') ? (
                <iframe
                  src={`${previewDoc.file_url}#view=FitH`}
                  className="w-full h-96 border-0"
                  title="Document preview"
                  allow="fullscreen"
                />
              ) : (
                <img
                  src={previewDoc.file_url}
                  alt="Document preview"
                  className="w-full h-auto max-h-96 object-contain"
                />
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
