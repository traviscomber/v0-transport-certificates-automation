import { useState, useEffect } from 'react'

export interface DriverDocument {
  id: string
  driver_id: string
  tipo: string
  nombre: string
  estado: 'pendiente' | 'aprobado' | 'rechazado'
  fecha_subida: string
}

export function useDriverDocuments(driverId: string) {
  const [documents, setDocuments] = useState<DriverDocument[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Cargar documentos usando la API unificada
  const fetchDocuments = async () => {
    setLoading(true)
    setError(null)
    try {
      console.log('[v0] Fetching driver documents from unified API:', driverId)
      const response = await fetch(`/api/company/documents/drivers/${driverId}`)
      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to fetch documents')
      }

      // Transformar respuesta de la API unificada
      const transformedDocs = (result.documents || []).map((doc: any) => ({
        id: doc.id,
        driver_id: driverId,
        tipo: doc.document_type || 'Documento',
        nombre: doc.file_name || '',
        estado: doc.verification_status || 'pendiente',
        fecha_subida: doc.upload_date || new Date().toISOString(),
      }))

      console.log('[v0] Documents loaded:', transformedDocs.length)
      setDocuments(transformedDocs)
    } catch (err) {
      console.error('[v0] Error fetching documents:', err)
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  // Subir documento usando la API unificada
  const uploadDocument = async (tipo: string, nombre: string, file: File) => {
    try {
      console.log('[v0] Preparing FormData for upload', { driverId, tipo, nombre, fileType: file.type, fileSize: file.size })
      const formData = new FormData()
      formData.append('file', file)
      formData.append('driverId', driverId)
      formData.append('document_type', tipo)
      formData.append('file_name', nombre)

      console.log('[v0] Sending upload request to /api/company/documents/drivers/upload')
      const response = await fetch('/api/company/documents/drivers/upload', {
        method: 'POST',
        body: formData,
      })

      console.log('[v0] Upload response status:', response.status)
      const result = await response.json()

      if (!response.ok) {
        const errorMsg = result.error || `Upload failed with status ${response.status}`
        console.error('[v0] Upload failed:', errorMsg)
        throw new Error(errorMsg)
      }

      console.log('[v0] Document uploaded successfully:', result.document?.id)
      // Recargar documentos desde API (single source of truth)
      await fetchDocuments()
      return result.document
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Error desconocido'
      console.error('[v0] Error uploading document:', errorMsg)
      throw err
    }
  }

  // Cargar documentos al montar o cuando cambia driverId
  useEffect(() => {
    if (driverId) {
      fetchDocuments()
    }
  }, [driverId])

  return {
    documents,
    loading,
    error,
    uploadDocument,
    refetch: fetchDocuments,
  }
}
