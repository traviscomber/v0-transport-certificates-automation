'use client'

import { useMemo, useState } from 'react'
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  FileText,
  AlertTriangle,
  Download,
  Search,
  SortAsc,
  Eye,
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
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
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState<'status' | 'name' | 'expiry'>('status')

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

  // Filter and sort documents
  const filteredDocs = useMemo(() => {
    let docs = selectedCategory ? documentsByCategory[selectedCategory] || [] : documents
    
    // Apply search filter
    if (searchTerm) {
      docs = docs.filter(doc => 
        doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doc.code.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Apply sorting
    const sorted = [...docs]
    if (sortBy === 'status') {
      const statusOrder = { expired: 0, pending: 1, missing: 2, validated: 3 }
      sorted.sort((a, b) => statusOrder[a.status as keyof typeof statusOrder] - statusOrder[b.status as keyof typeof statusOrder])
    } else if (sortBy === 'name') {
      sorted.sort((a, b) => a.name.localeCompare(b.name))
    } else if (sortBy === 'expiry') {
      sorted.sort((a, b) => (a.expiryDate || '').localeCompare(b.expiryDate || ''))
    }

    return sorted
  }, [selectedCategory, documents, documentsByCategory, searchTerm, sortBy])

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
      <div className="flex items-center justify-between pb-2 border-b">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Cumplimiento Documental</h1>
          <p className="text-sm text-muted-foreground mt-1">Gestiona y monitorea el estado de tus documentos</p>
        </div>
        <Button className="gap-2">
          <Download className="h-4 w-4" />
          Reporte
        </Button>
      </div>

      {/* Key Metrics - Responsive Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Compliance Score - Featured */}
        <Card className="lg:col-span-2 bg-gradient-to-br from-green-50 to-transparent border-green-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-green-700">Cumplimiento</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end justify-between">
              <div>
                <div className="text-4xl font-bold text-green-600">{metrics.compliance}%</div>
                <p className="text-xs text-muted-foreground mt-2">
                  {metrics.validated} de {metrics.total} documentos validados
                </p>
              </div>
              <CheckCircle2 className="h-12 w-12 text-green-200" />
            </div>
          </CardContent>
        </Card>

        {/* Status Summary Cards */}
        <Card className="border-yellow-200 bg-gradient-to-br from-yellow-50 to-transparent">
          <CardHeader className="pb-3">
            <CardTitle className="text-xs font-medium text-yellow-700 uppercase">Pendientes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{metrics.pending}</div>
            <p className="text-xs text-muted-foreground mt-1">requieren atención</p>
          </CardContent>
        </Card>

        <Card className="border-red-200 bg-gradient-to-br from-red-50 to-transparent">
          <CardHeader className="pb-3">
            <CardTitle className="text-xs font-medium text-red-700 uppercase">Vencidos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{metrics.expired}</div>
            <p className="text-xs text-muted-foreground mt-1">acción urgente</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters & Search Bar */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base mb-4">Buscar y Filtrar</CardTitle>
          <div className="flex flex-col gap-3 md:flex-row md:items-center">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nombre o código..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 bg-background"
              />
            </div>

            {/* Sort Dropdown */}
            <Select value={sortBy} onValueChange={(v) => setSortBy(v as any)}>
              <SelectTrigger className="w-full md:w-48">
                <SortAsc className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Ordenar por..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="status">Por Estado (Urgencia)</SelectItem>
                <SelectItem value="name">Por Nombre (A-Z)</SelectItem>
                <SelectItem value="expiry">Por Vencimiento</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>

        {/* Category Pills - Horizontal Scrollable */}
        <CardContent className="pt-0">
          <div className="flex gap-2 overflow-x-auto pb-2 -mx-6 px-6 md:mx-0 md:px-0">
            <Button
              variant={selectedCategory === null ? 'default' : 'outline'}
              onClick={() => setSelectedCategory(null)}
              size="sm"
              className="whitespace-nowrap"
            >
              Todos ({metrics.total})
            </Button>
            {Object.entries(DOCUMENT_CATEGORIES).map(([key, cat]) => {
              const categoryKey = key as keyof typeof DOCUMENT_CATEGORIES
              const count = documentsByCategory[categoryKey]?.length || 0
              return (
                <Button
                  key={key}
                  variant={selectedCategory === categoryKey ? 'default' : 'outline'}
                  onClick={() => setSelectedCategory(categoryKey)}
                  size="sm"
                  className="whitespace-nowrap"
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
            Documentos
            {selectedCategory && (
              <Badge variant="outline">{DOCUMENT_CATEGORIES[selectedCategory]?.name}</Badge>
            )}
          </CardTitle>
          <CardDescription>
            {filteredDocs.length > 0 ? (
              <>Mostrando {filteredDocs.length} de {documents.length} documentos</>
            ) : (
              <>No hay documentos que coincidan</>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent" />
            </div>
          ) : filteredDocs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 rounded-lg bg-muted/30">
              <AlertCircle className="h-10 w-10 text-muted-foreground mb-3" />
              <p className="text-muted-foreground font-medium">No hay documentos</p>
              <p className="text-sm text-muted-foreground">Intenta con otros filtros</p>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredDocs.map((doc) => (
                <div
                  key={doc.code}
                  className={cn(
                    'border rounded-lg p-4 flex items-center justify-between hover:shadow-sm transition-shadow group',
                    getStatusColor(doc.status)
                  )}
                >
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <div className="flex-shrink-0">
                      {getStatusIcon(doc.status)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{doc.name}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <p className="text-xs text-muted-foreground font-mono">{doc.code}</p>
                        {doc.expiryDate && (
                          <p className="text-xs text-muted-foreground">Vence: {doc.expiryDate}</p>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Badge variant="secondary" className="text-xs">
                      {getStatusLabel(doc.status)}
                    </Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
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
