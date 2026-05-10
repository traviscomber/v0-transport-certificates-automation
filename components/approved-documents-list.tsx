'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { CheckCircle, FileText, Calendar, User, Building2 } from 'lucide-react'
import { useDocumentSync } from '@/contexts/document-sync-context'
import { formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'

interface ApprovedDocument {
  id: string
  original_filename?: string
  document_name?: string
  validation_status?: string
  status?: string
  file_url: string
  created_at: string
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

  // Listen for document changes
  useEffect(() => {
    const unsubscribe = onSync((event) => {
      if (event.type === 'document_status_changed') {
        // Refetch approved documents
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
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  )

  if (allDocs.length === 0) {
    return (
      <Card className="bg-slate-900/50 border-slate-700 text-center py-12">
        <div className="flex justify-center mb-4">
          <CheckCircle className="h-12 w-12 text-green-500/50" />
        </div>
        <p className="text-muted-foreground">No hay documentos aprobados aún</p>
      </Card>
    )
  }

  return (
    <>
      <div className="grid gap-4">
        {allDocs.map((doc) => (
          <Card key={doc.id} className="bg-slate-900/50 border-slate-700 hover:border-slate-600 transition-colors">
            <CardContent className="p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-4 flex-1">
                  <div className="bg-green-500/10 rounded-lg p-2">
                    <FileText className="h-6 w-6 text-green-500" />
                  </div>
                  
                  <div className="flex-1">
                    <h3 className="font-semibold text-white">
                      {doc.original_filename || doc.document_name}
                    </h3>
                    
                    <div className="mt-3 space-y-2 text-sm text-muted-foreground">
                      {doc.conductores && (
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4" />
                          <span>
                            {doc.conductores.nombres} {doc.conductores.apellido_paterno}
                          </span>
                          <span className="text-xs">({doc.conductores.rut})</span>
                        </div>
                      )}
                      
                      {doc.transportistas && (
                        <div className="flex items-center gap-2">
                          <Building2 className="h-4 w-4" />
                          <span>{doc.transportistas.razon_social}</span>
                          <span className="text-xs">({doc.transportistas.rut})</span>
                        </div>
                      )}
                      
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        <span>
                          Aprobado hace {formatDistanceToNow(new Date(doc.created_at), { locale: es })}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Badge className="bg-green-500/20 text-green-300 border-green-500/30">
                    ✓ Aprobado
                  </Badge>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPreviewDoc(doc)}
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
        <DialogContent className="max-w-3xl bg-slate-900 border-slate-700">
          <DialogHeader>
            <DialogTitle>{previewDoc?.original_filename || previewDoc?.document_name}</DialogTitle>
          </DialogHeader>
          
          {previewDoc?.file_url && (
            <div className="w-full h-96 bg-black rounded-lg overflow-auto">
              <iframe
                src={previewDoc.file_url}
                className="w-full h-full"
                title="Document preview"
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
