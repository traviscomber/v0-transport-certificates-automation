import { useState, useEffect } from 'react'

export interface DriverDocument {
  id: string
  driver_rut: string
  tipo: string
  nombre: string
  estado: 'pendiente' | 'aprobado' | 'rechazado'
  fecha_subida: string
  public_url?: string
  storage_path?: string
}

export function useDriverDocuments(driverRut: string, enabled = false) {
  const [documents, setDocuments] = useState<DriverDocument[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Cargar documentos usando la API unificada
  const fetchDocuments = async (skipCache = false) => {
    if (!driverRut) return
    
    setLoading(true)
    setError(null)
    try {
      console.log('[v0] Fetching driver documents from unified API:', driverRut, { skipCache })
      // Add cache busting parameter if skipCache is true
      const timestamp = skipCache ? `&_t=${Date.now()}` : ''
      const headers: HeadersInit = skipCache ? {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      } : {}
      
      const response = await fetch(`/api/company/documents/drivers?rut=${encodeURIComponent(driverRut)}${timestamp}`, {
        method: 'GET',
        headers,
        cache: skipCache ? 'no-store' : 'default'
      })

      // Read as text first to avoid "Unexpected end of JSON input" crash
      const text = await response.text()
      if (!text || text.trim() === '') {
        setDocuments([])
        return
      }

      let result: any
      try {
        result = JSON.parse(text)
      } catch {
        console.error('[v0] Invalid JSON from documents API:', text.substring(0, 100))
        setDocuments([])
        return
      }

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
        public_url: doc.public_url,
        storage_path: doc.storage_path,
      }))

      console.log('[v0] Documents loaded:', transformedDocs.length)
      setDocuments(transformedDocs)
      console.log('[v0] State updated, documents count:', transformedDocs.length)
    } catch (err) {
      console.error('[v0] Error fetching documents:', err)
      setError(err instanceof Error ? err.message : 'Unknown error')
      setDocuments([])
    } finally {
      setLoading(false)
    }
  }

  // Subir documento con fecha de vencimiento y validar con OpenAI
  const uploadDocument = async (
    tipo: string,
    nombre: string,
    file: File,
    expirationDate?: string
  ) => {
    try {
      console.log('[v0] Uploading document:', { driverRut, tipo, file: file.name, expirationDate })
      const formData = new FormData()
      formData.append('file', file)
      formData.append('driverRut', driverRut)
      formData.append('documentType', tipo)
      if (expirationDate) {
        formData.append('expiration_date', expirationDate)
      }

      const response = await fetch('/api/drivers/upload-doc', {
        method: 'POST',
        body: formData,
      })

      console.log('[v0] Upload response status:', response.status, 'ok:', response.ok)
      
      if (!response.ok) {
        const result = await response.json()
        console.error('[v0] Upload failed with status', response.status, ':', result)
        throw new Error(result.error || `Upload failed with status ${response.status}`)
      }

      const uploadResult = await response.json()
      console.log('[v0] Upload response JSON:', uploadResult)
      console.log('[v0] Document uploaded:', uploadResult.documents?.length, 'file(s)')
      console.log('[v0] Documents array:', uploadResult.documents)

      // Procesar cada documento subido
      const uploadedDoc = uploadResult.documents?.[0] // Tomar el primero
      if (!uploadedDoc) {
        throw new Error('No document returned from upload')
      }

      // Validar documento con OpenAI usando la URL pública
      if (uploadedDoc.public_url) {
        console.log('[v0] Starting document validation...')
        const validationResponse = await fetch('/api/company/documents/drivers/validate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            file_url: uploadedDoc.public_url,
            document_type: tipo,
            driver_rut: driverRut,
          }),
        })

        if (validationResponse.ok) {
          const validation = await validationResponse.json()
          console.log('[v0] Document validated:', validation.extracted_data)
          
          // Extraer fecha de vencimiento si viene en los datos extraídos
          if (validation.extracted_data?.expiration_date) {
            await fetch(`/api/company/documents/${uploadedDoc.id}/metadata`, {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ 
                expiration_date: validation.extracted_data.expiration_date 
              })
            }).catch(err => console.error('Error setting extracted expiration:', err))
          }
          
          uploadedDoc.validation = validation.validation
          uploadedDoc.extracted_data = validation.extracted_data
        }
      }

      // Recargar lista de documentos DESPUÉS del upload
      console.log('[v0] Upload complete, reloading documents with cache bust...')
      await new Promise(resolve => setTimeout(resolve, 500)) // Dar tiempo al servidor
      await fetchDocuments(true) // Force cache skip
      console.log('[v0] Documents reloaded after upload')
      return uploadedDoc
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Upload failed'
      console.error('[v0] Error uploading document:', errorMsg)
      throw err
    }
  }

  // Optimistically update document status in local state immediately
  const updateDocumentStatus = (documentId: string, newStatus: string) => {
    setDocuments(prev => prev.map(doc =>
      doc.id === documentId ? { ...doc, estado: newStatus as DriverDocument['estado'] } : doc
    ))
  }

  // Eliminar documento y refrescar lista
  const deleteDocument = async (documentId: string) => {
    try {
      const response = await fetch(`/api/company/documents/${documentId}/delete`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const result = await response.json()
        throw new Error(result.error || 'Failed to delete document')
      }

      // Refetch after delete to sync UI
      await fetchDocuments(true)
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Delete failed'
      console.error('[v0] Error deleting document:', errorMsg)
      throw err
    }
  }

  // Only fetch when explicitly enabled (e.g. card is expanded)
  useEffect(() => {
    if (driverRut && enabled) {
      fetchDocuments()
    }
  }, [driverRut, enabled])

  return {
    documents,
    loading,
    error,
    uploadDocument,
    deleteDocument,
    updateDocumentStatus,
    refetch: fetchDocuments,
  }
}
