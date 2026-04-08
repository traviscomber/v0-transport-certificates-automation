'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Loader2, Download, AlertCircle, CheckCircle2, Clock, 
  FileText, Building2, User, Truck, Shield, Package, FileCheck,
  XCircle, Upload
} from 'lucide-react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

interface DocumentType {
  id: string
  code: string
  name: string
  category: string
  description: string
  expiration_days: number | null
  required_fields: string[]
}

interface UploadedDocument {
  id: string
  document_type_id: string
  validation_status: string
  confidence_score: number
  expiration_date: string | null
  created_at: string
}

interface CategoryStats {
  total: number
  uploaded: number
  validated: number
  pending: number
  expired: number
  missing: number
}

const categoryIcons: Record<string, any> = {
  empresa: Building2,
  conductor: User,
  vehiculo: Truck,
  seguridad: Shield,
  operacional: Package,
  subcontratacion: FileCheck,
}

const categoryLabels: Record<string, string> = {
  empresa: 'Empresa',
  conductor: 'Conductor',
  vehiculo: 'Vehiculo',
  seguridad: 'Seguridad',
  operacional: 'Operacional',
  subcontratacion: 'Subcontratacion',
}

export default function ComplianceDashboardPage() {
  const [loading, setLoading] = useState(true)
  const [documentTypes, setDocumentTypes] = useState<DocumentType[]>([])
  const [uploadedDocs, setUploadedDocs] = useState<UploadedDocument[]>([])
  const [error, setError] = useState<string>('')
  const [activeCategory, setActiveCategory] = useState('all')

  const supabase = createClient()

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      
      // Fetch all document types
      const { data: types, error: typesError } = await supabase
        .from('document_types')
        .select('*')
        .eq('is_active', true)
        .order('category')
        .order('sort_order')

      if (typesError) throw typesError
      setDocumentTypes(types || [])

      // Fetch uploaded documents (for demo, we show all)
      const { data: docs, error: docsError } = await supabase
        .from('uploaded_documents')
        .select('*')
        .order('created_at', { ascending: false })

      if (docsError) throw docsError
      setUploadedDocs(docs || [])

    } catch (err) {
      console.error('Error fetching data:', err)
      setError('Error cargando datos')
    } finally {
      setLoading(false)
    }
  }

  // Calculate stats by category
  const getCategoryStats = (): Record<string, CategoryStats> => {
    const stats: Record<string, CategoryStats> = {}
    const categories = ['empresa', 'conductor', 'vehiculo', 'seguridad', 'operacional', 'subcontratacion']

    for (const category of categories) {
      const typesInCategory = documentTypes.filter(dt => dt.category === category)
      const uploadedInCategory = uploadedDocs.filter(ud => {
        const docType = documentTypes.find(dt => dt.id === ud.document_type_id)
        return docType?.category === category
      })

      const validated = uploadedInCategory.filter(ud => ud.validation_status === 'validated').length
      const pending = uploadedInCategory.filter(ud => ud.validation_status === 'pending').length
      const expired = uploadedInCategory.filter(ud => {
        if (!ud.expiration_date) return false
        return new Date(ud.expiration_date) < new Date()
      }).length

      stats[category] = {
        total: typesInCategory.length,
        uploaded: uploadedInCategory.length,
        validated,
        pending,
        expired,
        missing: typesInCategory.length - uploadedInCategory.length,
      }
    }

    return stats
  }

  const categoryStats = getCategoryStats()

  // Overall stats
  const totalTypes = documentTypes.length
  const totalUploaded = uploadedDocs.length
  const totalValidated = uploadedDocs.filter(d => d.validation_status === 'validated').length
  const totalPending = uploadedDocs.filter(d => d.validation_status === 'pending').length
  const totalExpired = uploadedDocs.filter(d => {
    if (!d.expiration_date) return false
    return new Date(d.expiration_date) < new Date()
  }).length
  const compliancePercent = totalTypes > 0 ? Math.round((totalValidated / totalTypes) * 100) : 0

  // Filter documents by category
  const filteredDocTypes = activeCategory === 'all' 
    ? documentTypes 
    : documentTypes.filter(dt => dt.category === activeCategory)

  // Get upload status for a document type
  const getDocStatus = (docTypeId: string) => {
    const uploaded = uploadedDocs.find(ud => ud.document_type_id === docTypeId)
    if (!uploaded) return 'missing'
    if (uploaded.expiration_date && new Date(uploaded.expiration_date) < new Date()) return 'expired'
    return uploaded.validation_status
  }

  const downloadReport = async () => {
    // Create CSV from data
    const rows = documentTypes.map(dt => {
      const status = getDocStatus(dt.id)
      const uploaded = uploadedDocs.find(ud => ud.document_type_id === dt.id)
      return {
        categoria: dt.category,
        documento: dt.name,
        codigo: dt.code,
        estado: status === 'missing' ? 'No subido' : 
                status === 'validated' ? 'Validado' :
                status === 'expired' ? 'Vencido' : 'Pendiente',
        confianza: uploaded ? `${Math.round(uploaded.confidence_score * 100)}%` : '-',
        vencimiento: uploaded?.expiration_date || '-',
      }
    })

    const headers = ['Categoria', 'Documento', 'Codigo', 'Estado', 'Confianza', 'Vencimiento']
    const csv = [
      headers.join(','),
      ...rows.map(r => Object.values(r).join(','))
    ].join('\n')

    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `reporte_compliance_${new Date().toISOString().split('T')[0]}.csv`
    link.click()
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
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex flex-col sm:flex-row justify-between items-start gap-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">Dashboard de Cumplimiento</h1>
            <p className="text-muted-foreground">Walmart Chile - Estado Documental Completo</p>
          </div>
          <div className="flex gap-2">
            <Link href="/walmart-ocr">
              <Button variant="outline" className="gap-2">
                <Upload className="h-4 w-4" />
                Subir Documento
              </Button>
            </Link>
            <Button onClick={downloadReport} className="gap-2">
              <Download className="h-4 w-4" />
              Descargar CSV
            </Button>
          </div>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* KPIs */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Cumplimiento
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{compliancePercent}%</div>
              <div className="w-full bg-muted rounded-full h-2 mt-2">
                <div 
                  className="bg-primary h-2 rounded-full transition-all" 
                  style={{ width: `${compliancePercent}%` }}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Documentos Requeridos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{totalTypes}</div>
              <p className="text-xs text-muted-foreground">tipos diferentes</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Validados
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">{totalValidated}</div>
              <p className="text-xs text-muted-foreground">de {totalUploaded} subidos</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Pendientes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-yellow-600">{totalPending}</div>
              <p className="text-xs text-muted-foreground">requieren revision</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Sin Subir
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-red-600">{totalTypes - totalUploaded}</div>
              <p className="text-xs text-muted-foreground">faltan por cargar</p>
            </CardContent>
          </Card>
        </div>

        {/* Category Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          {Object.entries(categoryStats).map(([category, stats]) => {
            const Icon = categoryIcons[category] || FileText
            const percent = stats.total > 0 ? Math.round((stats.validated / stats.total) * 100) : 0
            
            return (
              <Card 
                key={category} 
                className={`cursor-pointer transition-all hover:shadow-md ${
                  activeCategory === category ? 'ring-2 ring-primary' : ''
                }`}
                onClick={() => setActiveCategory(activeCategory === category ? 'all' : category)}
              >
                <CardContent className="pt-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Icon className="h-5 w-5 text-muted-foreground" />
                    <span className="font-medium text-sm capitalize">
                      {categoryLabels[category]}
                    </span>
                  </div>
                  <div className="text-2xl font-bold">{stats.validated}/{stats.total}</div>
                  <div className="w-full bg-muted rounded-full h-1.5 mt-2">
                    <div 
                      className={`h-1.5 rounded-full ${
                        percent >= 80 ? 'bg-green-500' : 
                        percent >= 50 ? 'bg-yellow-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                  <div className="flex gap-2 mt-2 text-xs">
                    {stats.missing > 0 && (
                      <Badge variant="outline" className="text-red-600 border-red-200">
                        {stats.missing} faltan
                      </Badge>
                    )}
                    {stats.pending > 0 && (
                      <Badge variant="outline" className="text-yellow-600 border-yellow-200">
                        {stats.pending} pend
                      </Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Document List */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>
                  {activeCategory === 'all' 
                    ? 'Todos los Documentos Requeridos' 
                    : `Documentos: ${categoryLabels[activeCategory]}`}
                </CardTitle>
                <CardDescription>
                  {filteredDocTypes.length} documentos 
                  {activeCategory !== 'all' && (
                    <Button 
                      variant="link" 
                      className="p-0 h-auto ml-2"
                      onClick={() => setActiveCategory('all')}
                    >
                      Ver todos
                    </Button>
                  )}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-2">Documento</th>
                    <th className="text-left py-3 px-2">Categoria</th>
                    <th className="text-left py-3 px-2">Estado</th>
                    <th className="text-left py-3 px-2">Vencimiento</th>
                    <th className="text-left py-3 px-2">Accion</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredDocTypes.map((docType) => {
                    const status = getDocStatus(docType.id)
                    const uploaded = uploadedDocs.find(ud => ud.document_type_id === docType.id)
                    
                    return (
                      <tr key={docType.id} className="border-b hover:bg-muted/50">
                        <td className="py-3 px-2">
                          <div className="flex items-center gap-2">
                            <FileText className="h-4 w-4 text-muted-foreground" />
                            <div>
                              <div className="font-medium">{docType.name}</div>
                              <div className="text-xs text-muted-foreground">{docType.code}</div>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-2">
                          <Badge variant="outline" className="capitalize">
                            {categoryLabels[docType.category]}
                          </Badge>
                        </td>
                        <td className="py-3 px-2">
                          {status === 'validated' && (
                            <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                              <CheckCircle2 className="h-3 w-3 mr-1" />
                              Validado
                            </Badge>
                          )}
                          {status === 'pending' && (
                            <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
                              <Clock className="h-3 w-3 mr-1" />
                              Pendiente
                            </Badge>
                          )}
                          {status === 'expired' && (
                            <Badge className="bg-orange-100 text-orange-800 hover:bg-orange-100">
                              <AlertCircle className="h-3 w-3 mr-1" />
                              Vencido
                            </Badge>
                          )}
                          {status === 'missing' && (
                            <Badge className="bg-red-100 text-red-800 hover:bg-red-100">
                              <XCircle className="h-3 w-3 mr-1" />
                              No subido
                            </Badge>
                          )}
                        </td>
                        <td className="py-3 px-2">
                          {docType.expiration_days ? (
                            <span className="text-muted-foreground">
                              Cada {docType.expiration_days} dias
                            </span>
                          ) : (
                            <span className="text-muted-foreground">Sin vencimiento</span>
                          )}
                        </td>
                        <td className="py-3 px-2">
                          {status === 'missing' || status === 'expired' ? (
                            <Link href={`/walmart-ocr?docType=${docType.code}`}>
                              <Button size="sm" variant="outline" className="gap-1">
                                <Upload className="h-3 w-3" />
                                Subir
                              </Button>
                            </Link>
                          ) : (
                            <Button size="sm" variant="ghost" disabled>
                              Cargado
                            </Button>
                          )}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
