"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { FileText, Download, CheckCircle, XCircle, Calendar, Building, User } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

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

interface CertificateValidationModalProps {
  certificate: Certificate
  onClose: () => void
  onSuccess: () => void
}

export function CertificateValidationModal({ certificate, onClose, onSuccess }: CertificateValidationModalProps) {
  const [validationNotes, setValidationNotes] = useState(certificate.validation_notes || "")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const supabase = createClient()

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

  const handleValidation = async (newStatus: "approved" | "rejected") => {
    setIsLoading(true)
    setError(null)

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) throw new Error("Usuario no autenticado")

      const { error: updateError } = await (supabase as any)
        .from("certificates")
        .update({
          status: newStatus,
          validation_notes: validationNotes,
          validated_by: user.id,
          validated_at: new Date().toISOString(),
        })
        .eq("id", certificate.id)

      if (updateError) throw updateError

      // Create notification for the driver
      const notificationMessage =
        newStatus === "approved"
          ? `Tu certificado ${getCertificateTypeLabel(certificate.certificate_type)} ha sido aprobado.`
          : `Tu certificado ${getCertificateTypeLabel(certificate.certificate_type)} ha sido rechazado. Motivo: ${validationNotes}`

      await (supabase as any).from("notifications").insert({
        user_id: certificate.driver_id,
        title: newStatus === "approved" ? "Certificado Aprobado" : "Certificado Rechazado",
        message: notificationMessage,
        type: newStatus === "approved" ? "success" : "error",
        related_certificate_id: certificate.id,
      })

      onSuccess()
    } catch (error: any) {
      setError(error.message || "Error al validar el certificado")
    } finally {
      setIsLoading(false)
    }
  }

  const handleDownload = () => {
    if (certificate.file_url) {
      window.open(certificate.file_url, "_blank")
    }
  }

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Validar Certificado
          </DialogTitle>
          <DialogDescription>Revisa y valida el certificado del conductor</DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Certificate Info */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium">{getCertificateTypeLabel(certificate.certificate_type)}</h3>
              <Badge className={getStatusColor(certificate.status)}>{getStatusLabel(certificate.status)}</Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <div className="font-medium">{certificate.profiles.full_name}</div>
                    <div className="text-sm text-muted-foreground">{certificate.profiles.email}</div>
                  </div>
                </div>

                {certificate.certificate_number && (
                  <div>
                    <Label className="text-sm font-medium">Número de Certificado</Label>
                    <p className="text-sm font-mono">{certificate.certificate_number}</p>
                  </div>
                )}

                {certificate.issuing_authority && (
                  <div className="flex items-center gap-2">
                    <Building className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <Label className="text-sm font-medium">Autoridad Emisora</Label>
                      <p className="text-sm">{certificate.issuing_authority}</p>
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-3">
                {certificate.issue_date && (
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <Label className="text-sm font-medium">Fecha de Emisión</Label>
                      <p className="text-sm">{new Date(certificate.issue_date).toLocaleDateString("es-CL")}</p>
                    </div>
                  </div>
                )}

                {certificate.expiry_date && (
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <Label className="text-sm font-medium">Fecha de Vencimiento</Label>
                      <p className="text-sm">{new Date(certificate.expiry_date).toLocaleDateString("es-CL")}</p>
                    </div>
                  </div>
                )}

                <div>
                  <Label className="text-sm font-medium">Subido el</Label>
                  <p className="text-sm">{new Date(certificate.created_at).toLocaleString("es-CL")}</p>
                </div>
              </div>
            </div>
          </div>

          {/* File Download */}
          {certificate.file_url && (
            <div className="border rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-primary" />
                  <div>
                    <div className="font-medium">{certificate.file_name}</div>
                    <div className="text-sm text-muted-foreground">Archivo del certificado</div>
                  </div>
                </div>
                <Button variant="outline" onClick={handleDownload}>
                  <Download className="h-4 w-4 mr-2" />
                  Descargar
                </Button>
              </div>
            </div>
          )}

          {/* Validation Notes */}
          <div className="space-y-2">
            <Label htmlFor="validation_notes">Notas de Validación</Label>
            <Textarea
              id="validation_notes"
              placeholder="Agrega comentarios sobre la validación del certificado..."
              value={validationNotes}
              onChange={(e) => setValidationNotes(e.target.value)}
              rows={4}
            />
          </div>

          {error && <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">{error}</div>}

          {/* Actions */}
          {certificate.status === "pending" && (
            <div className="flex justify-end space-x-2 pt-4 border-t">
              <Button variant="outline" onClick={onClose}>
                Cancelar
              </Button>
              <Button variant="destructive" onClick={() => handleValidation("rejected")} disabled={isLoading}>
                <XCircle className="h-4 w-4 mr-2" />
                {isLoading ? "Rechazando..." : "Rechazar"}
              </Button>
              <Button onClick={() => handleValidation("approved")} disabled={isLoading}>
                <CheckCircle className="h-4 w-4 mr-2" />
                {isLoading ? "Aprobando..." : "Aprobar"}
              </Button>
            </div>
          )}

          {certificate.status !== "pending" && (
            <div className="flex justify-end pt-4 border-t">
              <Button variant="outline" onClick={onClose}>
                Cerrar
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
