'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { HelpBox } from '@/components/ui/help-box'
import { DriverDocumentUpload } from '@/components/admin/driver-document-upload'
import { File, Download, Trash2, Eye, Upload as UploadIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface Document {
  id: string
  file_name: string
  file_type: string
  file_size: number
  document_type: string
  upload_date: string
  public_url?: string
}

export default function DriverDocumentPortal() {
  const router = useRouter()
  const [driverId, setDriverId] = useState<string>('')
  const [documents, setDocuments] = useState<Document[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    // Get current driver ID from auth or URL
    const getDriverInfo = async () => {
      try {
        // This would normally get the current user's driver ID from auth
        // For now, we'll use a placeholder that gets updated when they upload
        setLoading(false)
      } catch (error) {
        console.error('[v0] Error getting driver info:', error)
        setLoading(false)
      }
    }

    getDriverInfo()
  }, [])

  const fetchDriverDocuments = async () => {
    if (!driverId) return

    try {
      const response = await fetch(`/api/company/documents/drivers/${driverId}`)
      if (response.ok) {
        const data = await response.json()
        setDocuments(data)
      }
    } catch (error) {
      console.error('[v0] Error fetching driver documents:', error)
    }
  }

  useEffect(() => {
    if (driverId) {
      fetchDriverDocuments()
    }
  }, [driverId])

  const handleDeleteDocument = async (docId: string) => {
    if (!confirm('¿Eliminar este documento?')) return

    try {
      const response = await fetch(`/api/company/documents/${docId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        setDocuments(documents.filter((d) => d.id !== docId))
      }
    } catch (error) {
      console.error('[v0] Error deleting document:', error)
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i]
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Mis Documentos</h1>
        <p className="text-muted-foreground">
          Sube y gestiona tus documentos personales (licencia, seguros, certificados, etc.)
        </p>
      </div>

      <HelpBox
        variant="info"
        title="Portal de Documentos del Conductor"
        description="Sube y mantén actualizados tus documentos. Los administradores podrán revisar y verificar tus documentos."
        tips={[
          "Sube documentos válidos: licencia, seguros, certificados de capacitación",
          "Formatos permitidos: PDF, JPG, PNG - Máximo 50MB",
          "Tus documentos están protegidos y accesibles solo para administradores",
          "Descarga tus documentos en cualquier momento"
        ]}
      />

      {/* Driver ID Input (for demo) */}
      <Card>
        <CardHeader>
          <CardTitle>Tu ID de Conductor</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <input
            type="text"
            placeholder="Ingresa tu ID de conductor (UUID)..."
            value={driverId}
            onChange={(e) => setDriverId(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
          <p className="text-sm text-gray-500">
            En producción, esto se obtendría automáticamente de tu cuenta
          </p>
        </CardContent>
      </Card>

      {driverId && (
        <>
          {/* Upload Section */}
          <DriverDocumentUpload
            driverId={driverId}
            onUploadSuccess={() => fetchDriverDocuments()}
          />

          {/* Documents List */}
          <div>
            <h2 className="text-xl font-bold mb-4">
              Mis Documentos ({documents.length})
            </h2>

            {documents.length === 0 ? (
              <Card>
                <CardContent className="pt-6 text-center py-8">
                  <UploadIcon className="mx-auto h-12 w-12 text-gray-400 mb-2" />
                  <p className="text-gray-500">Aún no has subido documentos</p>
                  <p className="text-sm text-gray-400 mt-1">
                    Comienza subiendo tu licencia de conducir
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {documents.map((doc) => (
                  <Card key={doc.id}>
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between">
                        <div className="flex gap-4">
                          <File className="h-8 w-8 text-gray-400 flex-shrink-0 mt-1" />
                          <div>
                            <h3 className="font-semibold text-gray-900">
                              {doc.file_name}
                            </h3>
                            <p className="text-sm text-gray-500">
                              {doc.document_type} • {formatFileSize(doc.file_size)} • {new Date(doc.upload_date).toLocaleDateString()}
                            </p>
                          </div>
                        </div>

                        <div className="flex gap-2">
                          {doc.public_url && (
                            <>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => window.open(doc.public_url, '_blank')}
                                title="Descargar"
                              >
                                <Download className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => window.open(doc.public_url, '_blank')}
                                title="Ver"
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                            </>
                          )}
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDeleteDocument(doc.id)}
                            title="Eliminar"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}
