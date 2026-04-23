'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { HelpBox } from '@/components/ui/help-box'
import { AdminDocumentUpload } from '@/components/admin/admin-document-upload'
import { FileText, File, Download, Trash2, Eye } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface Document {
  id: string
  file_name: string
  file_type: string
  file_size: number
  document_type: string
  driver_id?: string
  subcontractor_id?: string
  upload_date: string
  public_url?: string
}

export default function DocumentosPage() {
  const [documents, setDocuments] = useState<Document[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'all' | 'drivers' | 'subcontractors'>('all')
  const [searchQuery, setSearchQuery] = useState('')

  const fetchDocuments = async () => {
    try {
      const response = await fetch('/api/company/documents')
      if (response.ok) {
        const data = await response.json()
        setDocuments(data)
      }
    } catch (error) {
      console.error('[v0] Error fetching documents:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDocuments()
  }, [])

  const filteredDocuments = documents.filter((doc) => {
    if (activeTab === 'drivers' && !doc.driver_id) return false
    if (activeTab === 'subcontractors' && !doc.subcontractor_id) return false
    if (searchQuery) {
      return doc.file_name.toLowerCase().includes(searchQuery.toLowerCase())
    }
    return true
  })

  const handleDelete = async (docId: string) => {
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
        <h1 className="text-3xl font-bold tracking-tight">Gestión de Documentos</h1>
        <p className="text-muted-foreground">
          Administra y organiza documentos de conductores y subcontratistas
        </p>
      </div>

      <HelpBox
        variant="info"
        title="Gestión de Documentos"
        description="Sistema centralizado para almacenar, organizar y gestionar documentos de conductores y subcontratistas. Todos los archivos se guardan en Supabase Storage."
        tips={[
          "Los conductores pueden subir sus propios documentos (licencia, seguros, etc.)",
          "Los subcontratistas pueden subir contratos y certificaciones",
          "Los administradores pueden organizar y verificar documentos",
          "Busca por nombre de archivo para encontrar rápidamente",
          "Descarga o elimina documentos según sea necesario"
        ]}
      />

      {/* Admin Upload */}
      <AdminDocumentUpload onUploadSuccess={() => fetchDocuments()} />

      {/* Tabs and Search */}
      <div className="space-y-4">
        <div className="flex gap-2 border-b">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-4 py-2 font-medium ${
              activeTab === 'all'
                ? 'border-b-2 border-orange-500 text-orange-500'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Todos ({documents.length})
          </button>
          <button
            onClick={() => setActiveTab('drivers')}
            className={`px-4 py-2 font-medium ${
              activeTab === 'drivers'
                ? 'border-b-2 border-orange-500 text-orange-500'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Conductores ({documents.filter((d) => d.driver_id).length})
          </button>
          <button
            onClick={() => setActiveTab('subcontractors')}
            className={`px-4 py-2 font-medium ${
              activeTab === 'subcontractors'
                ? 'border-b-2 border-orange-500 text-orange-500'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Subcontratistas ({documents.filter((d) => d.subcontractor_id).length})
          </button>
        </div>

        {/* Search */}
        <input
          type="text"
          placeholder="Buscar documentos..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
        />
      </div>

      {/* Documents List */}
      {loading ? (
        <div className="text-center py-8">
          <p className="text-gray-500">Cargando documentos...</p>
        </div>
      ) : filteredDocuments.length === 0 ? (
        <Card>
          <CardContent className="pt-6 text-center py-8">
            <FileText className="mx-auto h-12 w-12 text-gray-400 mb-2" />
            <p className="text-gray-500">No hay documentos disponibles</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {filteredDocuments.map((doc) => (
            <Card key={doc.id}>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div className="flex gap-4">
                    <File className="h-8 w-8 text-gray-400 flex-shrink-0 mt-1" />
                    <div>
                      <h3 className="font-semibold text-gray-900">{doc.file_name}</h3>
                      <p className="text-sm text-gray-500">
                        {doc.document_type} • {formatFileSize(doc.file_size)} • {new Date(doc.upload_date).toLocaleDateString()}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        {doc.driver_id ? 'Conductor' : 'Subcontratista'} • ID: {(doc.driver_id || doc.subcontractor_id)?.slice(0, 8)}...
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
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => window.open(doc.public_url, '_blank')}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDelete(doc.id)}
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
  )
}
