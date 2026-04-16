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

  // Cargar documentos
  const fetchDocuments = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch(`/api/documents/${driverId}`)
      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to fetch documents')
      }

      setDocuments(result.data || [])
    } catch (err) {
      console.error('[v0] Error fetching documents:', err)
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  // Subir documento
  const uploadDocument = async (tipo: string, nombre: string, file: File) => {
    try {
      console.log('[v0] Preparing FormData for upload', { tipo, nombre, fileType: file.type, fileSize: file.size })
      const formData = new FormData()
      formData.append('driverId', driverId)
      formData.append('tipo', tipo)
      formData.append('nombre', nombre)
      formData.append('file', file)

      console.log('[v0] Sending upload request to /api/documents/upload')
      const response = await fetch('/api/documents/upload', {
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

      console.log('[v0] Document uploaded successfully:', result.data)
      // Recargar documentos
      await fetchDocuments()
      return result.data
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
