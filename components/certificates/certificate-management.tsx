"use client"

import { useEffect, useState } from "react"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Search, Filter, Eye, CheckCircle, XCircle, Clock, AlertTriangle, FileText, Calendar } from "lucide-react"

interface Certificate {
  id: string
  documentType: string
  transporterName: string
  transporterRut: string
  vehiclePlate?: string
  uploadDate: string
  expiryDate: string
  status: "approved" | "pending" | "expired" | "rejected"
  fileName: string
  fileSize: string
  notes?: string
}

interface UploadedDocument {
  id: string
  fileName: string
  fileSize: string
  uploadDate: string
  documentType: string
  ocrData: Record<string, unknown>
  confidence: "high" | "medium" | "low"
  status: "pending" | "approved" | "rejected"
  formData?: Record<string, unknown>
}

interface CertificateManagementProps {
  title: string
  description: string
  certificateType: "f30" | "f30-1" | "machines"
}

const normalizeStatus = (status: unknown): Certificate["status"] => {
  const value = String(status || "").toLowerCase()
  if (value === "approved" || value === "aprobado") return "approved"
  if (value === "rejected" || value === "rechazado") return "rejected"
  if (value === "expired" || value === "vencido") return "expired"
  return "pending"
}

const matchesCertificateType = (
  record: Record<string, unknown>,
  certificateType: CertificateManagementProps["certificateType"],
) => {
  const rawType = [
    record.certificate_type,
    record.document_type,
    record.documentType,
    record.file_name,
    record.fileName,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase()

  if (certificateType === "f30") {
    return rawType.includes("f30") && !rawType.includes("f30-1")
  }

  if (certificateType === "f30-1") {
    return rawType.includes("f30-1")
  }

  return ["permiso", "revision", "revisión", "licencia", "seguro", "patente", "vehiculo", "vehículo"].some((keyword) =>
    rawType.includes(keyword),
  )
}

const mapCertificateRecord = (record: Record<string, any>): Certificate => {
  const documentType =
    record.certificate_type === "f30"
      ? "F-30"
      : record.certificate_type === "f30-1"
        ? "F-30-1"
        : record.document_type || record.documentType || "Documento"

  return {
    id: String(record.id ?? record.file_name ?? record.fileName ?? crypto.randomUUID()),
    documentType,
    transporterName:
      record.transporter_name ||
      record.company_name ||
      record.owner_name ||
      record.full_name ||
      record.name ||
      "Información no disponible",
    transporterRut: record.transporter_rut || record.rut || record.document_rut || "No disponible",
    vehiclePlate: record.vehicle_plate || record.patente || record.plate || undefined,
    uploadDate: record.upload_date || record.uploaded_at || record.created_at || "",
    expiryDate: record.expiry_date || record.expires_at || record.valid_until || "No disponible",
    status: normalizeStatus(record.status || record.validation_status),
    fileName: record.file_name || record.original_filename || record.fileName || "Archivo",
    fileSize: record.file_size || record.size || "-",
    notes: record.notes || record.observations || record.comment || undefined,
  }
}

export function CertificateManagement({ title, description, certificateType }: CertificateManagementProps) {
  const [certificates, setCertificates] = useState<Certificate[]>([])
  const [uploadedDocuments, setUploadedDocuments] = useState<UploadedDocument[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [selectedCertificate, setSelectedCertificate] = useState<Certificate | null>(null)

  useEffect(() => {
    const loadCertificates = async () => {
      try {
        const response = await fetch("/api/certificates", { cache: "no-store" })
        if (!response.ok) return

        const payload = await response.json()
        const records: Record<string, any>[] = Array.isArray(payload?.data) ? payload.data : []
        const mappedCertificates = records
          .filter((record: Record<string, any>) => matchesCertificateType(record, certificateType))
          .map((record: Record<string, any>) => mapCertificateRecord(record))

        setCertificates(mappedCertificates)
      } catch (error) {
        console.error("Error loading certificates:", error)
      }
    }

    const loadUploadedDocuments = () => {
      try {
        const stored = localStorage.getItem("uploadedDocuments")
        if (!stored) {
          setUploadedDocuments([])
          return
        }

        const documents = JSON.parse(stored)
        const filteredDocs = documents.filter((doc: UploadedDocument) => {
          if (certificateType === "machines") {
            return [
              "Licencia de Conducir",
              "Permiso de Circulación",
              "Revisión Técnica",
              "Seguro Obligatorio",
            ].includes(doc.documentType)
          }

          if (certificateType === "f30") {
            return doc.documentType === "Certificado F-30"
          }

          if (certificateType === "f30-1") {
            return doc.documentType === "Certificado F-30-1"
          }

          return false
        })

        setUploadedDocuments(filteredDocs)
      } catch (error) {
        console.error("Error loading uploaded documents:", error)
      }
    }

    loadCertificates()
    loadUploadedDocuments()

    const handleStorageChange = () => {
      loadUploadedDocuments()
    }

    window.addEventListener("storage", handleStorageChange)
    return () => window.removeEventListener("storage", handleStorageChange)
  }, [certificateType])

  const convertUploadedToCertificates = (docs: UploadedDocument[]): Certificate[] => {
    return docs.map((doc) => {
      const ocrData = doc.ocrData || {}

      let transporterName = "Información no disponible"
      if (ocrData.nombreConductor && typeof ocrData.nombreConductor === "string") transporterName = ocrData.nombreConductor
      else if (ocrData.nombreTransportista && typeof ocrData.nombreTransportista === "string") transporterName = ocrData.nombreTransportista
      else if (ocrData.nombrePropietario && typeof ocrData.nombrePropietario === "string") transporterName = ocrData.nombrePropietario
      else if (ocrData.nombreContratante && typeof ocrData.nombreContratante === "string") transporterName = ocrData.nombreContratante
      else if (doc.formData?.transporterName && typeof doc.formData.transporterName === "string") transporterName = doc.formData.transporterName

      let transporterRut = "No disponible"
      if (ocrData.rutConductor && typeof ocrData.rutConductor === "string") transporterRut = ocrData.rutConductor
      else if (ocrData.rutTransportista && typeof ocrData.rutTransportista === "string") transporterRut = ocrData.rutTransportista
      else if (ocrData.rutPropietario && typeof ocrData.rutPropietario === "string") transporterRut = ocrData.rutPropietario
      else if (ocrData.rutContratante && typeof ocrData.rutContratante === "string") transporterRut = ocrData.rutContratante
      else if (doc.formData?.transporterRut && typeof doc.formData.transporterRut === "string") transporterRut = doc.formData.transporterRut

      let vehiclePlate: string | undefined = undefined
      if (ocrData.patenteVehiculo && typeof ocrData.patenteVehiculo === "string") vehiclePlate = ocrData.patenteVehiculo
      else if (ocrData.patente && typeof ocrData.patente === "string") vehiclePlate = ocrData.patente
      else if (doc.formData?.vehiclePlate && typeof doc.formData.vehiclePlate === "string") vehiclePlate = doc.formData.vehiclePlate

      let expiryDate = "No disponible"
      if (ocrData.fechaVencimiento && typeof ocrData.fechaVencimiento === "string") expiryDate = ocrData.fechaVencimiento
      else if (ocrData.fechaExpiracion && typeof ocrData.fechaExpiracion === "string") expiryDate = ocrData.fechaExpiracion
      else if (doc.formData?.expiryDate && typeof doc.formData.expiryDate === "string") expiryDate = doc.formData.expiryDate

      let notes: string | undefined = undefined
      if (doc.formData?.notes && typeof doc.formData.notes === "string") {
        notes = doc.formData.notes
      }
      if (doc.confidence === "low") {
        notes = "Documento procesado con baja confianza - revisar manualmente"
      }

      return {
        id: doc.id,
        documentType: doc.documentType,
        transporterName,
        transporterRut,
        vehiclePlate,
        uploadDate: doc.uploadDate,
        expiryDate,
        status: doc.status,
        fileName: doc.fileName,
        fileSize: doc.fileSize,
        notes,
      }
    })
  }

  const allCertificates = [...certificates, ...convertUploadedToCertificates(uploadedDocuments)]

  const filteredCertificates = allCertificates.filter((cert) => {
    const matchesSearch =
      cert.transporterName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cert.transporterRut.includes(searchTerm) ||
      cert.vehiclePlate?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cert.documentType.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = statusFilter === "all" || cert.status === statusFilter

    return matchesSearch && matchesStatus
  })

  const getStatusBadge = (status: Certificate["status"]) => {
    switch (status) {
      case "approved":
        return (
          <Badge variant="default" className="bg-green-100 text-green-800 hover:bg-green-100">
            <CheckCircle className="w-3 h-3 mr-1" />
            Aprobado
          </Badge>
        )
      case "pending":
        return (
          <Badge variant="secondary">
            <Clock className="w-3 h-3 mr-1" />
            Pendiente
          </Badge>
        )
      case "expired":
        return (
          <Badge variant="destructive">
            <AlertTriangle className="w-3 h-3 mr-1" />
            Vencido
          </Badge>
        )
      case "rejected":
        return (
          <Badge variant="outline" className="border-red-200 text-red-700">
            <XCircle className="w-3 h-3 mr-1" />
            Rechazado
          </Badge>
        )
      default:
        return <Badge variant="outline">Desconocido</Badge>
    }
  }

  const getStatusCount = (status: Certificate["status"]) => {
    return allCertificates.filter((cert) => cert.status === status).length
  }

  const isExpiringSoon = (expiryDate: string) => {
    const expiry = new Date(expiryDate)
    const today = new Date()
    const daysUntilExpiry = Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 3600 * 24))
    return daysUntilExpiry <= 30 && daysUntilExpiry > 0
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">{title}</h1>
        <p className="text-muted-foreground mt-2">{description}</p>
        {uploadedDocuments.length > 0 && (
          <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              📄 {uploadedDocuments.length} documento(s) recién subido(s) aparecen en la lista
            </p>
          </div>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total</CardTitle>
            <FileText className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{allCertificates.length}</div>
            <p className="text-xs text-muted-foreground">Documentos registrados</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Aprobados</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{getStatusCount("approved")}</div>
            <p className="text-xs text-muted-foreground">Documentos válidos</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pendientes</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{getStatusCount("pending")}</div>
            <p className="text-xs text-muted-foreground">Por revisar</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Vencidos</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{getStatusCount("expired")}</div>
            <p className="text-xs text-muted-foreground">Requieren renovación</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filtros y Búsqueda</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por transportista, RUT, patente..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Filtrar por estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los estados</SelectItem>
                <SelectItem value="approved">Aprobados</SelectItem>
                <SelectItem value="pending">Pendientes</SelectItem>
                <SelectItem value="expired">Vencidos</SelectItem>
                <SelectItem value="rejected">Rechazados</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Documentos</CardTitle>
          <CardDescription>
            {filteredCertificates.length} de {allCertificates.length} documentos
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Transportista</TableHead>
                  <TableHead>RUT</TableHead>
                  <TableHead>Patente</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Vencimiento</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCertificates.map((cert) => (
                  <TableRow key={cert.id}>
                    <TableCell className="font-medium">{cert.transporterName}</TableCell>
                    <TableCell>{cert.transporterRut}</TableCell>
                    <TableCell>{cert.vehiclePlate || "-"}</TableCell>
                    <TableCell>{cert.documentType}</TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span className={isExpiringSoon(cert.expiryDate) ? "text-yellow-600 font-medium" : ""}>
                          {cert.expiryDate}
                        </span>
                        {isExpiringSoon(cert.expiryDate) && <AlertTriangle className="h-4 w-4 text-yellow-600" />}
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(cert.status)}</TableCell>
                    <TableCell>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="ghost" size="sm" onClick={() => setSelectedCertificate(cert)}>
                            <Eye className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                          <DialogHeader>
                            <DialogTitle>Detalles del Documento</DialogTitle>
                            <DialogDescription>Información completa del certificado</DialogDescription>
                          </DialogHeader>
                          {selectedCertificate && (
                            <div className="space-y-4">
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <Label className="text-sm font-medium">Transportista</Label>
                                  <p className="text-sm text-muted-foreground">{selectedCertificate.transporterName}</p>
                                </div>
                                <div>
                                  <Label className="text-sm font-medium">RUT</Label>
                                  <p className="text-sm text-muted-foreground">{selectedCertificate.transporterRut}</p>
                                </div>
                                <div>
                                  <Label className="text-sm font-medium">Tipo de Documento</Label>
                                  <p className="text-sm text-muted-foreground">{selectedCertificate.documentType}</p>
                                </div>
                                <div>
                                  <Label className="text-sm font-medium">Patente</Label>
                                  <p className="text-sm text-muted-foreground">
                                    {selectedCertificate.vehiclePlate || "N/A"}
                                  </p>
                                </div>
                                <div>
                                  <Label className="text-sm font-medium">Fecha de Subida</Label>
                                  <p className="text-sm text-muted-foreground">{selectedCertificate.uploadDate}</p>
                                </div>
                                <div>
                                  <Label className="text-sm font-medium">Fecha de Vencimiento</Label>
                                  <p className="text-sm text-muted-foreground">{selectedCertificate.expiryDate}</p>
                                </div>
                                <div>
                                  <Label className="text-sm font-medium">Archivo</Label>
                                  <p className="text-sm text-muted-foreground">
                                    {selectedCertificate.fileName} ({selectedCertificate.fileSize})
                                  </p>
                                </div>
                                <div>
                                  <Label className="text-sm font-medium">Estado</Label>
                                  <div className="mt-1">{getStatusBadge(selectedCertificate.status)}</div>
                                </div>
                              </div>
                              {selectedCertificate.notes && (
                                <div>
                                  <Label className="text-sm font-medium">Notas</Label>
                                  <p className="text-sm text-muted-foreground mt-1">{selectedCertificate.notes}</p>
                                </div>
                              )}
                            </div>
                          )}
                        </DialogContent>
                      </Dialog>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
