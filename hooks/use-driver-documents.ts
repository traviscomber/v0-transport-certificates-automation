import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useDocumentSync, DocumentSyncEvent } from '@/contexts/document-sync-context'

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
  const { onSync } = useDocumentSync()

  const fetchDocuments = useCallback(async () => {
    if (!driverRut) return

    setLoading(true)
    setError(null)
    try {
      const timestamp = Date.now()
      const urlParams = new URLSearchParams({
        driver_rut: driverRut,
        driver_id: driverId,
        _t: timestamp.toString() // Force no-cache
      })
      
      const response = await fetch(`/api/company/documents/drivers?${urlParams.toString()}`, {
        method: 'GET',
        cache: 'no-store',
        headers: { 'Cache-Control': 'no-cache, no-store, must-revalidate' }
      })

      if (!response.ok) {
        throw new Error('Failed to fetch documents')
      }

      const result = await response.json()
      const docs = (result.documents || []).map((doc: any) => ({
        id: doc.id,
        driver_rut: doc.driver_rut || '',
        tipo: doc.document_type || 'Documento',
        nombre: doc.original_filename || doc.file_name || '',
        estado: doc.verification_status || 'pendiente',
        fecha_subida: doc.created_at || new Date().toISOString(),
        public_url: doc.file_url || doc.public_url,
        storage_path: doc.file_path || doc.storage_path,
        uploaded_by: doc.uploaded_by || '',
        rejection_reason: doc.rejection_reason || undefined,
      }))

      setDocuments(docs)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
      setDocuments([])
    } finally {
      setLoading(false)
    }
  }, [driverRut, driverId])

  const uploadDocument = async (
    tipo: string,
    nombre: string,
    file: File,
    expirationDate?: string,
    uploadedBy?: string
  ) => {
    try {
      let uploaderName = uploadedBy
      if (!uploaderName) {
        const { data: { user } } = await supabase.auth.getUser()
        uploaderName = user?.user_metadata?.full_name || user?.email || 'Unknown'
      }

      // Read file as Base64 to send as JSON
      const reader = new FileReader()
      const base64Promise = new Promise<string>((resolve, reject) => {
        reader.onload = () => {
          const result = reader.result as string
          console.log('[v0] FileReader result type:', typeof result, 'length:', result?.length)
          const parts = result.split(',')
          console.log('[v0] Split result - parts count:', parts.length)
          const base64 = parts[1]
          if (!base64) {
            reject(new Error('Failed to extract Base64 from FileReader result'))
            return
          }
          console.log('[v0] Base64 extracted, length:', base64.length)
          resolve(base64)
        }
        reader.onerror = (error) => {
          console.error('[v0] FileReader error:', error)
          reject(error)
        }
      })
      reader.readAsDataURL(file)
      
      const fileBase64 = await base64Promise
      
      console.log('[v0] uploadDocument: File converted to Base64, size:', fileBase64.length)
      
      const response = await fetch('/api/company/documents/upload-with-metadata', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          file: fileBase64,
          fileName: file.name,
          fileType: file.type,
          driver_id: driverId,
          driver_rut: driverRut,
          document_type_id: tipo || 'general',
          uploaded_by: uploaderName || '',
          metadata: {
            expiry_date: expirationDate,
          }
        })
      })

      console.log('[v0] uploadDocument: Response status:', response.status)
      
      const result = await response.json()
      console.log('[v0] uploadDocument: Response body:', result)
      
      if (!response.ok) {
        throw new Error(result?.error || 'Upload failed')
      }

      // After upload succeeds, refetch to get the new document
      await fetchDocuments()
      return result.document
    } catch (err) {
      throw err
    }
  }

  const updateDocumentStatus = async (documentId: string, newStatus: string, rejectionReason?: string) => {
    try {
      console.log('[v0] useDriverDocuments: updateDocumentStatus called', { documentId, newStatus, rejectionReason })
      
      // Status mapping
      const statusMap: Record<string, string> = {
        'aprobado': 'approved',
        'approved': 'approved',
        'rechazado': 'rejected',
        'rejected': 'rejected',
        'pendiente': 'pending',
        'pending': 'pending',
      }
      
      const englishStatus = statusMap[newStatus?.toLowerCase() || ''] || newStatus.toLowerCase()

      const body: any = { status: englishStatus }
      if (rejectionReason && (englishStatus === 'rejected')) {
        body.reason = rejectionReason
      }

      console.log('[v0] useDriverDocuments: Sending to API', { body })

      const response = await fetch(`/api/company/documents/${documentId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      })

      console.log('[v0] useDriverDocuments: API response status', response.status)

      if (!response.ok) {
        const result = await response.json()
        console.error('[v0] useDriverDocuments: API error', result)
        throw new Error(result.error || 'Failed to update status')
      }

      const result = await response.json()
      console.log('[v0] useDriverDocuments: API success', result)

      // Update local state with the response from API
      const statusToEstado: Record<string, DriverDocument['estado']> = {
        'pending': 'pendiente',
        'approved': 'aprobado',
        'rejected': 'rechazado',
      }
      const responseStatus = result.status || englishStatus
      const estadoEspanol = statusToEstado[responseStatus.toLowerCase()] as DriverDocument['estado']
      
      setDocuments(prev => prev.map(doc =>
        doc.id === documentId
          ? { ...doc, estado: estadoEspanol }
          : doc
      ))

      return result
    } catch (err) {
      console.error('[v0] useDriverDocuments: Error', err)
      throw err
    }
  }

  const deleteDocument = async (documentId: string) => {
    try {
      const response = await fetch(`/api/company/documents/${documentId}/delete`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const result = await response.json()
        throw new Error(result.error || 'Failed to delete document')
      }

      // Remove from local state
      setDocuments(prev => prev.filter(doc => doc.id !== documentId))
    } catch (err) {
      throw err
    }
  }

  // Fetch documents when card opens or when enabled changes
  useEffect(() => {
    if (enabled && driverRut) {
      fetchDocuments()
    }
  }, [enabled, driverRut, fetchDocuments])

  // Listen for document sync events and refetch when needed
  useEffect(() => {
    const unsubscribe = onSync((event: DocumentSyncEvent) => {
      if (!enabled) return // Only sync if hook is active
      
      console.log('[v0] useDriverDocuments: Received sync event', event.type)
      
      // Check if this sync event affects this conductor
      if (event.conductorId && event.conductorId !== driverId) {
        return // Event is for a different conductor
      }
      
      // For any document-related sync event, refetch documents
      if (event.type === 'document_uploaded' || event.type === 'document_status_changed') {
        console.log('[v0] useDriverDocuments: Refetching documents due to sync event')
        fetchDocuments()
      }
    })

    return unsubscribe
  }, [enabled, driverId, onSync, fetchDocuments])

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
