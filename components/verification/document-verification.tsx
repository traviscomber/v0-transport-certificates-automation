"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  CheckCircle,
  XCircle,
  Clock,
  FileText,
  Eye,
  Download,
  MessageSquare,
  Calendar,
  User,
  Building,
  Shield,
} from "lucide-react"

interface VerificationDocument {
  id: string
  documentType: string
  transporterName: string
  transporterRut: string
  vehiclePlate?: string
  uploadDate: string
  expiryDate: string
  fileName: string
  fileSize: string
  status: "pending" | "approved" | "rejected"
  priority: "high" | "medium" | "low"
  verificationHistory: VerificationAction[]
  notes?: string
}

interface VerificationAction {
  id: string
  action: "uploaded" | "approved" | "rejected" | "comment"
  user: string
  date: string
  comment?: string
}

// Mock data for verification queue
const mockVerificationDocuments: VerificationDocument[] = [
  {
    id: "1",
    documentType: "F-30",
    transporterName: "Logística del Sur S.A.",
    transporterRut: "96.789.123-4",
    vehiclePlate: "EFGH-34",
    uploadDate: "2024-01-14",
    expiryDate: "2024-06-14",
    fileName: "f30_sur_2024.pdf",
    fileSize: "1.8 MB",
    status: "pending",
    priority: "high",
    verificationHistory: [
      {
        id: "1",
        action: "uploaded",
        user: "Sistema",
        date: "2024-01-14 10:30",
        comment: "Documento subido por el transportista",
      },
    ],
  },
  {
    id: "2",
    documentType: "F-30-1",
    transporterName: "Carga Pesada Ltda.",
    transporterRut: "79.987.654-3",
    vehiclePlate: "QRST-90",
    uploadDate: "2024-01-12",
    expiryDate: "2024-08-12",
    fileName: "f30-1_pesada_2024.pdf",
    fileSize: "2.7 MB",
    status: "pending",
    priority: "medium",
    verificationHistory: [
      {
        id: "2",
        action: "uploaded",
        user: "Sistema",
        date: "2024-01-12 14:15",
        comment: "Documento subido por el transportista",
      },
      {
        id: "3",
        action: "comment",
        user: "Ana García",
        date: "2024-01-13 09:20",
        comment: "Revisar información de la patente, parece incompleta",
      },
    ],
  },
  {
    id: "3",
    documentType: "Revisión Técnica",
    transporterName: "Transportes Norte Chile",
    transporterRut: "88.123.456-7",
    vehiclePlate: "UVWX-12",
    uploadDate: "2024-01-10",
    expiryDate: "2024-07-10",
    fileName: "revision_tecnica_uvwx12.pdf",
    fileSize: "1.5 MB",
    status: "pending",
    priority: "low",
    verificationHistory: [
      {
        id: "4",
        action: "uploaded",
        user: "Sistema",
        date: "2024-01-10 16:45",
        comment: "Documento subido por el transportista",
      },
    ],
  },
]

