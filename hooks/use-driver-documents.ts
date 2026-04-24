import { useState, useEffect } from 'react'

export interface DriverDocument {
  id: string
  driver_rut: string
  tipo: string
  nombre: string
  estado: 'pendiente' | 'aprobado' | 'rechazado'
  fecha_subida: string
}

export function useDriverDocuments(driverRut: string) {
  const [documents, setDocuments] = useState<DriverDocument[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Cargar documentos usando la API unificada
  const fetchDocuments = async () => {
    if (!driverRut) return
    
    setLoading(true)
    setError(null)
    try {
      console.log('[v0] Fetching driver documents from unified API:', driverRut)
      const response = await fetch(`/api/company/documents/drivers?rut=${encodeURIComponent(driverRut)}`)
      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to fetch documents')
      }

      // Transformar respuesta de la API unificada
      const transformedDocs = (result.documents || []).map((doc: any) => ({
        id: doc.id,
        driver_rut: driverRut,
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
      setDocuments([])
    } finally {
      setLoading(false)
    }
  }

  // Subir documento y validar con OpenAI
  const uploadDocument = async (tipo: string, nombre: string, file: File) => {
    try {
      console.log('[v0] Uploading document:', { driverRut, tipo, file: file.name })
      const formData = new FormData()
      formData.append('file', file)
      formData.append('driverRut', driverRut)
      formData.append('document_type', tipo)
      formData.append('file_name', nombre)

      const response = await fetch('/api/company/documents/drivers/upload', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const result = await response.json()
        throw new Error(result.error || 'Upload failed')
      }

      const uploadResult = await response.json()
      console.log('[v0] Document uploaded:', uploadResult.document.id)

      // Validar documento con OpenAI usando la URL pública
      console.log('[v0] Starting document validation...')
      const validationResponse = await fetch('/api/company/documents/drivers/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          file_url: uploadResult.document.public_url,
          document_type: tipo,
          driver_rut: driverRut,
        }),
      })

      if (validationResponse.ok) {
        const validation = await validationResponse.json()
        console.log('[v0] Document validated:', validation.extracted_data)
        uploadResult.document.validation = validation.validation
        uploadResult.document.extracted_data = validation.extracted_data
      }

      // Recargar lista de documentos
      await fetchDocuments()
      return uploadResult.document
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Upload failed'
      console.error('[v0] Error uploading document:', errorMsg)
      throw err
    }
  }

  // Cargar documentos al montar o cuando cambia driverRut
  useEffect(() => {
    if (driverRut) {
      fetchDocuments()
    }
  }, [driverRut])

  return {
    documents,
    loading,
    error,
    uploadDocument,
    refetch: fetchDocuments,
  }
}
