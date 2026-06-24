'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { AlertTriangle, Mail, FileText, Eye, Flame } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useDocumentSync } from '@/contexts/document-sync-context'
import { buildDocumentAccessUrl } from '@/lib/document-file-access'

interface ExpiredDocument {
  id: string
  original_filename?: string
  document_type?: string
  file_url?: string
  expiration_date: string
  days_overdue: number
  conductores?: {
    id: string
    nombres: string
    apellido_paterno: string
    rut: string
  }
  created_at: string
}

interface Props {
  initialDocuments: ExpiredDocument[]
}

export function ExpiredDocumentsList({ initialDocuments }: Props) {
  const [documents, setDocuments] = useState(initialDocuments)
  const [previewDoc, setPreviewDoc] = useState<ExpiredDocument | null>(null)
  const [loading, setLoading] = useState<string | null>(null)
  const { onSync } = useDocumentSync()

  // Listen for document sync events
  useEffect(() => {
    const unsubscribe = onSync((event) => {
      console.log('[v0] ExpiredDocumentsList: Received sync event', event.type)
      
      // When status changes, remove from expired list
      if (event.type === 'document_status_changed' && event.documentId) {
        setDocuments(prev => prev.filter(d => d.id !== event.documentId))
      }
    })

    return unsubscribe
  }, [onSync])

  const handleForceRenewalRequest = async (conductorId: string, conductorEmail: string) => {
    setLoading(conductorId)
    try {
      console.log('[v0] Forcing renewal request to conductor:', conductorEmail)
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Show success message
      const msg = document.createElement('div')
      msg.className = 'fixed bottom-4 right-4 bg-red-600 text-white px-6 py-3 rounded-lg shadow-lg z-[100] flex items-center gap-2'
      msg.innerHTML = `<svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg> Notificación urgente enviada a ${conductorEmail}`
      document.body.appendChild(msg)
      setTimeout(() => msg.remove(), 4000)
      
    } catch (error) {
      console.error('[v0] Error sending force renewal:', error)
      alert('Error al enviar la notificación')
    } finally {
      setLoading(null)
    }
  }

  // Sort by days overdue (most overdue first)
  const sortedDocs = [...documents].sort((a, b) => b.days_overdue - a.days_overdue)

  return (
    <div className="space-y-4">
      {sortedDocs.length === 0 ? (
        <Card className="bg-slate-800/50 border-slate-700 text-center py-12">
          <CardContent>
            <p className="text-slate-400">No hay documentos vencidos</p>
          </CardContent>
        </Card>
      ) : (
        sortedDocs.map((doc) => {
          const conductor = Array.isArray(doc.conductores) ? doc.conductores[0] : doc.conductores
          const expirationDate = new Date(doc.expiration_date)
          const formattedDate = expirationDate.toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })

          // Color intensity based on how overdue
          const isVeryCritical = doc.days_overdue > 90
          const isCritical = doc.days_overdue > 30
          const borderColor = isVeryCritical ? 'border-red-600' : isCritical ? 'border-orange-600' : 'border-red-600/50'
          const bgColor = isVeryCritical ? 'bg-red-900/20' : isCritical ? 'bg-orange-900/20' : 'bg-red-900/10'

          return (
            <Card key={doc.id} className={`${bgColor} border-l-4 ${borderColor} hover:border-red-500 transition-colors`}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 space-y-3">
                    {/* Document info */}
                    <div>
                      <p className="font-medium text-white flex items-center gap-2">
                        <FileText className="h-4 w-4 text-slate-400" />
                        {doc.original_filename || doc.document_type || 'Sin nombre'}
                      </p>
                      <p className="text-sm text-slate-400 mt-1">
                        Tipo: {doc.document_type || 'Desconocido'}
                      </p>
                    </div>

                    {/* Conductor info */}
                    {conductor && (
                      <div className="text-sm">
                        <p className="text-slate-400">
                          Conductor: <span className="text-slate-200 font-medium">
                            {conductor.nombres} {conductor.apellido_paterno}
                          </span>
                        </p>
                        <p className="text-slate-400">
                          RUT: <span className="text-slate-200 font-medium">{conductor.rut}</span>
                        </p>
                      </div>
                    )}

                    {/* Expiration info with overdue status */}
                    <div className="flex items-center gap-4 pt-2 flex-wrap">
                      <div className={`flex items-center gap-2 px-3 py-1 rounded-md ${
                        isVeryCritical 
                          ? 'bg-red-600 text-white' 
                          : isCritical 
                            ? 'bg-orange-600 text-white' 
                            : 'bg-red-900/50 text-red-200'
                      }`}>
                        <Flame className="h-4 w-4" />
                        <span className="text-sm font-bold">
                          {doc.days_overdue} días atrasado
                        </span>
                      </div>
                      <p className="text-sm text-red-300">
                        Vencido desde: <span className="font-medium">{formattedDate}</span>
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-2 justify-start">
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-1"
                      onClick={() => setPreviewDoc(doc)}
                    >
                      <Eye className="h-4 w-4" />
                      Ver
                    </Button>
                    <Button
                      size="sm"
                      className="gap-1 bg-red-600 hover:bg-red-700 text-white"
                      onClick={() => handleForceRenewalRequest(conductor?.id || '', conductor?.rut || '')}
                      disabled={loading === conductor?.id}
                    >
                      <Flame className="h-4 w-4" />
                      {loading === conductor?.id ? 'Enviando...' : 'Urgente'}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })
      )}

      {/* Preview Modal - No se cierra por click fuera, solo por X o Escape */}
      {previewDoc && (
        <Dialog open={!!previewDoc} onOpenChange={(open) => { if (!open) setPreviewDoc(null) }}>
          <DialogContent 
            className="bg-slate-900 border-slate-700 max-w-2xl"
            onPointerDownOutside={(e) => e.preventDefault()}
          >
            <DialogHeader>
              <DialogTitle className="text-white flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-red-500" />
                Vista previa: {previewDoc.original_filename || previewDoc.document_type}
              </DialogTitle>
            </DialogHeader>
            
            {previewDoc.file_url ? (
              <div className="space-y-4">
                {previewDoc.file_url.toLowerCase().endsWith('.pdf') ? (
                  <iframe
                    src={previewDoc.file_url}
                    className="w-full h-96 border border-slate-700 rounded"
                    title="Preview"
                  />
                ) : previewDoc.file_url.toLowerCase().match(/\.(jpg|jpeg|png|gif)$/i) ? (
                  <img
                    src={previewDoc.file_url}
                    alt="Preview"
                    className="w-full rounded border border-slate-700"
                  />
                ) : (
                  <div className="bg-slate-800 p-6 rounded border border-slate-700 text-center">
                    <p className="text-slate-400">
                      Tipo de archivo no soportado para vista previa
                    </p>
                      <a
                        href={buildDocumentAccessUrl(previewDoc.file_url, 'preview')}
                        target="_blank"
                        rel="noopener noreferrer"
                      className="text-blue-400 hover:underline mt-2 block"
                    >
                      Descargar archivo
                    </a>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-slate-800 p-6 rounded border border-slate-700 text-center">
                <p className="text-slate-400">No hay archivo disponible</p>
              </div>
            )}
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
