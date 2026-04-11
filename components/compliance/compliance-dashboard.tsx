'use client'

import { useMemo, useState } from 'react'
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  FileText,
  TrendingUp,
  AlertTriangle,
  Download,
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { DOCUMENT_CATEGORIES, getDocumentsByCategory } from '@/lib/document-types'
import { cn } from '@/lib/utils'

interface DocumentStatus {
  code: string
  name: string
  status: 'validated' | 'pending' | 'expired' | 'missing'
  confidence?: number
  expiryDate?: string
  category: string
}

interface ComplianceDashboardProps {
  transporterId?: string
  documents?: DocumentStatus[]
  loading?: boolean
}

export function ComplianceDashboard({
  documents = [],
  loading = false,
}: ComplianceDashboardProps) {
  const [selectedCategory, setSelectedCategory] = useState<keyof typeof DOCUMENT_CATEGORIES | null>(null)

  // Calculate compliance metrics
  const metrics = useMemo(() => {
    if (!documents.length) return { total: 0, validated: 0, pending: 0, expired: 0, compliance: 0 }

    const total = documents.length
    const validated = documents.filter((d) => d.status === 'validated').length
    const pending = documents.filter((d) => d.status === 'pending').length
    const expired = documents.filter((d) => d.status === 'expired').length

    return {
      total,
      validated,
      pending,
      expired,
      compliance: total > 0 ? Math.round((validated / total) * 100) : 0,
    }
  }, [documents])

  // Group documents by category
  const documentsByCategory = useMemo(() => {
    return documents.reduce(
      (acc, doc) => {
        if (!acc[doc.category]) {
          acc[doc.category] = []
        }
        acc[doc.category].push(doc)
        return acc
      },
      {} as Record<string, DocumentStatus[]>
    )
  }, [documents])

  // Filter documents by selected category
  const filteredDocs = selectedCategory ? documentsByCategory[selectedCategory] || [] : documents

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'validated':
        return 'bg-green-50 border-green-200'
      case 'pending':
        return 'bg-yellow-50 border-yellow-200'
      case 'expired':
        return 'bg-red-50 border-red-200'
      case 'missing':
        return 'bg-gray-50 border-gray-200'
      default:
        return 'bg-white border-gray-200'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'validated':
        return <CheckCircle2 className="h-5 w-5 text-green-600" />
      case 'pending':
        return <Clock className="h-5 w-5 text-yellow-600" />
      case 'expired':
        return <AlertTriangle className="h-5 w-5 text-red-600" />
      case 'missing':
        return <AlertCircle className="h-5 w-5 text-gray-600" />
      default:
        return null
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'validated':
        return 'Validado'
      case 'pending':
        return 'Pendiente'
      case 'expired':
        return 'Vencido'
      case 'missing':
        return 'Faltante'
      default:
        return status
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Cumplimiento Documental</h1>
          <p className="text-muted-foreground">Estado actual de tus documentos para Walmart Chile</p>
        </div>
        <Button>
          <Download className="mr-2 h-4 w-4" />
          Descargar Reporte
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-5">
        {/* Compliance Score */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Compliance Score</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">{metrics.compliance}%</div>
            <p className="text-xs text-muted-foreground mt-2">
              {metrics.validated} de {metrics.total} validados
            </p>
          </CardContent>
        </Card>

        {/* Total Documents */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total Documentos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{metrics.total}</div>
            <p className="text-xs text-muted-foreground mt-2">tipos requeridos</p>
          </CardContent>
        </Card>

        {/* Validados */}
        <Card className="border-green-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-green-700">Validados</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">{metrics.validated}</div>
            <div className="h-2 bg-gray-200 rounded-full mt-3 overflow-hidden">
              <div
                className="bg-green-600 h-full"
                style={{ width: `${metrics.total > 0 ? (metrics.validated / metrics.total) * 100 : 0}%` }}
              />
            </div>
          </CardContent>
        </Card>

        {/* Pendientes */}
        <Card className="border-yellow-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-yellow-700">Pendientes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-yellow-600">{metrics.pending}</div>
            <div className="h-2 bg-gray-200 rounded-full mt-3 overflow-hidden">
              <div
                className="bg-yellow-600 h-full"
                style={{ width: `${metrics.total > 0 ? (metrics.pending / metrics.total) * 100 : 0}%` }}
              />
            </div>
          </CardContent>
        </Card>

        {/* Vencidos */}
        <Card className="border-red-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-red-700">Vencidos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-600">{metrics.expired}</div>
            <div className="h-2 bg-gray-200 rounded-full mt-3 overflow-hidden">
              <div
                className="bg-red-600 h-full"
                style={{ width: `${metrics.total > 0 ? (metrics.expired / metrics.total) * 100 : 0}%` }}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Category Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Categorías</CardTitle>
          <CardDescription>Filtra por tipo de documento</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-2 md:grid-cols-6">
            <Button
              variant={selectedCategory === null ? 'default' : 'outline'}
              onClick={() => setSelectedCategory(null)}
              size="sm"
              className="w-full"
            >
              Todos ({metrics.total})
            </Button>
            {Object.entries(DOCUMENT_CATEGORIES).map(([key, cat]) => {
              const count = documentsByCategory[key]?.length || 0
              return (
                <Button
                  key={key}
                  variant={selectedCategory === key ? 'default' : 'outline'}
                  onClick={() => setSelectedCategory(key)}
                  size="sm"
                  className="w-full"
                >
                  {cat.name} ({count})
                </Button>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Documents List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Documentos {selectedCategory && `- ${DOCUMENT_CATEGORIES[selectedCategory]?.name}`}
          </CardTitle>
          <CardDescription>
            {filteredDocs.length} documento{filteredDocs.length !== 1 ? 's' : ''} mostrado{filteredDocs.length !== 1 ? 's' : ''}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            </div>
          ) : filteredDocs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8">
              <AlertCircle className="h-12 w-12 text-muted-foreground mb-2" />
              <p className="text-muted-foreground">No hay documentos para mostrar</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredDocs.map((doc) => (
                <div
                  key={doc.code}
                  className={cn('border rounded-lg p-4 flex items-center justify-between', getStatusColor(doc.status))}
                >
                  <div className="flex items-center gap-3 flex-1">
                    {getStatusIcon(doc.status)}
                    <div className="flex-1">
                      <p className="font-medium">{doc.name}</p>
                      <p className="text-xs text-muted-foreground">{doc.code}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    {doc.confidence && (
                      <div className="text-sm">
                        <p className="text-muted-foreground">Confianza</p>
                        <p className="font-semibold">{(doc.confidence * 100).toFixed(0)}%</p>
                      </div>
                    )}

                    {doc.expiryDate && (
                      <div className="text-sm">
                        <p className="text-muted-foreground">Vencimiento</p>
                        <p className="font-semibold">{doc.expiryDate}</p>
                      </div>
                    )}

                    <Badge
                      variant={doc.status === 'validated' ? 'default' : 'secondary'}
                      className={cn({
                        'bg-green-100 text-green-800': doc.status === 'validated',
                        'bg-yellow-100 text-yellow-800': doc.status === 'pending',
                        'bg-red-100 text-red-800': doc.status === 'expired',
                        'bg-gray-100 text-gray-800': doc.status === 'missing',
                      })}
                    >
                      {getStatusLabel(doc.status)}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Alerts Section */}
      {metrics.expired > 0 && (
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="text-red-700 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Documentos Vencidos
            </CardTitle>
            <CardDescription className="text-red-600">
              Tienes {metrics.expired} documento{metrics.expired !== 1 ? 's' : ''} vencido{metrics.expired !== 1 ? 's' : ''} que requiere{metrics.expired !== 1 ? 'n' : ''} atención inmediata
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {documents
                .filter((d) => d.status === 'expired')
                .map((doc) => (
                  <div key={doc.code} className="flex items-center justify-between p-2 bg-white rounded">
                    <p className="text-sm font-medium">{doc.name}</p>
                    <Button size="sm" variant="outline">
                      Renovar
                    </Button>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
