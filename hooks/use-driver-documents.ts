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
  const uploadDocument = async (tipo: string, nombre: string) => {
    try {
      const response = await fetch('/api/documents/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          driverId,
          tipo,
          nombre,
          estado: 'pendiente',
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to upload document')
      }

      console.log('[v0] Document uploaded successfully:', result.data)
      // Recargar documentos
      await fetchDocuments()
      return result.data
    } catch (err) {
      console.error('[v0] Error uploading document:', err)
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
