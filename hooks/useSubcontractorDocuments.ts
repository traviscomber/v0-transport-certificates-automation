import { useEffect, useState } from 'react'

interface SubcontractorDocument {
  id: string
  rut: string
  documento_tipo: string
  estado: 'pending' | 'approved' | 'rejected' | 'expired'
  archivo_url: string
  fecha_carga: string
  fecha_expiracion?: string
}

export function useSubcontractorDocuments(rut: string) {
  const [documents, setDocuments] = useState<SubcontractorDocument[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        setLoading(true)
        const response = await fetch(`/api/subcontractors/${rut}/documents`)

        if (!response.ok) {
          throw new Error('Failed to fetch documents')
        }

        const data = await response.json()
        setDocuments(data.documents || [])
        setError(null)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error')
        setDocuments([])
      } finally {
        setLoading(false)
      }
    }

    if (rut) {
      fetchDocuments()
    }
  }, [rut])

  const uploadDocument = async (
    file: File,
    docType: string,
    userEmail: string
  ): Promise<boolean> => {
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('docType', docType)
      formData.append('userEmail', userEmail)

      const response = await fetch(`/api/subcontractors/${rut}/documents`, {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        throw new Error('Upload failed')
      }

      // Refresh documents after upload
      const docResponse = await fetch(`/api/subcontractors/${rut}/documents`)
      const data = await docResponse.json()
      setDocuments(data.documents || [])

      return true
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed')
      return false
    }
  }

  return {
    documents,
    loading,
    error,
    uploadDocument,
    refetch: async () => {
      const response = await fetch(`/api/subcontractors/${rut}/documents`)
      const data = await response.json()
      setDocuments(data.documents || [])
    },
  }
}
