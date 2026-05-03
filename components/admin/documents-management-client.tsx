'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Eye, Download, Trash2, CheckCircle, XCircle, Clock, Loader } from 'lucide-react'
import { DocumentActionModal } from '@/components/document-action-modal'

interface Document {
  id: string
  tipo: string
  nombre: string
  fecha_subida: string
  estado: 'pendiente' | 'aprobado' | 'rechazado'
  storage_path?: string
  public_url?: string
  rejection_reason?: string
  document_types?: { name?: string }
}

interface DocumentsManagementClientProps {
  conductorId: string
  conductorRut: string
  conductorName: string
  initialDocuments: any[]
}

export function DocumentsManagementClient({
  conductorId,
  conductorRut,
  conductorName,
  initialDocuments
}: DocumentsManagementClientProps) {
  const [documents, setDocuments] = useState<Document[]>([])
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null)
  const [isLoadingDocs, setIsLoadingDocs] = useState(false)

  useEffect(() => {
    console.log('[v0] DocumentsManagementClient received initialDocuments:', initialDocuments?.length || 0)
    
    // Transform initial documents to our format
    const transformed = initialDocuments.map((doc: any) => {
      // Use verification_status (from endpoint) or validation_status (from DB)
      const status = doc.verification_status || doc.validation_status || 'pendiente'
      const statusMap: Record<string, string> = {
        'approved': 'aprobado',
        'validated': 'aprobado',
        'rejected': 'rechazado',
        'pending': 'pendiente',
        'aprobado': 'aprobado',
        'rechazado': 'rechazado',
        'pendiente': 'pendiente',
      }
      const mappedStatus = statusMap[status.toLowerCase()] || status.toLowerCase()
      
      // Use document_type from endpoint or document_types.name from DB join
      const docType = doc.document_type || doc.document_types?.name || doc.document_type_code || 'Documento'
      // Use public_url from endpoint or file_url from page
      const url = doc.public_url || doc.file_url
      
      console.log('[v0] Transforming document:', {
        id: doc.id,
        fileName: doc.original_filename || doc.file_name,
        docType,
        rawStatus: status,
        mappedStatus,
        hasPublicUrl: !!url
      })
      
      return {
        id: doc.id,
        tipo: docType,
        nombre: doc.original_filename || doc.file_name || 'Documento sin nombre',
        fecha_subida: doc.created_at || doc.upload_date,
        estado: mappedStatus,
        storage_path: doc.storage_path,
        public_url: url,
        rejection_reason: doc.rejection_reason
      }
    })
    
    console.log('[v0] Transformed documents count:', transformed.length)
    setDocuments(transformed)
  }, [initialDocuments])

  const handleStatusChange = async (docId: string, newStatus: string, reason?: string) => {
    setIsLoadingDocs(true)
    try {
      const body: any = { status: newStatus }
      if (reason && newStatus === 'rechazado') {
        body.reason = reason
      }

      const response = await fetch(`/api/company/documents/${docId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      })

      if (!response.ok) {
        throw new Error('Error updating status')
      }

      // Update local state
      setDocuments(prev => prev.map(doc =>
        doc.id === docId
          ? {
              ...doc,
              estado: newStatus as 'pendiente' | 'aprobado' | 'rechazado',
              rejection_reason: reason
            }
          : doc
      ))

      // Close modal and show success
      setSelectedDocument(null)
      if (typeof window !== 'undefined') {
        const msg = document.createElement('div')
        msg.className = 'fixed bottom-4 right-4 bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg z-[100]'
        msg.textContent = `✓ Documento actualizado a ${newStatus}`
        document.body.appendChild(msg)
        setTimeout(() => msg.remove(), 3000)
      }
    } catch (error) {
      console.error('[v0] Error updating status:', error)
      alert(`Error: ${error instanceof Error ? error.message : 'Desconocido'}`)
    } finally {
      setIsLoadingDocs(false)
    }
  }

  const handleDelete = async (docId: string) => {
    if (!confirm('¿Eliminar este documento?')) return

    try {
      const response = await fetch(`/api/company/documents/${docId}/delete`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        throw new Error('Error deleting document')
      }

      setDocuments(prev => prev.filter(doc => doc.id !== docId))
      setSelectedDocument(null)

      if (typeof window !== 'undefined') {
        const msg = document.createElement('div')
        msg.className = 'fixed bottom-4 right-4 bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg z-[100]'
        msg.textContent = '✓ Documento eliminado'
        document.body.appendChild(msg)
        setTimeout(() => msg.remove(), 3000)
      }
    } catch (error) {
      console.error('[v0] Error deleting document:', error)
      alert('Error al eliminar el documento')
    }
  }

  const getStatusIcon = (estado: string) => {
    switch (estado) {
      case 'aprobado':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'rechazado':
        return <XCircle className="h-4 w-4 text-red-500" />
      default:
        return <Clock className="h-4 w-4 text-yellow-500" />
    }
  }

  const getStatusColor = (estado: string) => {
    switch (estado) {
      case 'aprobado':
        return 'bg-green-500/20 text-green-700 border-green-500/50'
      case 'rechazado':
        return 'bg-red-500/20 text-red-700 border-red-500/50'
      default:
        return 'bg-yellow-500/20 text-yellow-700 border-yellow-500/50'
    }
  }

  const getStatusLabel = (estado: string) => {
    switch (estado) {
      case 'aprobado':
        return 'Aprobado'
      case 'rechazado':
        return 'Rechazado'
      default:
        return 'Pendiente'
    }
  }

  return (
    <>
      {/* Documents List */}
      <div className="space-y-4">
        {documents.length === 0 ? (
          <Card className="bg-muted/50">
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">No hay documentos subidos</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {documents.map(doc => (
              <Card key={doc.id} className="hover:bg-accent/50 transition-colors">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between gap-4 flex-wrap">
                    {/* Document Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-slate-100 rounded">
                          <Eye className="h-5 w-5 text-slate-600" />
                        </div>
                        <div>
                          <p className="font-semibold truncate">{doc.nombre}</p>
                          <p className="text-sm text-muted-foreground">
                            {doc.tipo} • {new Date(doc.fecha_subida).toLocaleDateString('es-ES')}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Status Badge */}
                    <div className="flex items-center gap-2">
                      {getStatusIcon(doc.estado)}
                      <Badge className={`${getStatusColor(doc.estado)} border`}>
                        {getStatusLabel(doc.estado)}
                      </Badge>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedDocument(doc)}
                        className="gap-2"
                      >
                        <Eye className="h-4 w-4" />
                        Ver
                      </Button>
                    </div>
                  </div>

                  {/* Rejection Reason */}
                  {doc.estado === 'rechazado' && doc.rejection_reason && (
                    <div className="mt-3 p-3 bg-red-500/10 border border-red-500/30 rounded text-sm text-red-700">
                      <p className="font-semibold text-xs mb-1">Razón del rechazo:</p>
                      <p>{doc.rejection_reason}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Document Action Modal */}
      {selectedDocument && (
        <DocumentActionModal
          document={selectedDocument}
          isOpen={!!selectedDocument}
          onClose={() => setSelectedDocument(null)}
          onStatusChange={handleStatusChange}
          onDelete={handleDelete}
          isAdmin={true}
        />
      )}
    </>
  )
}
