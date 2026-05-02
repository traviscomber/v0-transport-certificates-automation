import { useState, useEffect, useCallback } from 'react'
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
  rejection_reason?: string
}

export function useDriverDocuments(driverId: string, enabled = false, driverRut = '') {
  const [documents, setDocuments] = useState<DriverDocument[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  // Cargar documentos usando la API unificada
  const fetchDocuments = useCallback(async (skipCache = false) => {
    console.log('[v0] fetchDocuments called - driverRut:', driverRut, 'driverId:', driverId, 'skipCache:', skipCache)
    if (!driverRut) {
      console.log('[v0] Early return - no driverRut')
      return
    }
    
    setLoading(true)
    setError(null)
    try {
      // ALWAYS add timestamp to force unique URL and bypass cache
      const timestamp = Date.now()
      
      const headers: HeadersInit = {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
      
      console.log('[v0] Fetching documents for driver_rut:', driverRut, 'skipCache:', skipCache, 'timestamp:', timestamp)
      const urlParams = new URLSearchParams({
        driver_rut: driverRut,
        driver_id: driverId,
        _t: timestamp.toString() // Force unique URL
      })
      const fetchUrl = `/api/company/documents/drivers?${urlParams.toString()}`
      console.log('[v0] Fetch URL:', fetchUrl)
      const response = await fetch(fetchUrl, {
        method: 'GET',
        headers,
        cache: 'no-store'
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
        console.log('[v0] API error response:', response.status, text)
        throw new Error(result.error || 'Failed to fetch documents')
      }

      // The API route already maps validation_status → Spanish verification_status
      // Read verification_status directly — no double-mapping needed
      const transformedDocs = (result.documents || []).map((doc: any) => ({
        id: doc.id,
        driver_rut: doc.driver_rut || '',
        tipo: doc.document_type || 'Documento',
        nombre: doc.original_filename || doc.file_name || '',
        estado: (doc.verification_status || 'pendiente') as DriverDocument['estado'],
        fecha_subida: doc.created_at || new Date().toISOString(),
        public_url: doc.file_url || doc.public_url,
        storage_path: doc.file_path || doc.storage_path,
        uploaded_by: doc.uploaded_by || '',
        rejection_reason: doc.rejection_reason || undefined,
      }))

      console.log('[v0] API returned documents:', result.documents?.length, 'Transformed:', transformedDocs.length, 'conductor_id resolved:', result.conductor_id)
      setDocuments(transformedDocs)
    } catch (err) {
      console.error('[v0] Error fetching documents:', err)
      setError(err instanceof Error ? err.message : 'Unknown error')
      setDocuments([])
    } finally {
      setLoading(false)
    }
  }, [driverRut, driverId])

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
      formData.append('driver_id', driverId)
      formData.append('driver_rut', driverRut)
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

  // Actualizar estado de documento - SEND TO SERVER
  const updateDocumentStatus = async (documentId: string, newStatus: string, rejectionReason?: string) => {
    try {
      console.log('[v0] updateDocumentStatus called:', { documentId, newStatus, rejectionReason })
      
      const body: any = { status: newStatus }
      if (rejectionReason && (newStatus === 'rechazado' || newStatus === 'rejected')) {
        body.reason = rejectionReason
      }

      const response = await fetch(`/api/company/documents/${documentId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      })

      if (!response.ok) {
        const result = await response.json()
        throw new Error(result.error || `Failed to update status (${response.status})`)
      }

      const result = await response.json()
      console.log('[v0] Status update successful:', result)

      // Normalize status to español for local state
      const normalizedStatus = {
        'aprobado': 'aprobado',
        'approved': 'aprobado',
        'rechazado': 'rechazado',
        'rejected': 'rechazado',
        'pendiente': 'pendiente',
        'pending': 'pendiente',
        'vencido': 'vencido',
        'expired': 'vencido'
      }[newStatus?.toLowerCase()] || newStatus

      // Update local state immediately with correct status
      setDocuments(prev => {
        const updated = prev.map(doc =>
          doc.id === documentId 
            ? { ...doc, estado: normalizedStatus as DriverDocument['estado'] }
            : doc
        )
        console.log('[v0] setDocuments called - updated doc estado:', updated.find(d => d.id === documentId)?.estado)
        return updated
      })

      return result
    } catch (err) {
      console.error('[v0] Error updating document status:', err)
      throw err
    }
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

  // Fetch when card expands
  useEffect(() => {
    if (driverRut && enabled) {
      fetchDocuments()
    }
  }, [driverRut, enabled, fetchDocuments])

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
