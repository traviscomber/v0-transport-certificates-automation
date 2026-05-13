'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Clock, Users, Truck, ArrowLeft, FileText, Check, X, Loader2, Eye, Download, Calendar, Sparkles } from "lucide-react"
import Link from "next/link"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { useDocumentSync } from '@/contexts/document-sync-context'
import { PDFViewer } from '@/components/pdf-viewer'

interface PendingDocument {
  id: string
  original_filename?: string
  file_name?: string
  document_type_id?: string
  file_url?: string
  created_at?: string
  uploaded_at?: string
  ejecutiva?: string
  reviewed_by_ejecutiva?: string
  uploaded_by_ejecutiva?: string
  docType?: { code: string; nombre: string }
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

export function PendingDocumentsList({ conductorDocs: propConductorDocs, subDocs: propSubDocs }: Props) {
  // Use props directly for display, local state only for removal after approve/reject
  const [removedIds, setRemovedIds] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState<string | null>(null)
  const [analyzing, setAnalyzing] = useState<string | null>(null)
  const [previewDoc, setPreviewDoc] = useState<PendingDocument | null>(null)
  const [showRejectModal, setShowRejectModal] = useState(false)
  const [showAnalysisModal, setShowAnalysisModal] = useState(false)
  const [analysisResult, setAnalysisResult] = useState<any>(null)
  const { onSync, broadcastSync } = useDocumentSync()
  const [rejectDocId, setRejectDocId] = useState<string | null>(null)
  const [rejectReason, setRejectReason] = useState('')
  const [docType, setDocType] = useState<'conductor' | 'subcontractor'>('conductor')

  // Reset removed IDs when props change (new filter applied)
  useEffect(() => {
    setRemovedIds(new Set())
  }, [propConductorDocs, propSubDocs])

  // Filter out removed docs from props
  const conductorDocs = propConductorDocs.filter(doc => !removedIds.has(doc.id))
  const subDocs = propSubDocs.filter(doc => !removedIds.has(doc.id))

  const totalPendientes = conductorDocs.length + subDocs.length

  const handleAnalyzeDocument = async (docId: string) => {
    setAnalyzing(docId)
    try {
      console.log('[v0] Analyzing document with OCR/IA:', docId)
      
      const response = await fetch(`/api/company/documents/${docId}/reprocess`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ documentId: docId })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Error al analizar documento')
      }

      const result = await response.json()
      console.log('[v0] Document analysis complete:', result)

      // Show analysis results in modal
      setAnalysisResult(result)
      setShowAnalysisModal(true)
    } catch (error) {
      console.error('[v0] Analysis error:', error)
      const msg = document.createElement('div')
      msg.className = 'fixed bottom-4 right-4 bg-red-600 text-white px-6 py-3 rounded-lg shadow-lg z-[100]'
      msg.textContent = 'Error al analizar: ' + (error as Error).message
      document.body.appendChild(msg)
      setTimeout(() => msg.remove(), 5000)
    } finally {
      setAnalyzing(null)
    }
  }

  const handleProvideFeedback = async (correctedType?: string, correctedDate?: string) => {
    if (!analysisResult) return
    
    try {
      const response = await fetch('/api/company/ai-training/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          documentId: analysisResult.documentId,
          documentTable: analysisResult.documentTable,
          aiDetectedType: analysisResult.analysis.documentType,
          actualDocumentType: correctedType || analysisResult.analysis.documentType,
          aiExpirationDate: analysisResult.analysis.expirationDate,
          actualExpirationDate: correctedDate || analysisResult.analysis.expirationDate,
          isAccurate: !correctedType && !correctedDate,
          confidenceScore: analysisResult.analysis.confidence,
        })
      })

      if (response.ok) {
        const msg = document.createElement('div')
        msg.className = 'fixed bottom-4 right-4 bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg z-[100]'
        msg.textContent = 'Feedback guardado - ayudando a entrenar el modelo'
        document.body.appendChild(msg)
        setTimeout(() => msg.remove(), 3000)
        
        setShowAnalysisModal(false)
      }
    } catch (error) {
      console.error('[v0] Feedback error:', error)
    }
  }

  const handleStatusChange = async (docId: string, newStatus: 'aprobado' | 'rechazado', type: 'conductor' | 'subcontractor', reason?: string) => {
    setLoading(docId)
    try {
      console.log('[v0] Pending docs: Changing status', { docId, status: newStatus, reason, type })
      
      const response = await fetch(`/api/company/documents/${docId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          status: newStatus,  // Send Spanish - API will normalize to English
          reason: reason,     // Use 'reason', not 'rejection_reason'
          documentType: type  // NEW: Send which table to use (conductor or subcontractor)
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
      setRemovedIds(prev => new Set([...prev, docId]))

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
        const docId = event.documentId
        console.log('[v0] PendingDocumentsList: Removing document from pending list:', docId)
        setRemovedIds(prev => new Set([...prev, docId]))
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
                      onClick={() => handleAnalyzeDocument(doc.id)}
                      disabled={analyzing === doc.id}
                      className="text-xs gap-1 border-blue-400/50 text-blue-300 hover:bg-blue-500/20"
                      title="Analizar con IA (OCR)"
                    >
                      {analyzing === doc.id ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : (
                        <Sparkles className="h-3 w-3" />
                      )}
                      Analizar
                    </Button>
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
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-sm truncate">{doc.file_name}</p>
                      <div className="flex gap-3 mt-1 flex-wrap">
                        <p className="text-xs text-muted-foreground">
                          {(() => {
                            const t = Array.isArray(doc.transportistas) ? doc.transportistas[0] : doc.transportistas
                            return t ? `${t.razon_social} - ${t.rut}` : ''
                          })()}
                        </p>
                        {doc.docType && (
                          <Badge variant="outline" className="text-xs bg-blue-500/10 border-blue-500/30 text-blue-300">
                            {doc.docType.nombre}
                          </Badge>
                        )}
                        {doc.ejecutiva && doc.ejecutiva !== 'Sin asignar' && (
                          <Badge variant="outline" className="text-xs bg-purple-500/10 border-purple-500/30 text-purple-300">
                            👤 {doc.ejecutiva}
                          </Badge>
                        )}
                        {doc.uploaded_at && (
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {new Date(doc.uploaded_at).toLocaleDateString('es-CL', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                        )}
                      </div>
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
                      onClick={() => handleAnalyzeDocument(doc.id)}
                      disabled={analyzing === doc.id}
                      className="text-xs gap-1 border-blue-400/50 text-blue-300 hover:bg-blue-500/20"
                      title="Analizar con IA (OCR)"
                    >
                      {analyzing === doc.id ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : (
                        <Sparkles className="h-3 w-3" />
                      )}
                      Analizar
                    </Button>
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
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto" aria-label={`Preview de ${previewDoc?.file_name || 'documento'}`}>
          <DialogHeader className="flex flex-row items-center justify-between">
            <DialogTitle className="flex-1">{previewDoc?.original_filename || previewDoc?.file_name}</DialogTitle>
            {previewDoc?.file_url && (
              <a
                href={previewDoc.file_url}
                download={previewDoc.original_filename || previewDoc?.file_name}
                target="_blank"
                rel="noopener noreferrer"
                className="ml-2"
              >
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1 border-blue-500/50 text-blue-400 hover:bg-blue-500/20"
                >
                  <Download className="h-4 w-4" />
                  Descargar
                </Button>
              </a>
            )}
          </DialogHeader>
          
          {previewDoc?.file_url && (
            <div className="w-full">
              {previewDoc.file_url.toLowerCase().endsWith('.pdf') ? (
                <PDFViewer
                  url={previewDoc.file_url}
                  filename={previewDoc.original_filename || previewDoc?.file_name || 'document.pdf'}
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
          
          <div className="flex justify-end gap-2 mt-4">
            {(!previewDoc?.validation_status || previewDoc?.validation_status === 'pendiente' || previewDoc?.status === 'pendiente') && (
              <>
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
              </>
            )}
            {previewDoc?.validation_status === 'aprobado' && (
              <Badge className="bg-green-500/20 text-green-300 border-green-500/30">
                ✓ Aprobado
              </Badge>
            )}
            {previewDoc?.validation_status === 'rechazado' && (
              <Badge className="bg-red-500/20 text-red-300 border-red-500/30">
                ✗ Rechazado
              </Badge>
            )}
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

      {/* Analysis Results Modal */}
      <Dialog open={showAnalysisModal} onOpenChange={setShowAnalysisModal}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-blue-400" />
              Resultados del Analisis IA
            </DialogTitle>
          </DialogHeader>
          
          {analysisResult && (
            <div className="space-y-4">
              {/* Document Info */}
              <div className="bg-slate-800/50 rounded-lg p-3">
                <p className="text-sm text-slate-400">Archivo</p>
                <p className="text-white font-medium">{analysisResult.originalDocument?.file_name || 'Sin nombre'}</p>
              </div>

              {/* Analysis Results */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-800/50 rounded-lg p-3">
                  <p className="text-sm text-slate-400">Tipo Detectado</p>
                  <p className="text-white font-medium">{analysisResult.analysis?.documentType || 'No detectado'}</p>
                </div>
                
                <div className="bg-slate-800/50 rounded-lg p-3">
                  <p className="text-sm text-slate-400">Confianza</p>
                  <p className="text-white font-medium">
                    {analysisResult.analysis?.confidence 
                      ? `${Math.round(analysisResult.analysis.confidence * 100)}%` 
                      : 'N/A'}
                  </p>
                </div>
                
                {analysisResult.analysis?.expirationDate && (
                  <div className="bg-slate-800/50 rounded-lg p-3">
                    <p className="text-sm text-slate-400">Fecha Vencimiento</p>
                    <p className="text-white font-medium">{analysisResult.analysis.expirationDate}</p>
                  </div>
                )}
                
                {analysisResult.analysis?.documentNumber && (
                  <div className="bg-slate-800/50 rounded-lg p-3">
                    <p className="text-sm text-slate-400">Numero Documento</p>
                    <p className="text-white font-medium">{analysisResult.analysis.documentNumber}</p>
                  </div>
                )}
              </div>

              {/* Extracted Text Summary */}
              {analysisResult.analysis?.extractedText && (
                <div className="bg-slate-800/50 rounded-lg p-3">
                  <p className="text-sm text-slate-400 mb-1">Informacion Extraida</p>
                  <p className="text-white text-sm">{analysisResult.analysis.extractedText}</p>
                </div>
              )}

              {/* Warnings */}
              {analysisResult.analysis?.warnings?.length > 0 && (
                <div className="bg-yellow-900/30 border border-yellow-600/50 rounded-lg p-3">
                  <p className="text-sm text-yellow-400 font-medium mb-1">Advertencias</p>
                  <ul className="text-yellow-200 text-sm list-disc list-inside">
                    {analysisResult.analysis.warnings.map((w: string, i: number) => (
                      <li key={i}>{w}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Feedback Section */}
              <div className="border-t border-slate-700 pt-3">
                <p className="text-xs text-slate-400 mb-2">¿Es correcto el análisis?</p>
                <div className="flex gap-2">
                  <Button 
                    size="sm"
                    variant="outline"
                    className="flex-1 border-green-600/50 text-green-400 hover:bg-green-900/20"
                    onClick={() => handleProvideFeedback()}
                  >
                    ✓ Correcto
                  </Button>
                  <Button 
                    size="sm"
                    variant="outline"
                    className="flex-1 border-red-600/50 text-red-400 hover:bg-red-900/20"
                    onClick={() => {
                      const correctedType = window.prompt(
                        'Ingrese el tipo de documento correcto:',
                        analysisResult?.analysis?.documentType || ''
                      )
                      if (correctedType) {
                        const correctedDate = window.prompt(
                          'Ingrese la fecha de vencimiento correcta (DD/MM/YYYY) o deje vacío:',
                          analysisResult?.analysis?.expirationDate || ''
                        )
                        handleProvideFeedback(correctedType, correctedDate || undefined)
                      }
                    }}
                  >
                    ✕ Corregir
                  </Button>
                </div>
                <p className="text-xs text-slate-500 mt-2 text-center">Tu feedback entrena al modelo</p>
              </div>

              <div className="flex justify-end pt-2 gap-2">
                <Button 
                  variant="ghost" 
                  onClick={() => setShowAnalysisModal(false)}
                  className="text-slate-400"
                >
                  Cerrar
                </Button>
                <Button 
                  onClick={() => handleProvideFeedback()}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  Guardar & Continuar
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
