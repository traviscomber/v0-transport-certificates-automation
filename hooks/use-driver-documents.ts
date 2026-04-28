import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'

export interface DriverDocument {
  id: string
  driver_rut: string
  tipo: string
  nombre: string
  estado: 'pendiente' | 'aprobado' | 'rechazado'
  fecha_subida: string
  public_url?: string
  storage_path?: string
  uploaded_by?: string
}

export function useDriverDocuments(driverRut: string, enabled = false) {
  const [documents, setDocuments] = useState<DriverDocument[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()
  const unsubscribeRef = useRef<(() => void) | null>(null)

  // Cargar documentos usando la API unificada
  const fetchDocuments = async (skipCache = false) => {
    if (!driverRut) return
    
    setLoading(true)
    setError(null)
    try {
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

      // Transformar respuesta de la API
      const transformedDocs = (result.documents || []).map((doc: any) => ({
        id: doc.id,
        driver_rut: driverRut,
        tipo: doc.document_type || 'Documento',
        nombre: doc.original_filename || doc.file_name || '',
        estado: doc.validation_status === 'validated' ? 'aprobado' : 'pendiente',
        fecha_subida: doc.created_at || new Date().toISOString(),
        public_url: doc.file_url || doc.public_url,
        storage_path: doc.file_path || doc.storage_path,
        uploaded_by: doc.uploaded_by || '',
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

  // Subir documento
  const uploadDocument = async (
    tipo: string,
    nombre: string,
    file: File,
    expirationDate?: string,
    uploadedBy?: string
  ) => {
    try {
      // Use provided uploadedBy or get from authenticated user
      let uploaderName = uploadedBy
      if (!uploaderName) {
        const { data: { user } } = await supabase.auth.getUser()
        uploaderName = user?.user_metadata?.full_name || user?.email || 'Unknown'
      }
      
      const formData = new FormData()
      formData.append('file', file)
      formData.append('driver_id', driverRut)
      formData.append('document_type_id', tipo || 'general')
      formData.append('uploaded_by', uploaderName || '')
      const metadata: any = {}
      if (expirationDate) metadata.expiry_date = expirationDate
      formData.append('metadata', JSON.stringify(metadata))

      const response = await fetch('/api/company/documents/upload-with-metadata', {
        method: 'POST',
        body: formData,
      })

      console.log('[v0] Upload response status:', response.status)
      
      let uploadResult
      try {
        const responseText = await response.text()
        console.log('[v0] Response text length:', responseText.length, 'first 200 chars:', responseText.substring(0, 200))
        
        if (!responseText) {
          throw new Error('Empty response from server')
        }
        
        uploadResult = JSON.parse(responseText)
      } catch (parseErr) {
        console.error('[v0] Failed to parse response JSON:', parseErr)
        console.error('[v0] Response status was:', response.status)
        throw new Error(`Server error: Invalid response format - ${parseErr instanceof Error ? parseErr.message : 'Unknown error'}`)
      }
      
      if (!response.ok) {
        console.error('[v0] Upload failed:', uploadResult)
        throw new Error(uploadResult?.error || `Upload failed with status ${response.status}`)
      }

      console.log('[v0] Document uploaded:', uploadResult.document)

      // Refresh documents IMMEDIATELY and forcefully multiple times
      console.log('[v0] Forcing immediate document refresh after upload')
      await fetchDocuments(true)
      
      // Second refresh after a short delay
      await new Promise(resolve => setTimeout(resolve, 300))
      await fetchDocuments(true)
      
      // Third refresh after another delay for safety
      await new Promise(resolve => setTimeout(resolve, 700))
      await fetchDocuments(true)
      
      console.log('[v0] Documents refreshed after upload')
      
      return uploadResult.document
    } catch (err) {
      console.error('[v0] Error uploading document:', err)
      throw err
    }
  }

  // Actualizar estado de documento
  const updateDocumentStatus = (documentId: string, newStatus: string) => {
    setDocuments(prev => prev.map(doc =>
      doc.id === documentId ? { ...doc, estado: newStatus as DriverDocument['estado'] } : doc
    ))
  }

  // Eliminar documento
  const deleteDocument = async (documentId: string) => {
    try {
      const response = await fetch(`/api/company/documents/${documentId}/delete`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const result = await response.json()
        throw new Error(result.error || 'Failed to delete document')
      }

      await fetchDocuments(true)
    } catch (err) {
      console.error('[v0] Error deleting document:', err)
      throw err
    }
  }

  // Solo cargar cuando está habilitado (e.g. la tarjeta está expandida)
  useEffect(() => {
    if (driverRut && enabled) {
      fetchDocuments()
      
      // Configurar suscripción en tiempo real
      console.log('[v0] Setting up realtime subscription for driver documents:', driverRut)
      const channel = supabase
        .channel(`driver_docs_${driverRut}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'uploaded_documents',
            filter: `conductor_id=eq.${driverRut}`,
          },
          (payload) => {
            console.log('[v0] Document change detected for driver:', driverRut, payload.eventType)
            // Refetch cuando hay cambios
            fetchDocuments(true)
          }
        )
        .subscribe((status) => {
          console.log('[v0] Subscription status for driver docs:', status)
        })

      unsubscribeRef.current = () => channel.unsubscribe()

      return () => {
        if (unsubscribeRef.current) {
          unsubscribeRef.current()
        }
      }
    }
  }, [driverRut, enabled, supabase])

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
