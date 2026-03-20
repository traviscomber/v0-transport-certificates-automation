'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Loader2, Download, AlertCircle, CheckCircle2, Clock } from 'lucide-react'

export default function ComplianceDashboardPage() {
  const [transporterId] = useState('demo-user-001') // In production, get from auth
  const [loading, setLoading] = useState(true)
  const [compliance, setCompliance] = useState<any>(null)
  const [documents, setDocuments] = useState<any[]>([])
  const [error, setError] = useState<string>('')
  const [activeTab, setActiveTab] = useState('overview')

  useEffect(() => {
    fetchCompliance()
    fetchDocuments()
  }, [transporterId])

  const fetchCompliance = async () => {
    try {
      const response = await fetch(
        `/api/v2/compliance/status?transporterId=${transporterId}`
      )
      if (!response.ok) throw new Error('Error fetching compliance')
      const data = await response.json()
      setCompliance(data)
    } catch (err) {
      setError('Error loading compliance data')
      console.error(err)
    }
  }

  const fetchDocuments = async () => {
    try {
      const response = await fetch(
        `/api/v2/documents/list?transporterId=${transporterId}`
      )
      if (!response.ok) throw new Error('Error fetching documents')
      const data = await response.json()
      setDocuments(data.documents || [])
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const downloadReport = async () => {
    try {
      const response = await fetch(
        `/api/v2/compliance/report?transporterId=${transporterId}&format=csv`
      )
      if (!response.ok) throw new Error('Error downloading report')

      const blob = await response.blob()
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `reporte_compliance_${transporterId}.csv`
      link.click()
    } catch (err) {
      console.error('Error downloading report:', err)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8 flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold mb-2">Dashboard de Cumplimiento</h1>
            <p className="text-gray-600">Walmart Chile - Estado Documental</p>
          </div>
          <Button onClick={downloadReport} className="gap-2">
            <Download className="h-4 w-4" />
            Descargar Reporte
          </Button>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {compliance && (
          <>
            {/* KPIs */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">
                    Cumplimiento General
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {compliance.overall_compliance}%
                  </div>
                  <p className="text-xs text-gray-500">de requisitos</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">
                    Documentos Validados
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {compliance.summary.total_validated}
                  </div>
                  <p className="text-xs text-gray-500">
                    de {compliance.summary.total_uploaded}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">
                    Pendientes
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-yellow-600">
                    {compliance.summary.total_uploaded - compliance.summary.total_validated}
                  </div>
                  <p className="text-xs text-gray-500">requieren validación</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">
                    Documentos Vencidos
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-red-600">
                    {compliance.summary.total_expired}
                  </div>
                  <p className="text-xs text-gray-500">requieren renovación</p>
                </CardContent>
              </Card>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="overview">Resumen por Categoría</TabsTrigger>
                <TabsTrigger value="documents">Documentos</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-4">
                {Object.entries(compliance.by_category).map(
                  ([category, stats]: [string, any]) => (
                    <Card key={category}>
                      <CardHeader>
                        <CardTitle className="capitalize text-lg">
                          {category.replace(/_/g, ' ')}
                        </CardTitle>
                        <CardDescription>
                          {stats.validated_documents} de{' '}
                          {stats.total_types} documentos validados
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center gap-4">
                          <div className="flex-1">
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-green-600 h-2 rounded-full"
                                style={{
                                  width: `${stats.compliance_percentage}%`,
                                }}
                              />
                            </div>
                          </div>
                          <div className="text-right">
                            <Badge
                              variant={
                                stats.compliance_percentage >= 80
                                  ? 'default'
                                  : stats.compliance_percentage >= 50
                                  ? 'secondary'
                                  : 'destructive'
                              }
                            >
                              {stats.compliance_percentage}%
                            </Badge>
                          </div>
                        </div>

                        <div className="grid grid-cols-3 gap-2 text-sm">
                          <div>
                            <span className="text-gray-600">Subidos:</span>{' '}
                            <span className="font-semibold">
                              {stats.uploaded_documents}
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-600">Validados:</span>{' '}
                            <span className="font-semibold text-green-600">
                              {stats.validated_documents}
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-600">Vencidos:</span>{' '}
                            <span className="font-semibold text-red-600">
                              {stats.expired_documents}
                            </span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )
                )}
              </TabsContent>

              <TabsContent value="documents">
                <Card>
                  <CardHeader>
                    <CardTitle>Documentos Cargados</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {documents.length > 0 ? (
                        <div className="overflow-x-auto">
                          <table className="w-full text-sm">
                            <thead>
                              <tr className="border-b">
                                <th className="text-left py-2">Documento</th>
                                <th className="text-left py-2">Categoría</th>
                                <th className="text-left py-2">Estado</th>
                                <th className="text-left py-2">Confianza</th>
                                <th className="text-left py-2">Vencimiento</th>
                              </tr>
                            </thead>
                            <tbody>
                              {documents.map((doc) => (
                                <tr key={doc.id} className="border-b">
                                  <td className="py-3">
                                    {doc.document_types?.name}
                                  </td>
                                  <td className="py-3">
                                    <Badge variant="outline">
                                      {doc.document_types?.category}
                                    </Badge>
                                  </td>
                                  <td className="py-3">
                                    <Badge
                                      variant={
                                        doc.validation_status === 'validated'
                                          ? 'default'
                                          : 'secondary'
                                      }
                                    >
                                      {doc.validation_status === 'validated' ? (
                                        <CheckCircle2 className="h-3 w-3 mr-1 inline" />
                                      ) : (
                                        <Clock className="h-3 w-3 mr-1 inline" />
                                      )}
                                      {doc.validation_status}
                                    </Badge>
                                  </td>
                                  <td className="py-3">
                                    {(doc.confidence_score * 100).toFixed(0)}%
                                  </td>
                                  <td className="py-3">
                                    {doc.expiration_date
                                      ? new Date(
                                          doc.expiration_date
                                        ).toLocaleDateString('es-CL')
                                      : '-'}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      ) : (
                        <p className="text-gray-500">
                          No hay documentos cargados aún
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </>
        )}
      </div>
    </div>
  )
}
