'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { HelpBox } from '@/components/ui/help-box'
import { DriverDocumentsManager } from '@/components/driver-documents-manager'
import { File, Download, Eye, Upload as UploadIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

interface Document {
  id: string
  file_name: string
  file_type: string
  file_size: number
  document_type: string
  document_type_id?: string
  upload_date: string
  public_url?: string
  storage_path?: string
  category?: string
  tags?: string[]
  document_number?: string
  expiry_date?: string
  provider?: string
  notes?: string
  estado?: 'pendiente' | 'aprobado' | 'rechazado'
}

export default function DriverDocumentPortal() {
  const router = useRouter()
  const [driverId, setDriverId] = useState<string>('')
  const [driverRut, setDriverRut] = useState<string>('')
  const [driverName, setDriverName] = useState<string>('')
  const [documents, setDocuments] = useState<Document[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [searchLoading, setSearchLoading] = useState(false)
  const [searchError, setSearchError] = useState<string>('')

  useEffect(() => {
    // Get current driver ID from auth or URL
    const getDriverInfo = async () => {
      try {
        // Check if there's a driver ID in URL params
        const params = new URLSearchParams(window.location.search)
        const urlId = params.get('id')
        const urlRut = params.get('rut')

        if (urlId) {
          await lookupDriver(urlId, 'id')
        } else if (urlRut) {
          await lookupDriver(urlRut, 'rut')
        }
        setLoading(false)
      } catch (error) {
        console.error('[v0] Error getting driver info:', error)
        setLoading(false)
      }
    }

    getDriverInfo()
  }, [])

  const lookupDriver = async (value: string, type: 'rut' | 'id') => {
    if (!value) return

    setSearchLoading(true)
    setSearchError('')

    try {
      const params = new URLSearchParams()
      if (type === 'rut') {
        params.append('rut', value)
      } else {
        params.append('id', value)
      }

      const response = await fetch(`/api/company/documents/driver-lookup?${params}`)

      if (response.ok) {
        const data = await response.json()
        setDriverId(data.id)
        setDriverRut(data.rut)
        setDriverName(data.nombre)
        setSearchError('')
      } else {
        const error = await response.json()
        setSearchError(error.error || 'Conductor no encontrado')
        setDriverId('')
      }
    } catch (error) {
      console.error('[v0] Error looking up driver:', error)
      setSearchError('Error al buscar el conductor')
    } finally {
      setSearchLoading(false)
    }
  }

  const handleSearchDriver = async () => {
    const searchValue = driverRut.trim()
    if (!searchValue) {
      setSearchError('Ingresa un RUT o ID de conductor')
      return
    }
    await lookupDriver(searchValue, searchValue.includes('-') ? 'rut' : 'id')
  }

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
        description="Sube y mantén actualizados tus documentos de cumplimiento Walmart. Los administradores podrán revisar y verificar tus documentos."
        tips={[
          "Selecciona el tipo de documento de la lista de 40+ documentos requeridos",
          "Filtra por categoría o busca rápidamente el documento que necesitas",
          "Ingresa metadatos: número de documento, fecha de vencimiento, proveedor",
          "Sube fotos o documentos claros - máximo 50MB por archivo",
          "Tus documentos están protegidos y accesibles solo para administradores"
        ]}
      />

      {/* Driver ID Input (for demo) */}
      {!driverId ? (
        <Card className="border-orange-500/50 bg-orange-50/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              🔍 Buscar tu Perfil de Conductor
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                RUT o ID de Conductor
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Ej: 12345678-9 o UUID..."
                  value={driverRut}
                  onChange={(e) => {
                    setDriverRut(e.target.value)
                    setSearchError('')
                  }}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') handleSearchDriver()
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  disabled={searchLoading}
                />
                <Button
                  onClick={handleSearchDriver}
                  disabled={searchLoading}
                  className="bg-orange-600 hover:bg-orange-700"
                >
                  {searchLoading ? 'Buscando...' : 'Buscar'}
                </Button>
              </div>
              {searchError && (
                <p className="mt-2 text-sm text-red-600 font-medium">❌ {searchError}</p>
              )}
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded p-3">
              <p className="text-xs text-blue-900">
                <strong>💡 Tip:</strong> Para testing, puedes usar cualquier RUT de los conductores en el sistema.
                Ejemplos: 18012757-7, 10907750-K, 12879880-3, 16181677-9, 12481902-4
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-green-500/50 bg-green-50/50">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Conductor identificado:</p>
                <p className="text-lg font-bold text-gray-900">{driverName} ({driverRut})</p>
                <p className="text-xs text-gray-500 mt-1 font-mono">ID: {driverId}</p>
              </div>
              <Button
                onClick={() => {
                  setDriverId('')
                  setDriverRut('')
                  setDriverName('')
                  setDocuments([])
                }}
                variant="outline"
                className="text-red-600"
              >
                Cambiar conductor
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {driverId && (
        <>
          {/* New Document Upload Manager */}
          <DriverDocumentsManager 
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
                    Comienza subiendo los documentos requeridos por Walmart
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {documents.map((doc) => (
                  <Card key={doc.id} className={doc.estado === 'rechazado' ? 'border-red-300 bg-red-50/30' : ''}>
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-start gap-3">
                            <File className="h-8 w-8 text-gray-400 flex-shrink-0 mt-1" />
                            <div className="flex-1 min-w-0">
                              <h3 className={`font-semibold truncate ${
                                doc.estado === 'rechazado' ? 'text-red-600 line-through' : 'text-gray-900'
                              }`}>
                                {doc.file_name}
                              </h3>
                              <p className="text-sm text-gray-600">
                                {doc.document_type} {doc.document_type_id && `(${doc.document_type_id})`}
                              </p>
                              <p className="text-xs text-gray-500 mt-1">
                                {new Date(doc.upload_date).toLocaleDateString('es-ES')} • {formatFileSize(doc.file_size)}
                              </p>
                              
                              {/* Metadatos */}
                              <div className="grid grid-cols-2 gap-2 mt-3 text-xs">
                                {doc.document_number && (
                                  <div>
                                    <p className="text-gray-600">Número:</p>
                                    <p className="font-mono text-gray-900">{doc.document_number}</p>
                                  </div>
                                )}
                                {doc.expiry_date && (
                                  <div>
                                    <p className="text-gray-600">Vencimiento:</p>
                                    <p className="font-mono text-gray-900">{new Date(doc.expiry_date).toLocaleDateString('es-ES')}</p>
                                  </div>
                                )}
                                {doc.provider && (
                                  <div>
                                    <p className="text-gray-600">Emisor:</p>
                                    <p className="font-mono text-gray-900">{doc.provider}</p>
                                  </div>
                                )}
                              </div>

                              {/* Tags */}
                              {doc.tags && doc.tags.length > 0 && (
                                <div className="flex flex-wrap gap-1 mt-2">
                                  {doc.tags.map((tag) => (
                                    <Badge key={tag} variant="secondary" className="text-xs">
                                      {tag}
                                    </Badge>
                                  ))}
                                </div>
                              )}

                              {/* Estado */}
                              {doc.estado && (
                                <div className="mt-2">
                                  <Badge className={
                                    doc.estado === 'aprobado' ? 'bg-green-600' :
                                    doc.estado === 'rechazado' ? 'bg-red-600' :
                                    'bg-yellow-600'
                                  }>
                                    {doc.estado === 'aprobado' && '✓ Aprobado'}
                                    {doc.estado === 'rechazado' && '✗ Rechazado'}
                                    {doc.estado === 'pendiente' && '⏳ Pendiente'}
                                  </Badge>
                                </div>
                              )}

                              {/* Notas */}
                              {doc.notes && (
                                <div className="mt-3 p-2 bg-blue-50 rounded text-xs text-blue-900 border border-blue-200">
                                  <p className="font-semibold">Notas:</p>
                                  <p>{doc.notes}</p>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-2 flex-shrink-0">
                          {doc.public_url && (
                            <>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => window.open(doc.public_url, '_blank')}
                                title="Ver documento"
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => window.open(doc.public_url, '_blank')}
                                title="Descargar"
                              >
                                <Download className="h-4 w-4" />
                              </Button>
                            </>
                          )}
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