export function DocumentVerification() {
  const [documents, setDocuments] = useState<VerificationDocument[]>(mockVerificationDocuments)
  const [selectedDocument, setSelectedDocument] = useState<VerificationDocument | null>(null)
  const [verificationComment, setVerificationComment] = useState("")
  const [activeTab, setActiveTab] = useState("pending")

  const handleApprove = (documentId: string) => {
    setDocuments((prev) =>
      prev.map((doc) => {
        if (doc.id === documentId) {
          const newAction: VerificationAction = {
            id: Date.now().toString(),
            action: "approved",
            user: "Usuario Actual",
            date: new Date().toLocaleString(),
            comment: verificationComment || "Documento aprobado",
          }
          return {
            ...doc,
            status: "approved" as const,
            verificationHistory: [...doc.verificationHistory, newAction],
          }
        }
        return doc
      }),
    )
    setVerificationComment("")
    setSelectedDocument(null)
  }

  const handleReject = (documentId: string) => {
    if (!verificationComment.trim()) {
      alert("Debe proporcionar un motivo para el rechazo")
      return
    }

    setDocuments((prev) =>
      prev.map((doc) => {
        if (doc.id === documentId) {
          const newAction: VerificationAction = {
            id: Date.now().toString(),
            action: "rejected",
            user: "Usuario Actual",
            date: new Date().toLocaleString(),
            comment: verificationComment,
          }
          return {
            ...doc,
            status: "rejected" as const,
            verificationHistory: [...doc.verificationHistory, newAction],
          }
        }
        return doc
      }),
    )
    setVerificationComment("")
    setSelectedDocument(null)
  }

  const addComment = (documentId: string) => {
    if (!verificationComment.trim()) return

    setDocuments((prev) =>
      prev.map((doc) => {
        if (doc.id === documentId) {
          const newAction: VerificationAction = {
            id: Date.now().toString(),
            action: "comment",
            user: "Usuario Actual",
            date: new Date().toLocaleString(),
            comment: verificationComment,
          }
          return {
            ...doc,
            verificationHistory: [...doc.verificationHistory, newAction],
          }
        }
        return doc
      }),
    )
    setVerificationComment("")
  }

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "high":
        return <Badge variant="destructive">Alta</Badge>
      case "medium":
        return <Badge variant="secondary">Media</Badge>
      case "low":
        return <Badge variant="outline">Baja</Badge>
      default:
        return <Badge variant="outline">Normal</Badge>
    }
  }

  const getActionIcon = (action: string) => {
    switch (action) {
      case "approved":
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case "rejected":
        return <XCircle className="h-4 w-4 text-red-600" />
      case "comment":
        return <MessageSquare className="h-4 w-4 text-blue-600" />
      case "uploaded":
        return <FileText className="h-4 w-4 text-gray-600" />
      default:
        return <Clock className="h-4 w-4 text-yellow-600" />
    }
  }

  const filteredDocuments = documents.filter((doc) => {
    if (activeTab === "pending") return doc.status === "pending"
    if (activeTab === "approved") return doc.status === "approved"
    if (activeTab === "rejected") return doc.status === "rejected"
    return true
  })

  const pendingCount = documents.filter((doc) => doc.status === "pending").length
  const approvedCount = documents.filter((doc) => doc.status === "approved").length
  const rejectedCount = documents.filter((doc) => doc.status === "rejected").length

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Verificación de Documentos</h1>
        <p className="text-muted-foreground mt-2">Revisa y aprueba documentos pendientes de verificación</p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pendientes</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingCount}</div>
            <p className="text-xs text-muted-foreground">Documentos por revisar</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Aprobados Hoy</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{approvedCount}</div>
            <p className="text-xs text-muted-foreground">Documentos verificados</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rechazados</CardTitle>
            <XCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{rejectedCount}</div>
            <p className="text-xs text-muted-foreground">Requieren corrección</p>
          </CardContent>
        </Card>
      </div>

      {/* Verification Queue */}
      <Card>
        <CardHeader>
          <CardTitle>Cola de Verificación</CardTitle>
          <CardDescription>Documentos organizados por estado de verificación</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="pending">Pendientes ({pendingCount})</TabsTrigger>
              <TabsTrigger value="approved">Aprobados ({approvedCount})</TabsTrigger>
              <TabsTrigger value="rejected">Rechazados ({rejectedCount})</TabsTrigger>
              <TabsTrigger value="all">Todos</TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab} className="mt-6">
              <div className="space-y-4">
                {filteredDocuments.map((doc) => (
                  <Card key={doc.id} className="border-l-4 border-l-primary">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2">
                            <Shield className="h-5 w-5 text-primary" />
                            <h3 className="font-semibold">{doc.documentType}</h3>
                            {getPriorityBadge(doc.priority)}
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center space-x-2">
                              <Building className="h-4 w-4" />
                              <span>{doc.transporterName}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <User className="h-4 w-4" />
                              <span>{doc.transporterRut}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Calendar className="h-4 w-4" />
                              <span>Vence: {doc.expiryDate}</span>
                            </div>
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Archivo: {doc.fileName} ({doc.fileSize})
                          </div>
                        </div>

                        <div className="flex items-center space-x-2">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="outline" size="sm" onClick={() => setSelectedDocument(doc)}>
                                <Eye className="h-4 w-4 mr-2" />
                                Revisar
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                              <DialogHeader>
                                <DialogTitle>Verificación de Documento</DialogTitle>
                                <DialogDescription>Revisa los detalles y el historial del documento</DialogDescription>
                              </DialogHeader>
                              {selectedDocument && (
                                <div className="space-y-6">
                                  {/* Document Details */}
                                  <div className="grid grid-cols-2 gap-4 p-4 bg-muted rounded-lg">
                                    <div>
                                      <Label className="text-sm font-medium">Tipo de Documento</Label>
                                      <p className="text-sm">{selectedDocument.documentType}</p>
                                    </div>
                                    <div>
                                      <Label className="text-sm font-medium">Transportista</Label>
                                      <p className="text-sm">{selectedDocument.transporterName}</p>
                                    </div>
                                    <div>
                                      <Label className="text-sm font-medium">RUT</Label>
                                      <p className="text-sm">{selectedDocument.transporterRut}</p>
                                    </div>
                                    <div>
                                      <Label className="text-sm font-medium">Patente</Label>
                                      <p className="text-sm">{selectedDocument.vehiclePlate || "N/A"}</p>
                                    </div>
                                    <div>
                                      <Label className="text-sm font-medium">Fecha de Vencimiento</Label>
                                      <p className="text-sm">{selectedDocument.expiryDate}</p>
                                    </div>
                                    <div>
                                      <Label className="text-sm font-medium">Prioridad</Label>
                                      <div className="mt-1">{getPriorityBadge(selectedDocument.priority)}</div>
                                    </div>
                                  </div>

                                  {/* Document Preview */}
                                  <div className="border rounded-lg p-4">
                                    <Label className="text-sm font-medium mb-2 block">Vista Previa del Documento</Label>
                                    <div className="bg-gray-100 h-64 rounded flex items-center justify-center">
                                      <div className="text-center">
                                        <FileText className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                                        <p className="text-sm text-gray-600">{selectedDocument.fileName}</p>
                                        <Button variant="outline" size="sm" className="mt-2 bg-transparent">
                                          <Download className="h-4 w-4 mr-2" />
                                          Descargar
                                        </Button>
                                      </div>
                                    </div>
                                  </div>

                                  {/* Verification History */}
                                  <div>
                                    <Label className="text-sm font-medium mb-3 block">Historial de Verificación</Label>
                                    <div className="space-y-3">
                                      {selectedDocument.verificationHistory.map((action) => (
                                        <div key={action.id} className="flex items-start space-x-3 p-3 border rounded">
                                          {getActionIcon(action.action)}
                                          <div className="flex-1">
                                            <div className="flex items-center justify-between">
                                              <span className="font-medium capitalize">{action.action}</span>
                                              <span className="text-xs text-muted-foreground">{action.date}</span>
                                            </div>
                                            <p className="text-sm text-muted-foreground">Por: {action.user}</p>
                                            {action.comment && (
                                              <p className="text-sm mt-1 p-2 bg-muted rounded">{action.comment}</p>
                                            )}
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  </div>

                                  {/* Verification Actions */}
                                  {selectedDocument.status === "pending" && (
                                    <div className="space-y-4 border-t pt-4">
                                      <div>
                                        <Label htmlFor="comment" className="text-sm font-medium">
                                          Comentario de Verificación
                                        </Label>
                                        <Textarea
                                          id="comment"
                                          placeholder="Agregar comentario sobre la verificación..."
                                          value={verificationComment}
                                          onChange={(e) => setVerificationComment(e.target.value)}
                                          className="mt-1"
                                        />
                                      </div>
                                      <div className="flex justify-end space-x-2">
                                        <Button
                                          variant="outline"
                                          onClick={() => addComment(selectedDocument.id)}
                                          disabled={!verificationComment.trim()}
                                        >
                                          <MessageSquare className="h-4 w-4 mr-2" />
                                          Agregar Comentario
                                        </Button>
                                        <Button variant="destructive" onClick={() => handleReject(selectedDocument.id)}>
                                          <XCircle className="h-4 w-4 mr-2" />
                                          Rechazar
                                        </Button>
                                        <Button
                                          variant="default"
                                          className="bg-green-600 hover:bg-green-700"
                                          onClick={() => handleApprove(selectedDocument.id)}
                                        >
                                          <CheckCircle className="h-4 w-4 mr-2" />
                                          Aprobar
                                        </Button>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              )}
                            </DialogContent>
                          </Dialog>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                {filteredDocuments.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">No hay documentos en esta categoría</div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
