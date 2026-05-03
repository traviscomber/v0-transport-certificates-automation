'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Plus, Search, Filter, AlertCircle, CheckCircle, Clock, User } from 'lucide-react'
import Link from 'next/link'

interface Applicant {
  id: string
  firstName: string
  lastName: string
  email: string
  rut: string
  licenseType: string
  status: 'new' | 'background_check_pending' | 'background_check_passed' | 'background_check_failed' | 'documents_pending' | 'documents_submitted' | 'approved' | 'rejected'
  backgroundCheckStatus?: 'pending' | 'passed' | 'failed'
  createdAt: string
  companyName: string
}

function getStatusBadgeVariant(status: string) {
  switch (status) {
    case 'new':
      return 'outline'
    case 'background_check_pending':
      return 'secondary'
    case 'background_check_passed':
      return 'default'
    case 'background_check_failed':
      return 'destructive'
    case 'documents_pending':
      return 'secondary'
    case 'documents_submitted':
      return 'default'
    case 'approved':
      return 'default'
    case 'rejected':
      return 'destructive'
    default:
      return 'outline'
  }
}

function getStatusLabel(status: string) {
  const labels: Record<string, string> = {
    new: 'Nuevo',
    background_check_pending: 'Chequeo Pendiente',
    background_check_passed: 'Chequeo Aprobado',
    background_check_failed: 'Chequeo Fallido',
    documents_pending: 'Documentos Pendientes',
    documents_submitted: 'Documentos Enviados',
    approved: 'Aprobado',
    rejected: 'Rechazado',
  }
  return labels[status] || status
}

function getStatusIcon(status: string) {
  switch (status) {
    case 'approved':
      return <CheckCircle className="h-4 w-4 text-green-600" />
    case 'rejected':
    case 'background_check_failed':
      return <AlertCircle className="h-4 w-4 text-red-600" />
    case 'background_check_pending':
    case 'documents_pending':
      return <Clock className="h-4 w-4 text-yellow-600" />
    default:
      return <User className="h-4 w-4 text-blue-600" />
  }
}

export function ApplicantsListClient({ applicants }: { applicants: Applicant[] }) {
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState<string>('all')

  const filteredApplicants = applicants.filter((applicant) => {
    const matchesSearch =
      applicant.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      applicant.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      applicant.rut.includes(searchTerm) ||
      applicant.email.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = filterStatus === 'all' || applicant.status === filterStatus

    return matchesSearch && matchesStatus
  })

  const statusCounts = {
    all: applicants.length,
    new: applicants.filter((a) => a.status === 'new').length,
    background_check_pending: applicants.filter((a) => a.status === 'background_check_pending').length,
    documents_submitted: applicants.filter((a) => a.status === 'documents_submitted').length,
    approved: applicants.filter((a) => a.status === 'approved').length,
    rejected: applicants.filter((a) => a.status === 'rejected').length,
  }

  return (
    <div className="space-y-6">
      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{statusCounts.all}</div>
            <p className="text-xs text-muted-foreground">Total Postulantes</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-blue-600">{statusCounts.new}</div>
            <p className="text-xs text-muted-foreground">Nuevos</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-yellow-600">{statusCounts.background_check_pending}</div>
            <p className="text-xs text-muted-foreground">Chequeo Pendiente</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-orange-600">{statusCounts.documents_submitted}</div>
            <p className="text-xs text-muted-foreground">Docs Enviados</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-600">{statusCounts.approved}</div>
            <p className="text-xs text-muted-foreground">Aprobados</p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-6 space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar por nombre, RUT o email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="rounded-md border bg-background px-3 py-2 text-sm"
            >
              <option value="all">Todos los estados</option>
              <option value="new">Nuevos</option>
              <option value="background_check_pending">Chequeo Pendiente</option>
              <option value="documents_submitted">Documentos Enviados</option>
              <option value="approved">Aprobados</option>
              <option value="rejected">Rechazados</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Applicants List */}
      {filteredApplicants.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <User className="h-16 w-16 text-muted-foreground/50 mb-4" />
            <h3 className="text-lg font-semibold mb-2">No hay postulantes</h3>
            <p className="text-muted-foreground text-center mb-4">
              {searchTerm || filterStatus !== 'all'
                ? 'No coinciden con los filtros seleccionados'
                : 'Comienza por registrar un nuevo postulante'}
            </p>
            <Link href="/admin/postulantes/nuevo">
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Nuevo Postulante
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {filteredApplicants.map((applicant) => (
            <Card key={applicant.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                        <User className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold">
                          {applicant.firstName} {applicant.lastName}
                        </h3>
                        <p className="text-sm text-muted-foreground font-mono">{applicant.rut}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-3 text-sm">
                      <div>
                        <p className="text-xs text-muted-foreground">Email</p>
                        <p className="font-medium">{applicant.email}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Licencia</p>
                        <p className="font-medium">{applicant.licenseType}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Empresa</p>
                        <p className="font-medium">{applicant.companyName}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Fecha Registro</p>
                        <p className="font-medium">
                          {new Date(applicant.createdAt).toLocaleDateString('es-CL')}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-3">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(applicant.status)}
                      <Badge variant={getStatusBadgeVariant(applicant.status)}>
                        {getStatusLabel(applicant.status)}
                      </Badge>
                    </div>
                    <Link href={`/admin/postulantes/${applicant.id}`}>
                      <Button variant="outline" size="sm">
                        Ver Detalles
                      </Button>
                    </Link>
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
