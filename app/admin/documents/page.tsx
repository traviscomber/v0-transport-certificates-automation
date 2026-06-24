'use client'

import { useState, useEffect } from 'react'
import { useDocumentManagement } from '@/hooks/use-document-management'
import { DocumentManagementPanel } from '@/components/admin/document-management-panel'
import { DocumentAlertsWidget } from '@/components/admin/document-alerts-widget'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

interface Document {
  id: string
  file_name: string
  document_type: string
  custom_code?: string
  expiration_date?: string
  status?: string
  upload_date: string
  driver_rut?: string
}

export default function DocumentManagementPage() {
  const { getAlerts } = useDocumentManagement()
  const [searchRut, setSearchRut] = useState('')
  const [documents, setDocuments] = useState<Document[]>([])
  const [selectedDoc, setSelectedDoc] = useState<Document | null>(null)
  const [loading, setLoading] = useState(false)

  const searchDocuments = async (rut: string) => {
    if (!rut) return

    setLoading(true)
    try {
      // Aquí iríamos a buscar documentos del RUT
      // Por ahora simulamos que cargamos
    } catch (error) {
      // Error handling
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold">Gestión de Documentos</h1>
        <p className="text-gray-600">Cambiar estados, renombrar y gestionar vencimientos de documentos de conductores</p>
      </div>

      <Tabs defaultValue="alerts" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="alerts">Alertas</TabsTrigger>
          <TabsTrigger value="buscar">Buscar Documentos</TabsTrigger>
          <TabsTrigger value="gestionar">Gestionar</TabsTrigger>
        </TabsList>

        {/* Tab de Alertas */}
        <TabsContent value="alerts">
          <Card>
            <CardHeader>
              <CardTitle>Alertas de Documentos</CardTitle>
              <CardDescription>
                Documentos vencidos o próximos a vencer
              </CardDescription>
            </CardHeader>
            <CardContent>
              <DocumentAlertsWidget daysThreshold={30} />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab de Búsqueda */}
        <TabsContent value="buscar">
          <Card>
            <CardHeader>
              <CardTitle>Buscar Documentos</CardTitle>
              <CardDescription>
                Busca documentos por RUT del conductor
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="Ingresa RUT del conductor (ej: 18012757-7)"
                  value={searchRut}
                  onChange={(e) => setSearchRut(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      searchDocuments(searchRut)
                    }
                  }}
                />
                <Button onClick={() => searchDocuments(searchRut)} disabled={loading}>
                  {loading ? 'Buscando...' : 'Buscar'}
                </Button>
              </div>

              {documents.length > 0 && (
                <div className="space-y-3">
                  {documents.map((doc) => (
                    <div
                      key={doc.id}
                      onClick={() => setSelectedDoc(doc)}
                      className="p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="font-semibold">{doc.file_name}</div>
                          <div className="text-sm text-gray-600">{doc.document_type}</div>
                          {doc.custom_code && (
                            <div className="text-xs text-gray-500 font-mono mt-1">{doc.custom_code}</div>
                          )}
                        </div>
                        <Badge variant={doc.status === 'approved' ? 'default' : 'secondary'}>
                          {doc.status || 'pendiente'}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab de Gestión */}
        <TabsContent value="gestionar">
          {selectedDoc ? (
            <DocumentManagementPanel
              document={selectedDoc}
              companyCode="TRANS001"
              driverRut={selectedDoc.driver_rut || searchRut}
              documentType="conductor"
              onUpdate={() => {
                // Recargar datos
                searchDocuments(searchRut)
              }}
            />
          ) : (
            <Card>
              <CardContent className="pt-6 text-center text-gray-500">
                Selecciona un documento para gestionar
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
