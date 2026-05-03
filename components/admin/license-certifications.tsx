'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { AlertTriangle, CheckCircle, Clock, AlertCircle } from 'lucide-react'

interface License {
  id: string
  licenseType: string
  licenseNumber?: string
  issueDate?: string
  expiryDate: string
  lawChangeDate?: string
  status: 'active' | 'expired' | 'suspended' | 'pending_renewal'
}

interface Certification {
  id: string
  certType: string
  certName?: string
  issueDate?: string
  expiryDate: string
  issuer?: string
  status: 'active' | 'expired' | 'pending_renewal'
}

interface LicenseAndCertificationsProps {
  licenses?: License[]
  certifications?: Certification[]
}

function getLicenseStatusColor(status: string, expiryDate: string) {
  if (status === 'expired') return 'destructive'
  if (status === 'pending_renewal') return 'warning'
  
  const expDate = new Date(expiryDate)
  const today = new Date()
  const diffDays = Math.ceil((expDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
  
  if (diffDays <= 0) return 'destructive'
  if (diffDays <= 30) return 'warning'
  return 'success'
}

function getCertificationStatusIcon(status: string, expiryDate: string) {
  const expDate = new Date(expiryDate)
  const today = new Date()
  const diffDays = Math.ceil((expDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
  
  if (status === 'expired' || diffDays <= 0) {
    return <AlertTriangle className="h-4 w-4 text-red-600" />
  }
  if (diffDays <= 30) {
    return <Clock className="h-4 w-4 text-yellow-600" />
  }
  return <CheckCircle className="h-4 w-4 text-green-600" />
}

export function LicenseAndCertifications({
  licenses = [],
  certifications = [],
}: LicenseAndCertificationsProps) {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {/* Licenses Card */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            Licencias de Conducir
          </CardTitle>
        </CardHeader>
        <CardContent>
          {licenses.length === 0 ? (
            <p className="text-sm text-muted-foreground">No hay licencias registradas</p>
          ) : (
            <div className="space-y-3">
              {licenses.map((license) => {
                const statusColor = getLicenseStatusColor(license.status, license.expiryDate)
                const expDate = new Date(license.expiryDate)
                const today = new Date()
                const diffDays = Math.ceil(
                  (expDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
                )
                
                return (
                  <div key={license.id} className="flex items-start justify-between gap-3 p-3 bg-muted/50 rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-sm">
                          Clase {license.licenseType}
                        </p>
                        <Badge variant={statusColor === 'destructive' ? 'destructive' : 'secondary'} className="text-xs">
                          {statusColor === 'destructive' && 'VENCIDA'}
                          {statusColor === 'warning' && 'POR VENCER'}
                          {statusColor === 'success' && 'ACTIVA'}
                        </Badge>
                      </div>
                      {license.licenseNumber && (
                        <p className="text-xs text-muted-foreground font-mono">
                          Número: {license.licenseNumber}
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground mt-1">
                        Vence: {expDate.toLocaleDateString('es-CL')}
                        {diffDays <= 30 && diffDays > 0 && (
                          <span className="ml-2 text-yellow-600 font-semibold">
                            ({diffDays} días)
                          </span>
                        )}
                      </p>
                      {license.lawChangeDate && (
                        <p className="text-xs text-blue-600 mt-1">
                          Cambio de ley: {new Date(license.lawChangeDate).toLocaleDateString('es-CL')}
                          <span className="ml-1">(A2 → A5)</span>
                        </p>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Certifications Card */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <CheckCircle className="h-5 w-5" />
            Certificaciones Profesionales
          </CardTitle>
        </CardHeader>
        <CardContent>
          {certifications.length === 0 ? (
            <p className="text-sm text-muted-foreground">No hay certificaciones registradas</p>
          ) : (
            <div className="space-y-3">
              {certifications.map((cert) => {
                const expDate = new Date(cert.expiryDate)
                
                return (
                  <div key={cert.id} className="flex items-start justify-between gap-3 p-3 bg-muted/50 rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        {getCertificationStatusIcon(cert.status, cert.expiryDate)}
                        <p className="font-semibold text-sm">
                          {cert.certName || cert.certType}
                        </p>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        Vence: {expDate.toLocaleDateString('es-CL')}
                      </p>
                      {cert.issuer && (
                        <p className="text-xs text-muted-foreground">
                          Emisor: {cert.issuer}
                        </p>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
