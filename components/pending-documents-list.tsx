'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Clock, Users, Truck, ArrowLeft, FileText, Check, X, Loader2, Eye } from "lucide-react"
import Link from "next/link"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { useDocumentSync } from '@/contexts/document-sync-context'

interface PendingDocument {
  id: string
  original_filename?: string
  file_name?: string
  document_type_id?: string
  file_url?: string
  conductores?: {
    id: string
    nombres: string
    apellido_paterno: string
    rut: string
  } | {
    id: string
    nombres: string
    apellido_paterno: string
    rut: string
  }[]
  transportistas?: {
    id: string
    razon_social: string
    rut: string
  } | {
    id: string
    razon_social: string
    rut: string
  }[]
}

interface Props {
  conductorDocs: PendingDocument[]
  subDocs: PendingDocument[]
}

export function PendingDocumentsList({ conductorDocs: initialConductorDocs, subDocs: initialSubDocs }: Props) {
  const [conductorDocs, setConductorDocs] = useState(initialConductorDocs)
  const [subDocs, setSubDocs] = useState(initialSubDocs)
  const [loading, setLoading] = useState<string | null>(null)
  const [previewDoc, setPreviewDoc] = useState<PendingDocument | null>(null)
  const [showRejectModal, setShowRejectModal] = useState(false)
  const { onSync, broadcastSync } = useDocumentSync()
  const [rejectDocId, setRejectDocId] = useState<string | null>(null)
  const [rejectReason, setRejectReason] = useState('')
  const [docType, setDocType] = useState<'conductor' | 'subcontractor'>('conductor')

  const totalPendientes = conductorDocs.length + subDocs.length

  const handleStatusChange = async (docId: string, newStatus: 'aprobado' | 'rechazado', type: 'conductor' | 'subcontractor', reason?: string) => {
    setLoading(docId)
    try {
      console.log('[v0] Pending docs: Changing status', { docId, status: newStatus, reason, type })
      
      const response = await fetch(`/api/company/documents/${docId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          status: newStatus,  // Send Spanish - API will normalize to English
          reason: reason      // Use 'reason', not 'rejection_reason'
        })
      })

      console.log('[v0] Pending docs: Response status:', response.status)

      if (!response.ok) {
        const error = await response.json()
        console.error('[v0] Pending docs: Server error:', error)
        throw new Error(error.error || error.details?.[0]?.message || 'Error al cambiar estado')
      }

      const result = await response.json()
      console.log('[v0] Pending docs: Status change successful', result)

      // Remove from local list immediately (UI feedback)
      if (type === 'conductor') {
        setConductorDocs(prev => prev.filter(d => d.id !== docId))
      } else {
        setSubDocs(prev => prev.filter(d => d.id !== docId))
      }

      // BROADCAST SYNC EVENT - Update all views in real-time
      console.log('[v0] Pending docs: Broadcasting status change event')
      broadcastSync({
        type: 'document_status_changed',
        documentId: docId,
        timestamp: Date.now(),
        data: { 
          oldStatus: 'pending',
          newStatus: newStatus === 'aprobado' ? 'approved' : 'rejected'
        }
      })

      // Show success toast
      const msg = document.createElement('div')
      msg.className = 'fixed bottom-4 right-4 bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg z-[100]'
      msg.textContent = `Documento ${newStatus === 'aprobado' ? 'aprobado' : 'rechazado'}`
      document.body.appendChild(msg)
      setTimeout(() => msg.remove(), 3000)

    } catch (error) {
      console.error('[v0] Pending docs: Error:', error)
      alert(`Error: ${error instanceof Error ? error.message : 'Desconocido'}`)
    } finally {
      setLoading(null)
      setShowRejectModal(false)
      setRejectDocId(null)
      setRejectReason('')
    }
  }

  const handleApprove = (docId: string, type: 'conductor' | 'subcontractor') => {
    handleStatusChange(docId, 'aprobado', type)
  }

  const handleRejectClick = (docId: string, type: 'conductor' | 'subcontractor') => {
    setRejectDocId(docId)
    setDocType(type)
    setShowRejectModal(true)
  }

  const confirmReject = () => {
    if (rejectDocId) {
      handleStatusChange(rejectDocId, 'rechazado', docType, rejectReason)
    }
  }

  // Listen for document sync events and refetch pending documents if needed
  useEffect(() => {
    const unsubscribe = onSync((event) => {
      console.log('[v0] PendingDocumentsList: Received sync event', event.type)
      
      // When status changes elsewhere, remove from pending list
      if (event.type === 'document_status_changed' && event.documentId) {
        console.log('[v0] PendingDocumentsList: Removing document from pending list:', event.documentId)
        setConductorDocs(prev => prev.filter(d => d.id !== event.documentId))
        setSubDocs(prev => prev.filter(d => d.id !== event.documentId))
      }
    })

    return unsubscribe
  }, [onSync])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/company/documentos">
            <Button variant="ghost" size="sm" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Volver
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
              <Clock className="h-6 w-6 text-amber-500" />
              Documentos Pendientes
            </h1>
            <p className="text-muted-foreground">
              {totalPendientes} documentos esperando revision
            </p>
          </div>
        </div>
      </div>

      {/* Conductor Documents Section */}
      <Card className="border-blue-500/30 bg-blue-500/5">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-500" />
              <CardTitle>Documentos de Conductores</CardTitle>
            </div>
            <Badge variant="secondary">{conductorDocs.length} pendientes</Badge>
          </div>
          <CardDescription>Licencias, antecedentes y documentos personales</CardDescription>
        </CardHeader>
        <CardContent>
          {conductorDocs.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              No hay documentos de conductores pendientes
            </p>
          ) : (
            <div className="space-y-2">
              {conductorDocs.map((doc) => (
                <div 
                  key={doc.id} 
                  className="flex items-center justify-between p-3 rounded-lg bg-slate-800/50 border border-slate-700"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <FileText className="h-4 w-4 text-blue-400 flex-shrink-0" />
                    <div className="min-w-0">
                      <p className="font-medium text-sm truncate">{doc.original_filename}</p>
                      <p className="text-xs text-muted-foreground truncate">
                        {(() => {
                          const c = Array.isArray(doc.conductores) ? doc.conductores[0] : doc.conductores
                          return c ? `${c.nombres} ${c.apellido_paterno} - ${c.rut}` : ''
                        })()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                    {doc.file_url && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setPreviewDoc(doc)}
                        className="text-slate-400 hover:text-white"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleApprove(doc.id, 'conductor')}
                      disabled={loading === doc.id}
                      className="text-xs gap-1 border-green-500/50 text-green-400 hover:bg-green-500/20"
                    >
                      {loading === doc.id ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : (
                        <Check className="h-3 w-3" />
                      )}
                      Aprobar
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleRejectClick(doc.id, 'conductor')}
                      disabled={loading === doc.id}
                      className="text-xs gap-1 border-red-500/50 text-red-400 hover:bg-red-500/20"
                    >
                      <X className="h-3 w-3" />
                      Rechazar
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Subcontractor Documents Section */}
      <Card className="border-orange-500/30 bg-orange-500/5">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Truck className="h-5 w-5 text-orange-500" />
              <CardTitle>Documentos de Subcontratistas</CardTitle>
            </div>
            <Badge variant="secondary">{subDocs.length} pendientes</Badge>
          </div>
          <CardDescription>F30, F30-1, contratos y documentos legales</CardDescription>
        </CardHeader>
        <CardContent>
          {subDocs.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              No hay documentos de subcontratistas pendientes
            </p>
          ) : (
            <div className="space-y-2">
              {subDocs.map((doc) => (
                <div 
                  key={doc.id} 
                  className="flex items-center justify-between p-3 rounded-lg bg-slate-800/50 border border-slate-700"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <FileText className="h-4 w-4 text-orange-400 flex-shrink-0" />
                    <div className="min-w-0">
                      <p className="font-medium text-sm truncate">{doc.file_name}</p>
                      <p className="text-xs text-muted-foreground truncate">
                        {(() => {
                          const t = Array.isArray(doc.transportistas) ? doc.transportistas[0] : doc.transportistas
                          return t ? `${t.razon_social} - ${t.rut}` : ''
                        })()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                    {doc.file_url && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setPreviewDoc(doc)}
                        className="text-slate-400 hover:text-white"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleApprove(doc.id, 'subcontractor')}
                      disabled={loading === doc.id}
                      className="text-xs gap-1 border-green-500/50 text-green-400 hover:bg-green-500/20"
                    >
                      {loading === doc.id ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : (
                        <Check className="h-3 w-3" />
                      )}
                      Aprobar
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleRejectClick(doc.id, 'subcontractor')}
                      disabled={loading === doc.id}
                      className="text-xs gap-1 border-red-500/50 text-red-400 hover:bg-red-500/20"
                    >
                      <X className="h-3 w-3" />
                      Rechazar
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Preview Modal */}
      <Dialog open={!!previewDoc} onOpenChange={() => setPreviewDoc(null)}>
        <DialogContent className="max-w-3xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>{previewDoc?.original_filename || previewDoc?.file_name}</DialogTitle>
          </DialogHeader>
          {previewDoc?.file_url && (
            <div className="flex justify-center items-center bg-slate-900 rounded-lg p-4 max-h-[60vh] overflow-auto">
              <img 
                src={previewDoc.file_url} 
                alt="Preview" 
                className="max-w-full max-h-[50vh] object-contain"
              />
            </div>
          )}
          <div className="flex justify-end gap-2 mt-4">
            <Button
              variant="outline"
              onClick={() => {
                if (previewDoc) {
                  const hasConductor = previewDoc.conductores && (Array.isArray(previewDoc.conductores) ? previewDoc.conductores.length > 0 : true)
                  handleApprove(previewDoc.id, hasConductor ? 'conductor' : 'subcontractor')
                }
                setPreviewDoc(null)
              }}
              className="gap-1 border-green-500/50 text-green-400 hover:bg-green-500/20"
            >
              <Check className="h-4 w-4" />
              Aprobar
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                if (previewDoc) {
                  const hasConductor = previewDoc.conductores && (Array.isArray(previewDoc.conductores) ? previewDoc.conductores.length > 0 : true)
                  handleRejectClick(previewDoc.id, hasConductor ? 'conductor' : 'subcontractor')
                  setPreviewDoc(null)
                }
              }}
              className="gap-1 border-red-500/50 text-red-400 hover:bg-red-500/20"
            >
              <X className="h-4 w-4" />
              Rechazar
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Reject Reason Modal */}
      <Dialog open={showRejectModal} onOpenChange={setShowRejectModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Motivo del Rechazo</DialogTitle>
          </DialogHeader>
          <Textarea
            placeholder="Ingrese el motivo del rechazo (opcional)"
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            className="min-h-[100px]"
          />
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="ghost" onClick={() => setShowRejectModal(false)}>
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={confirmReject}
              disabled={loading !== null}
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Confirmar Rechazo
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
