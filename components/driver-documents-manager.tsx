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
      // Read file as ArrayBuffer
      const arrayBuffer = await file.arrayBuffer()
      const uint8Array = new Uint8Array(arrayBuffer)

      console.log('[v0] Upload request:', { 
        driver_rut: identifier, 
        document_type_id: documentType.id, 
        file_name: file.name,
        file_size: file.size,
        file_type: file.type
      })

      // Send file as binary with metadata in headers to avoid FormData issues
      const response = await fetch('/api/company/documents/upload-with-metadata', {
        method: 'POST',
        headers: {
          'Content-Type': file.type || 'application/octet-stream',
          'X-File-Name': file.name,
          'X-Driver-Rut': identifier,
          'X-Document-Type-Id': documentType.id,
          'X-Metadata': JSON.stringify(metadata),
        },
        body: uint8Array,
        credentials: 'include',
      })

      if (!response.ok) {
        const error = await response.json()
        console.error('[v0] Upload error response:', error)
        throw new Error(error.error || 'Upload failed')
      }

      const result = await response.json()
      console.log('[v0] Upload success:', result)

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
