'use client'

import { useState, useMemo } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { FileText, ExternalLink, CheckCircle, XCircle, Clock, Search, Filter } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

interface Document {
  id: string
  original_filename: string
  conductor_id: string
  validation_status: 'approved' | 'rejected' | 'pending'
  file_url?: string
  created_at: string
  conductores: {
    id: string
    nombres: string
    apellido_paterno: string
    rut: string
  } | {
    id: string
    nombres: string
    apellido_paterno: string
    rut: string
  }[] | null
}

interface DocumentosClientProps {
  documents: Document[]
  selectedEjecutiva?: {
    id: string
    nombres: string
    apellido_paterno: string
  }
}

export function DocumentosClient({ documents, selectedEjecutiva }: DocumentosClientProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'approved' | 'rejected' | 'pending'>('all')

  // Helper to get conductor data from either object or array
  const getConductor = (conductores: any) => {
    if (Array.isArray(conductores) && conductores.length > 0) {
      return conductores[0]
    }
    return conductores || {}
  }

  // Filter documents based on search and status
  const filteredDocuments = useMemo(() => {
    return documents.filter(doc => {
      const conductor = getConductor(doc.conductores)
      const filename = doc.original_filename || ''
      const conductorName = `${conductor.nombres || ''} ${conductor.apellido_paterno || ''}`
      
      const matchesSearch = 
        filename.toLowerCase().includes(searchQuery.toLowerCase()) ||
        conductorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (conductor.rut || '').includes(searchQuery)

      const matchesStatus = statusFilter === 'all' || doc.validation_status === statusFilter

      return matchesSearch && matchesStatus
    })
  }, [documents, searchQuery, statusFilter])

  // Calculate stats
  const stats = useMemo(() => ({
    total: documents.length,
    pending: documents.filter(d => d.validation_status === 'pending').length,
    approved: documents.filter(d => d.validation_status === 'approved').length,
    rejected: documents.filter(d => d.validation_status === 'rejected').length,
  }), [documents])

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      approved: 'Aprobado',
      rejected: 'Rechazado',
      pending: 'Pendiente',
    }
    return labels[status] || status
  }

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      approved: 'bg-green-100 text-green-700',
      rejected: 'bg-red-100 text-red-700',
      pending: 'bg-yellow-100 text-yellow-700',
    }
    return colors[status] || 'bg-gray-100 text-gray-700'
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="h-3 w-3" />
      case 'rejected':
        return <XCircle className="h-3 w-3" />
      case 'pending':
        return <Clock className="h-3 w-3" />
      default:
        return null
    }
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-sm text-muted-foreground">Total documentos</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
            <p className="text-sm text-muted-foreground">Pendientes</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-green-600">{stats.approved}</div>
            <p className="text-sm text-muted-foreground">Aprobados</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-red-600">{stats.rejected}</div>
            <p className="text-sm text-muted-foreground">Rechazados</p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4 flex-col sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Buscar por nombre, RUT o documento..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="rounded-md border bg-background px-3 py-2 text-sm"
            >
              <option value="all">Todos los estados</option>
              <option value="pending">Pendientes</option>
              <option value="approved">Aprobados</option>
              <option value="rejected">Rechazados</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Documents Table */}
      {filteredDocuments.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <FileText className="h-16 w-16 text-muted-foreground/50 mb-4" />
            <h3 className="text-lg font-semibold mb-2">No hay documentos</h3>
            <p className="text-muted-foreground text-center">
              {searchQuery || statusFilter !== 'all' 
                ? 'No se encontraron documentos que coincidan con tu búsqueda'
                : selectedEjecutiva 
                ? `No hay documentos para ${selectedEjecutiva.nombres}`
                : 'No hay documentos cargados'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b bg-muted/50">
                  <tr>
                    <th className="text-left p-4 font-medium">Documento</th>
                    <th className="text-left p-4 font-medium">Conductor</th>
                    <th className="text-left p-4 font-medium">RUT</th>
                    <th className="text-left p-4 font-medium">Estado</th>
                    <th className="text-left p-4 font-medium">Fecha</th>
                    <th className="text-right p-4 font-medium">Acción</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredDocuments.map((doc) => (
                    <tr key={doc.id} className="border-b hover:bg-muted/50 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <FileText className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                          <span className="font-medium truncate max-w-[250px]">
                            {doc.original_filename || 'Sin nombre'}
                          </span>
                        </div>
                      </td>
                      <td className="p-4 text-sm">
                        {doc.conductores 
                          ? (() => {
                              const conductor = getConductor(doc.conductores)
                              return `${conductor.nombres || '-'} ${conductor.apellido_paterno || '-'}`
                            })()
                          : '-'}
                      </td>
                      <td className="p-4 text-sm text-muted-foreground">
                        {(() => {
                          const conductor = getConductor(doc.conductores)
                          return conductor.rut || '-'
                        })()}
                      </td>
                      <td className="p-4">
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(doc.validation_status)}`}>
                          {getStatusIcon(doc.validation_status)}
                          {getStatusLabel(doc.validation_status)}
                        </span>
                      </td>
                      <td className="p-4 text-sm text-muted-foreground">
                        {new Date(doc.created_at).toLocaleDateString('es-CL')}
                      </td>
                      <td className="p-4 text-right">
                        {doc.file_url ? (
                          <a 
                            href={doc.file_url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
                          >
                            Ver <ExternalLink className="h-3 w-3" />
                          </a>
                        ) : (
                          <span className="text-sm text-muted-foreground">-</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="border-t p-4 text-sm text-muted-foreground text-center">
              Mostrando {filteredDocuments.length} de {documents.length} documentos
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
