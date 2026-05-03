import { useState, useCallback } from 'react'

interface DocumentAlert {
  document_id: string
  file_name: string
  document_type: string
  custom_code: string
  expiration_date: string
  days_remaining: number
  status: 'expired' | 'expiring_soon'
  severity: 'critical' | 'high' | 'medium'
  alert_type: 'EXPIRED' | 'URGENT' | 'WARNING'
}

interface DocumentManagement {
  changeStatus: (documentId: string, status: string, reason?: string) => Promise<any>
  updateMetadata: (documentId: string, customCode?: string, expirationDate?: string) => Promise<any>
  generateCode: (documentId: string, companyCode: string, driverRut: string, documentType: string) => Promise<string>
  deleteDocument: (documentId: string, storagePath: string) => Promise<any>
  getAlerts: (driverRut?: string, daysThreshold?: number) => Promise<{ critical: DocumentAlert[]; urgent: DocumentAlert[]; warnings: DocumentAlert[] }>
  loading: boolean
  error: string | null
}

export function useDocumentManagement(): DocumentManagement {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Verify status was actually updated (with retries)
  const verifyStatusUpdate = useCallback(async (
    documentId: string,
    expectedStatus: string,
    maxRetries: number = 3,
    delayMs: number = 300
  ): Promise<boolean> => {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const response = await fetch(`/api/company/documents/${documentId}/status`, {
          method: 'GET',
        })
        
        if (!response.ok) continue

        const data = await response.json()
        const currentStatus = data.status?.toLowerCase()
        const expected = expectedStatus.toLowerCase()

        if (currentStatus === expected) {
          console.log(`[v0] ✅ Status verified on attempt ${attempt}/${maxRetries}: ${currentStatus}`)
          return true
        }

        console.log(`[v0] ⚠️ Status mismatch on attempt ${attempt}: got ${currentStatus}, expected ${expected}`)

        if (attempt < maxRetries) {
          await new Promise(resolve => setTimeout(resolve, delayMs * attempt))
        }
      } catch (err) {
        console.error(`[v0] Verification attempt ${attempt} failed:`, err)
      }
    }

    console.error(`[v0] ❌ Status update verification failed after ${maxRetries} retries`)
    return false
  }, [])

  const changeStatus = useCallback(async (documentId: string, status: string, reason?: string) => {
    setLoading(true)
    setError(null)
    try {
      console.log('[v0] 🔄 Hook: changeStatus called with:', { documentId, status, reason })
      
      const response = await fetch(`/api/company/documents/${documentId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, reason })
      })

      const responseData = await response.json()
      console.log('[v0] 📥 Hook: Status change response:', { status: response.status, data: responseData })

      if (!response.ok) {
        const errorMsg = responseData.error || 'Failed to change status'
        throw new Error(errorMsg)
      }
      
      console.log('[v0] ✅ Hook: Status changed successfully on server')
      
      // Verify the status was actually updated (with retry logic)
      console.log('[v0] 🔍 Verifying status update...')
      const verified = await verifyStatusUpdate(documentId, status)
      
      if (!verified) {
        console.warn('[v0] ⚠️ Status update could not be verified, but was recorded')
      }

      return responseData
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Error changing status'
      console.error('[v0] ❌ Hook error:', msg)
      setError(msg)
      throw err
    } finally {
      setLoading(false)
    }
  }, [verifyStatusUpdate])

  const updateMetadata = useCallback(async (documentId: string, customCode?: string, expirationDate?: string) => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch(`/api/company/documents/${documentId}/metadata`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ custom_code: customCode, expiration_date: expirationDate })
      })

      if (!response.ok) throw new Error('Failed to update metadata')
      return await response.json()
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Error updating metadata'
      setError(msg)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const generateCode = useCallback(async (
    documentId: string,
    companyCode: string,
    driverRut: string,
    documentType: string
  ): Promise<string> => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch(`/api/company/documents/${documentId}/metadata`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ company_code: companyCode, driver_rut: driverRut, document_type: documentType })
      })

      if (!response.ok) throw new Error('Failed to generate code')
      const result = await response.json()
      return result.generated_code
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Error generating code'
      setError(msg)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const getAlerts = useCallback(async (driverRut?: string, daysThreshold: number = 30) => {
    setLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams()
      if (driverRut) params.append('driver_rut', driverRut)
      params.append('days', daysThreshold.toString())

      const response = await fetch(`/api/company/documents/alerts?${params}`, {
        method: 'GET'
      })

      if (!response.ok) throw new Error('Failed to fetch alerts')
      const result = await response.json()
      return {
        critical: result.critical || [],
        urgent: result.urgent || [],
        warnings: result.warnings || []
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Error fetching alerts'
      setError(msg)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const deleteDocument = useCallback(async (documentId: string, storagePath: string) => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch(`/api/company/documents/${documentId}/delete`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ storage_path: storagePath })
      })

      if (!response.ok) throw new Error('Failed to delete document')
      return await response.json()
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Error deleting document'
      setError(msg)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  return {
    changeStatus,
    updateMetadata,
    generateCode,
    deleteDocument,
    getAlerts,
    loading,
    error
  }
}
