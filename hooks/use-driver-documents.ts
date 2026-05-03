import { useState, useEffect, useCallback, useRef } from 'react'
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

  // Track whether we have loaded data for this driverId
  const loadedForDriverRef = useRef<string | null>(null)

  // Map of documentId → optimistic status that should NOT be overwritten by fetches
  const optimisticUpdatesRef = useRef<Record<string, string>>({})

  const fetchDocuments = useCallback(async (skipCache = false) => {
    if (!driverRut) return

    setLoading(true)
    setError(null)
    try {
      const timestamp = Date.now()
      const headers: HeadersInit = {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
      const urlParams = new URLSearchParams({
        driver_rut: driverRut,
        driver_id: driverId,
        _t: timestamp.toString()
      })
      const response = await fetch(`/api/company/documents/drivers?${urlParams.toString()}`, {
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
        setDocuments([])
        return
      }

      if (!response.ok) {
        throw new Error(result.error || 'Failed to fetch documents')
      }

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

      // Apply any pending optimistic updates so fetch doesn't overwrite them
      const pending = optimisticUpdatesRef.current
      const mergedDocs = transformedDocs.map((doc: DriverDocument) => {
        if (pending[doc.id]) {
          return { ...doc, estado: pending[doc.id] as DriverDocument['estado'] }
        }
        return doc
      })

      loadedForDriverRef.current = driverId
      setDocuments(mergedDocs)
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

      let uploadResult
      try {
        const responseText = await response.text()
        if (!responseText) throw new Error('Empty response from server')
        uploadResult = JSON.parse(responseText)
      } catch (parseErr) {
        throw new Error('Server error: Invalid response format')
      }

      if (!response.ok) {
        throw new Error(uploadResult?.error || `Upload failed with status ${response.status}`)
      }

      // Invalidate loaded cache so next open refetches
      loadedForDriverRef.current = null

      await fetchDocuments(true)
      await new Promise(resolve => setTimeout(resolve, 300))
      await fetchDocuments(true)
      await new Promise(resolve => setTimeout(resolve, 700))
      await fetchDocuments(true)

      return uploadResult.document
    } catch (err) {
      throw err
    }
  }

  const updateDocumentStatus = async (documentId: string, newStatus: string, rejectionReason?: string) => {
    const statusMap: Record<string, string> = {
      'aprobado': 'aprobado',
      'approved': 'aprobado',
      'rechazado': 'rechazado',
      'rejected': 'rechazado',
      'pendiente': 'pendiente',
      'pending': 'pendiente',
      'vencido': 'vencido',
      'expired': 'vencido'
    }
    const mappedStatus = statusMap[newStatus?.toLowerCase() || ''] || newStatus

    // 1. Apply optimistic update to local state IMMEDIATELY
    setDocuments(prev => prev.map(doc =>
      doc.id === documentId
        ? { ...doc, estado: mappedStatus as DriverDocument['estado'] }
        : doc
    ))

    // 2. Register in pending optimistic map so fetches don't overwrite it
    optimisticUpdatesRef.current[documentId] = mappedStatus

    try {
      const body: any = { status: newStatus }
      const normalizedStatus = newStatus?.toLowerCase().trim()
      if (rejectionReason && (normalizedStatus === 'rechazado' || normalizedStatus === 'rejected')) {
        body.reason = rejectionReason
      }

      const response = await fetch(`/api/company/documents/${documentId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      })

      if (!response.ok) {
        const result = await response.json()
        // Remove optimistic update on failure — revert
        delete optimisticUpdatesRef.current[documentId]
        // Revert local state
        setDocuments(prev => prev.map(doc =>
          doc.id === documentId
            ? { ...doc, estado: (statusMap[result.previous_status] || 'pendiente') as DriverDocument['estado'] }
            : doc
        ))
        throw new Error(result.error || `Failed to update status (${response.status})`)
      }

      const result = await response.json()

      // 3. Confirm the server accepted it — keep optimistic update
      // Clear from pending AFTER a short delay to protect against any in-flight fetches
      setTimeout(() => {
        delete optimisticUpdatesRef.current[documentId]
      }, 3000)

      return result
    } catch (err) {
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

      loadedForDriverRef.current = null
      await fetchDocuments(true)
    } catch (err) {
      throw err
    }
  }

  // Only fetch when card first expands for this driverId, not on every re-render
  useEffect(() => {
    if (driverRut && enabled && loadedForDriverRef.current !== driverId) {
      fetchDocuments(true)
    }
  }, [driverRut, enabled, driverId, fetchDocuments])

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
