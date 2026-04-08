"use client"

import { Label } from "@/components/ui/label"

import { useState, useEffect } from "react"
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
import {
  Search,
  Filter,
  Download,
  Eye,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  FileText,
  Calendar,
} from "lucide-react"

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

// Mock data - in real app this would come from API
const mockCertificates: Record<string, Certificate[]> = {
  f30: [
    {
      id: "1",
      documentType: "F-30",
      transporterName: "Transportes González Ltda.",
      transporterRut: "76.123.456-7",
      vehiclePlate: "ABCD-12",
      uploadDate: "2024-01-15",
      expiryDate: "2024-07-15",
      status: "approved",
      fileName: "f30_gonzalez_2024.pdf",
      fileSize: "2.3 MB",
      notes: "Certificado renovado correctamente",
    },
    {
      id: "2",
      documentType: "F-30",
      transporterName: "Logística del Sur S.A.",
      transporterRut: "96.789.123-4",
      vehiclePlate: "EFGH-34",
      uploadDate: "2024-01-14",
      expiryDate: "2024-06-14",
      status: "pending",
      fileName: "f30_sur_2024.pdf",
      fileSize: "1.8 MB",
    },
    {
      id: "3",
      documentType: "F-30",
      transporterName: "Transportes Rápidos Chile",
      transporterRut: "77.456.789-1",
      vehiclePlate: "IJKL-56",
      uploadDate: "2023-12-01",
      expiryDate: "2024-01-01",
      status: "expired",
      fileName: "f30_rapidos_2023.pdf",
      fileSize: "2.1 MB",
      notes: "Documento vencido - requiere renovación urgente",
    },
  ],
  "f30-1": [
    {
      id: "4",
      documentType: "F-30-1",
      transporterName: "Distribuidora Norte",
      transporterRut: "78.321.654-9",
      vehiclePlate: "MNOP-78",
      uploadDate: "2024-01-10",
      expiryDate: "2025-01-10",
      status: "approved",
      fileName: "f30-1_norte_2024.pdf",
      fileSize: "1.9 MB",
    },
    {
      id: "5",
      documentType: "F-30-1",
      transporterName: "Carga Pesada Ltda.",
      transporterRut: "79.987.654-3",
      vehiclePlate: "QRST-90",
      uploadDate: "2024-01-12",
      expiryDate: "2024-08-12",
      status: "rejected",
      fileName: "f30-1_pesada_2024.pdf",
      fileSize: "2.7 MB",
      notes: "Documento rechazado - información incompleta",
    },
  ],
  machines: [
    {
      id: "6",
      documentType: "Permiso de Circulación",
      transporterName: "Transportes González Ltda.",
      transporterRut: "76.123.456-7",
      vehiclePlate: "ABCD-12",
      uploadDate: "2024-01-08",
      expiryDate: "2025-01-08",
      status: "approved",
      fileName: "permiso_circulacion_abcd12.pdf",
      fileSize: "1.2 MB",
    },
    {
      id: "7",
      documentType: "Revisión Técnica",
      transporterName: "Logística del Sur S.A.",
      transporterRut: "96.789.123-4",
      vehiclePlate: "EFGH-34",
      uploadDate: "2024-01-05",
      expiryDate: "2024-07-05",
      status: "pending",
      fileName: "revision_tecnica_efgh34.pdf",
      fileSize: "1.5 MB",
    },
  ],
}

export function CertificateManagement({ title, description, certificateType }: CertificateManagementProps) {
  const [certificates, setCertificates] = useState<Certificate[]>(mockCertificates[certificateType] || [])
  const [uploadedDocuments, setUploadedDocuments] = useState<UploadedDocument[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [selectedCertificate, setSelectedCertificate] = useState<Certificate | null>(null)

  useEffect(() => {
    const loadUploadedDocuments = () => {
      try {
        const stored = localStorage.getItem("uploadedDocuments")
        if (stored) {
          const documents = JSON.parse(stored)
          const filteredDocs = documents.filter((doc: UploadedDocument) => {
            if (certificateType === "machines") {
              return [
                "Licencia de Conducir",
                "Permiso de Circulación",
                "Revisión Técnica",
                "Seguro Obligatorio",
              ].includes(doc.documentType)
            } else if (certificateType === "f30") {
              return doc.documentType === "Certificado F-30"
            } else if (certificateType === "f30-1") {
              return doc.documentType === "Certificado F-30-1"
            }
            return false
          })
          setUploadedDocuments(filteredDocs)
        }
      } catch (error) {
        console.error("Error loading uploaded documents:", error)
      }
    }

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

      // Map transporter/owner/driver names with priority order
      let transporterName = "Información no disponible"
      if (ocrData.nombreConductor) transporterName = ocrData.nombreConductor
      else if (ocrData.nombreTransportista) transporterName = ocrData.nombreTransportista
      else if (ocrData.nombrePropietario) transporterName = ocrData.nombrePropietario
      else if (ocrData.nombreContratante) transporterName = ocrData.nombreContratante
      else if (doc.formData?.transporterName) transporterName = doc.formData.transporterName

      // Map RUTs with priority order
      let transporterRut = "No disponible"
      if (ocrData.rutConductor) transporterRut = ocrData.rutConductor
      else if (ocrData.rutTransportista) transporterRut = ocrData.rutTransportista
      else if (ocrData.rutPropietario) transporterRut = ocrData.rutPropietario
      else if (ocrData.rutContratante) transporterRut = ocrData.rutContratante
      else if (doc.formData?.transporterRut) transporterRut = doc.formData.transporterRut

      // Map vehicle plates
      let vehiclePlate = undefined
      if (ocrData.patenteVehiculo) vehiclePlate = ocrData.patenteVehiculo
      else if (ocrData.patente) vehiclePlate = ocrData.patente
      else if (doc.formData?.vehiclePlate) vehiclePlate = doc.formData.vehiclePlate

      // Map expiry dates
      let expiryDate = "No disponible"
      if (ocrData.fechaVencimiento) expiryDate = ocrData.fechaVencimiento
      else if (ocrData.fechaExpiracion) expiryDate = ocrData.fechaExpiracion
      else if (doc.formData?.expiryDate) expiryDate = doc.formData.expiryDate

      // Generate notes based on confidence and warnings
      let notes = doc.formData?.notes || ""
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
        notes: notes || undefined,
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
                      <div className="flex items-center space-x-2">
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
                                    <p className="text-sm text-muted-foreground">
                                      {selectedCertificate.transporterName}
                                    </p>
                                  </div>
                                  <div>
                                    <Label className="text-sm font-medium">RUT</Label>
                                    <p className="text-sm text-muted-foreground">
                                      {selectedCertificate.transporterRut}
                                    </p>
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
                                <div className="flex justify-end space-x-2 pt-4">
                                  <Button variant="outline" size="sm">
                                    <Download className="h-4 w-4 mr-2" />
                                    Descargar
                                  </Button>
                                  {selectedCertificate.status === "pending" && (
                                    <>
                                      <Button variant="default" size="sm" className="bg-green-600 hover:bg-green-700">
                                        <CheckCircle className="h-4 w-4 mr-1" />
                                        Aprobar
                                      </Button>
                                      <Button variant="destructive" size="sm">
                                        <XCircle className="h-4 w-4 mr-2" />
                                        Rechazar
                                      </Button>
                                    </>
                                  )}
                                </div>
                              </div>
                            )}
                          </DialogContent>
                        </Dialog>
                        <Button variant="ghost" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
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
