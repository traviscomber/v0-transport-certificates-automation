"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { FileText, Download, Calendar, Building, AlertTriangle, CheckCircle, Clock, XCircle } from "lucide-react"

interface Certificate {
  id: string
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
}

interface CertificateCardProps {
  certificate: Certificate
}

export function CertificateCard({ certificate }: CertificateCardProps) {
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

  const isExpiringSoon = () => {
    if (!certificate.expiry_date) return false
    const expiryDate = new Date(certificate.expiry_date)
    const today = new Date()
    const daysUntilExpiry = Math.ceil((expiryDate.getTime() - today.getTime()) / (1000 * 3600 * 24))
    return daysUntilExpiry <= 30 && daysUntilExpiry > 0
  }

  const handleDownload = () => {
    if (certificate.file_url) {
      window.open(certificate.file_url, "_blank")
    }
  }

  return (
    <Card className={`relative ${isExpiringSoon() ? "border-yellow-500" : ""}`}>
      {isExpiringSoon() && (
        <div className="absolute top-2 right-2">
          <AlertTriangle className="h-4 w-4 text-yellow-500" />
        </div>
      )}

      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            <CardTitle className="text-base">{getCertificateTypeLabel(certificate.certificate_type)}</CardTitle>
          </div>
          <Badge className={getStatusColor(certificate.status)}>
            {getStatusIcon(certificate.status)}
            <span className="ml-1">{getStatusLabel(certificate.status)}</span>
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {certificate.certificate_number && (
          <div className="flex items-center gap-2 text-sm">
            <span className="font-medium">Número:</span>
            <span className="text-muted-foreground">{certificate.certificate_number}</span>
          </div>
        )}

        {certificate.issue_date && (
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium">Emisión:</span>
            <span className="text-muted-foreground">
              {new Date(certificate.issue_date).toLocaleDateString("es-CL")}
            </span>
          </div>
        )}

        {certificate.expiry_date && (
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium">Vencimiento:</span>
            <span className={`${isExpiringSoon() ? "text-yellow-600 font-medium" : "text-muted-foreground"}`}>
              {new Date(certificate.expiry_date).toLocaleDateString("es-CL")}
            </span>
          </div>
        )}

        {certificate.issuing_authority && (
          <div className="flex items-center gap-2 text-sm">
            <Building className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium">Autoridad:</span>
            <span className="text-muted-foreground">{certificate.issuing_authority}</span>
          </div>
        )}

        {certificate.validation_notes && certificate.status === "rejected" && (
          <div className="mt-3 p-3 bg-red-50 dark:bg-red-900/20 rounded-md">
            <p className="text-sm text-red-700 dark:text-red-300">
              <strong>Motivo del rechazo:</strong> {certificate.validation_notes}
            </p>
          </div>
        )}

        {isExpiringSoon() && (
          <div className="mt-3 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-md">
            <p className="text-sm text-yellow-700 dark:text-yellow-300">
              <AlertTriangle className="h-4 w-4 inline mr-1" />
              Este certificado vence pronto. Considera renovarlo.
            </p>
          </div>
        )}

        <div className="flex justify-end pt-2">
          <Button variant="outline" size="sm" onClick={handleDownload}>
            <Download className="h-4 w-4 mr-2" />
            Descargar
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
