import { useState } from 'react'
import { Plus, CheckCircle, AlertCircle, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { DocumentUploadModal } from '@/components/document-upload-modal'
import { DOCUMENT_TYPES } from '@/lib/documents-config'

interface DriverDocumentsManagerProps {
  driverId?: string
  driverRut?: string
  onUploadSuccess: () => void
}

export function DriverDocumentsManager({
  driverId,
  driverRut,
  onUploadSuccess,
}: DriverDocumentsManagerProps) {
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [uploading, setUploading] = useState(false)
  const identifier = driverId || driverRut || ''

  const handleDocumentSelected = async (documentType: any, file: File, metadata: any) => {
    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('driver_rut', identifier)
      formData.append('document_type_id', documentType.id)
      formData.append('metadata', JSON.stringify(metadata))

      const response = await fetch('/api/company/documents/upload-with-metadata', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) throw new Error('Upload failed')

      onUploadSuccess()
      setShowUploadModal(false)
    } catch (error) {
      console.error('[v0] Upload error:', error)
      throw error
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="space-y-4 bg-slate-900/50 border border-slate-800 rounded-lg p-6">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-200 flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Subir Nuevo Documento
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            Selecciona de los 40+ documentos requeridos de Walmart compliance
          </p>
        </div>
        <Button
          onClick={() => setShowUploadModal(true)}
          disabled={uploading}
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          {uploading ? 'Subiendo...' : 'Seleccionar documento'}
        </Button>
      </div>

      {/* Upload Modal */}
      <DocumentUploadModal
        isOpen={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        onDocumentSelected={handleDocumentSelected}
        driverRut={identifier}
      />
    </div>
  )
}
