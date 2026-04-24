import { useState } from 'react'
import { Plus, CheckCircle, AlertCircle, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { DocumentUploadModal } from '@/components/document-upload-modal'
import { DOCUMENT_TYPES } from '@/lib/documents-config'

interface DriverDocumentsManagerProps {
  driverRut: string
  uploadedDocuments: any[]
  onDocumentUploaded: () => void
}

export function DriverDocumentsManager({
  driverRut,
  uploadedDocuments,
  onDocumentUploaded,
}: DriverDocumentsManagerProps) {
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [uploading, setUploading] = useState(false)

  // Get required documents that haven't been uploaded
  const requiredDocs = DOCUMENT_TYPES.filter(doc => doc.required)
  const uploadedIds = new Set(uploadedDocuments.map(d => d.document_type_id))
  const missingDocs = requiredDocs.filter(doc => !uploadedIds.has(doc.id))

  const handleDocumentSelected = async (documentType: any, file: File, metadata: any) => {
    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('driver_rut', driverRut)
      formData.append('document_type_id', documentType.id)
      formData.append('metadata', JSON.stringify(metadata))

      const response = await fetch('/api/company/documents/upload-with-metadata', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) throw new Error('Upload failed')

      onDocumentUploaded()
      setShowUploadModal(false)
    } catch (error) {
      console.error('[v0] Upload error:', error)
      throw error
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="space-y-4">
      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-2">
        <div className="bg-green-900/20 border border-green-700/50 rounded p-2 text-center">
          <p className="text-xs text-green-400 font-medium">{requiredDocs.length - missingDocs.length}</p>
          <p className="text-xs text-green-300">Documentos subidos</p>
        </div>
        <div className="bg-yellow-900/20 border border-yellow-700/50 rounded p-2 text-center">
          <p className="text-xs text-yellow-400 font-medium">{missingDocs.length}</p>
          <p className="text-xs text-yellow-300">Pendientes</p>
        </div>
        <div className="bg-blue-900/20 border border-blue-700/50 rounded p-2 text-center">
          <p className="text-xs text-blue-400 font-medium">{Math.round(((requiredDocs.length - missingDocs.length) / requiredDocs.length) * 100)}%</p>
          <p className="text-xs text-blue-300">Completado</p>
        </div>
      </div>

      {/* Missing Documents List */}
      {missingDocs.length > 0 && (
        <div className="bg-amber-900/20 border border-amber-700/50 rounded p-3">
          <div className="flex items-start gap-2 mb-3">
            <AlertCircle className="h-4 w-4 text-amber-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-medium text-amber-300 text-sm">Documentos pendientes</p>
              <p className="text-xs text-amber-300/70">Debes subir {missingDocs.length} documento(s) más</p>
            </div>
          </div>
          <div className="space-y-1">
            {missingDocs.slice(0, 3).map(doc => (
              <div key={doc.id} className="text-xs text-amber-300/80 flex items-center gap-2">
                <Clock className="h-3 w-3" />
                <span>{doc.name}</span>
              </div>
            ))}
            {missingDocs.length > 3 && (
              <p className="text-xs text-amber-300/60">+ {missingDocs.length - 3} más</p>
            )}
          </div>
        </div>
      )}

      {/* Uploaded Documents List */}
      {uploadedDocuments.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-medium text-slate-300">Documentos subidos</p>
          {uploadedDocuments.map(doc => {
            const docType = DOCUMENT_TYPES.find(d => d.id === doc.document_type_id)
            return (
              <div key={doc.id} className="flex items-center justify-between bg-slate-800/50 rounded p-2">
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <CheckCircle className="h-4 w-4 text-green-400 flex-shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-medium text-slate-300 truncate">{docType?.name || doc.document_type_id}</p>
                    <p className="text-xs text-slate-500">{new Date(doc.uploaded_at).toLocaleDateString('es-ES')}</p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Upload Button */}
      <Button
        onClick={() => setShowUploadModal(true)}
        disabled={uploading}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white"
      >
        <Plus className="h-4 w-4 mr-2" />
        {uploading ? 'Subiendo...' : 'Subir Documento'}
      </Button>

      {/* Upload Modal */}
      <DocumentUploadModal
        isOpen={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        onDocumentSelected={handleDocumentSelected}
        driverRut={driverRut}
      />
    </div>
  )
}
