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

  const changeStatus = useCallback(async (documentId: string, status: string, reason?: string) => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch(`/api/company/documents/${documentId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, reason })
      })

      if (!response.ok) throw new Error('Failed to change status')
      return await response.json()
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Error changing status'
      setError(msg)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

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
