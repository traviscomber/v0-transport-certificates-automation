"use client"

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { User, Mail, Phone, Building, MapPin, FileText, CheckCircle, Clock, XCircle, AlertTriangle } from "lucide-react"

interface Profile {
  id: string
  email: string
  full_name: string
  role: string
  company_name: string
  rut: string
  phone: string
  address: string
  city: string
  region: string
  is_active: boolean
}

interface Certificate {
  id: string
  driver_id: string
  certificate_type: string
  certificate_number: string
  issue_date: string
  expiry_date: string
  issuing_authority: string
  status: string
  file_url: string
  file_name: string
  validation_notes: string
  created_at: string
  profiles: {
    full_name: string
    email: string
  }
}

interface DriverDetailsModalProps {
  driver: Profile
  certificates: Certificate[]
  onClose: () => void
}

export function DriverDetailsModal({ driver, certificates, onClose }: DriverDetailsModalProps) {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "approved":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "pending":
        return <Clock className="h-4 w-4 text-yellow-500" />
      case "rejected":
        return <XCircle className="h-4 w-4 text-red-500" />
      case "expired":
        return <AlertTriangle className="h-4 w-4 text-red-500" />
      default:
        return <Clock className="h-4 w-4 text-gray-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
      case "pending":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
      case "rejected":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
      case "expired":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
    }
  }

  const getCertificateTypeLabel = (type: string) => {
    const labels = {
      f30: "Certificado F-30",
      license: "Licencia de Conducir",
      medical: "Certificado Médico",
      vehicle_registration: "Registro Vehicular",
      insurance: "Seguro",
    }
    return labels[type as keyof typeof labels] || type
  }

  const getStatusLabel = (status: string) => {
    const labels = {
      approved: "Aprobado",
      pending: "Pendiente",
      rejected: "Rechazado",
      expired: "Vencido",
    }
    return labels[status as keyof typeof labels] || status
  }

  const approvedCerts = certificates.filter((c) => c.status === "approved")
  const pendingCerts = certificates.filter((c) => c.status === "pending")
  const rejectedCerts = certificates.filter((c) => c.status === "rejected")
  const expiredCerts = certificates.filter((c) => c.status === "expired")

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Detalles del Conductor
          </DialogTitle>
          <DialogDescription>Información completa del conductor y sus certificados</DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Driver Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>{driver.full_name}</span>
                <Badge variant={driver.is_active ? "default" : "secondary"}>
                  {driver.is_active ? "Activo" : "Inactivo"}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{driver.email}</span>
                  </div>

                  {driver.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{driver.phone}</span>
                    </div>
                  )}

                  <div className="flex items-center gap-2">
                    <Building className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{driver.company_name}</span>
                  </div>
                </div>

                <div className="space-y-3">
                  {driver.rut && (
                    <div>
                      <span className="text-sm font-medium">RUT: </span>
                      <span className="text-sm">{driver.rut}</span>
                    </div>
                  )}

                  {(driver.city || driver.region) && (
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{[driver.city, driver.region].filter(Boolean).join(", ")}</span>
                    </div>
                  )}

                  {driver.address && (
                    <div>
                      <span className="text-sm font-medium">Dirección: </span>
                      <span className="text-sm">{driver.address}</span>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Certificate Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-green-600">{approvedCerts.length}</div>
                <div className="text-sm text-muted-foreground">Aprobados</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-yellow-600">{pendingCerts.length}</div>
                <div className="text-sm text-muted-foreground">Pendientes</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-red-600">{rejectedCerts.length}</div>
                <div className="text-sm text-muted-foreground">Rechazados</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-red-600">{expiredCerts.length}</div>
                <div className="text-sm text-muted-foreground">Vencidos</div>
              </CardContent>
            </Card>
          </div>

          {/* Certificates List */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Certificados ({certificates.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {certificates.length === 0 ? (
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">Este conductor no tiene certificados registrados.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {certificates.map((certificate) => (
                    <div key={certificate.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <div className="font-medium text-sm">
                            {getCertificateTypeLabel(certificate.certificate_type)}
                          </div>
                          {certificate.certificate_number && (
                            <div className="text-xs text-muted-foreground font-mono">
                              {certificate.certificate_number}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        {certificate.expiry_date && (
                          <div className="text-right">
                            <div className="text-xs text-muted-foreground">Vence</div>
                            <div className="text-sm">
                              {new Date(certificate.expiry_date).toLocaleDateString("es-CL")}
                            </div>
                          </div>
                        )}

                        <Badge className={getStatusColor(certificate.status)}>
                          {getStatusIcon(certificate.status)}
                          <span className="ml-1">{getStatusLabel(certificate.status)}</span>
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex justify-end pt-4 border-t">
            <Button variant="outline" onClick={onClose}>
              Cerrar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
