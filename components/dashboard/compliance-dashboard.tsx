"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { FileText, Shield, Truck, AlertTriangle, CheckCircle, Clock, Download, Filter } from "lucide-react"
import { useState } from "react"
import { exportComplianceToExcel, exportComplianceToPDF } from "@/lib/export-utils"

export function ComplianceDashboard() {
  const [filterStatus, setFilterStatus] = useState<string>("all")
  const [exportFormat, setExportFormat] = useState<"pdf" | "excel" | null>(null)

  // Matriz documental con estado de cumplimiento
  const documentMatrix = [
    {
      id: "v-001",
      name: "Camión Carga (JK-5234)",
      type: "vehicle",
      documents: [
        { type: "Revisión Técnica", status: "vigente", expiresIn: 45, expiryDate: "2024-06-15" },
        { type: "Permiso Circulación", status: "vigente", expiresIn: 120, expiryDate: "2024-09-20" },
        { type: "SOAP", status: "vigente", expiresIn: 30, expiryDate: "2024-06-01" },
        { type: "Seguro Obligatorio", status: "vencido", expiresIn: -5, expiryDate: "2024-04-20" },
      ]
    },
    {
      id: "c-001",
      name: "Juan García López",
      type: "conductor",
      documents: [
        { type: "Licencia de Conducir Profesional", status: "vigente", expiresIn: 200, expiryDate: "2025-02-15" },
        { type: "Certificado Psicosocial", status: "vigente", expiresIn: 60, expiryDate: "2024-07-01" },
        { type: "Curso de Conducción Defensiva", status: "por-vencer", expiresIn: 15, expiryDate: "2024-05-20" },
      ]
    },
    {
      id: "v-002",
      name: "Furgón Logística (JL-2891)",
      type: "vehicle",
      documents: [
        { type: "Revisión Técnica", status: "por-vencer", expiresIn: 10, expiryDate: "2024-05-15" },
        { type: "Permiso Circulación", status: "vigente", expiresIn: 150, expiryDate: "2024-10-20" },
        { type: "SOAP", status: "vigente", expiresIn: 90, expiryDate: "2024-08-01" },
      ]
    },
    {
      id: "ct-001",
      name: "Electroservicios Chile SpA",
      type: "contractor",
      documents: [
        { type: "Certificado de Afiliación", status: "vigente", expiresIn: 180, expiryDate: "2025-01-15" },
        { type: "Documento de Identidad", status: "vigente", expiresIn: 300, expiryDate: "2025-06-20" },
        { type: "Certificado de Antecedentes", status: "vencido", expiresIn: -30, expiryDate: "2024-03-20" },
      ]
    }
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case "vigente":
        return "bg-green-500/20 text-green-700 border-green-500/30"
      case "por-vencer":
        return "bg-yellow-500/20 text-yellow-700 border-yellow-500/30"
      case "vencido":
        return "bg-red-500/20 text-red-700 border-red-500/30"
      default:
        return "bg-slate-500/20 text-slate-700 border-slate-500/30"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "vigente":
        return <CheckCircle className="w-4 h-4" />
      case "por-vencer":
        return <AlertTriangle className="w-4 h-4" />
      case "vencido":
        return <AlertTriangle className="w-4 h-4" />
      default:
        return <Clock className="w-4 h-4" />
    }
  }

  // Estadísticas de cumplimiento
  const stats = {
    total: documentMatrix.reduce((acc, item) => acc + item.documents.length, 0),
    vigentes: documentMatrix.reduce((acc, item) => 
      acc + item.documents.filter(d => d.status === "vigente").length, 0),
    porVencer: documentMatrix.reduce((acc, item) => 
      acc + item.documents.filter(d => d.status === "por-vencer").length, 0),
    vencidos: documentMatrix.reduce((acc, item) => 
      acc + item.documents.filter(d => d.status === "vencido").length, 0),
  }

  // Exportar a PDF usando utility
  const exportPDF = () => {
    const documentsForExport = filteredMatrix.flatMap(item =>
      item.documents.map(doc => ({
        vehiclePatent: item.name,
        driverName: item.name,
        documentType: doc.type,
        expirationDate: doc.expiryDate,
        status: doc.status === 'vigente' ? 'vigente' : doc.status === 'por-vencer' ? 'por vencer' : 'vencido',
        uploadDate: new Date().toLocaleDateString('es-ES'),
        observations: doc.expiresIn > 0 ? `Vence en ${doc.expiresIn} días` : 'Documento vencido'
      }))
    )
    
    try {
      exportComplianceToPDF(documentsForExport, 'Empresa de Transporte')
    } catch (error) {
      console.error('Error exporting to PDF:', error)
    }
  }

  // Exportar a Excel usando utility
  const exportExcel = () => {
    const documentsForExport = filteredMatrix.flatMap(item =>
      item.documents.map(doc => ({
        vehiclePatent: item.name,
        driverName: item.name,
        documentType: doc.type,
        expirationDate: doc.expiryDate,
        status: doc.status === 'vigente' ? 'vigente' : doc.status === 'por-vencer' ? 'por vencer' : 'vencido',
        uploadDate: new Date().toLocaleDateString('es-ES'),
        observations: doc.expiresIn > 0 ? `Vence en ${doc.expiresIn} días` : 'Documento vencido'
      }))
    )
    
    try {
      exportComplianceToExcel(documentsForExport, 'Empresa de Transporte')
    } catch (error) {
      console.error('Error exporting to Excel:', error)
    }
  }

  const filteredMatrix = documentMatrix.filter(item => {
    if (filterStatus === "all") return true
    const hasStatus = item.documents.some(d => d.status === filterStatus)
    return hasStatus
  })

  return (
    <div className="space-y-6">
      {/* Header con estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-600">Total Documentos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{stats.total}</div>
          </CardContent>
        </Card>

        <Card className="border-green-500/30 bg-green-500/5">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-green-600">Vigentes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-400">{stats.vigentes}</div>
          </CardContent>
        </Card>

        <Card className="border-yellow-500/30 bg-yellow-500/5">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-yellow-600">Por Vencer</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-400">{stats.porVencer}</div>
          </CardContent>
        </Card>

        <Card className="border-red-500/30 bg-red-500/5">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-red-600">Vencidos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-400">{stats.vencidos}</div>
          </CardContent>
        </Card>
      </div>

      {/* Matriz Documental */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Matriz Documental</CardTitle>
            <CardDescription>Estado de cumplimiento de vehículos, conductores y contratistas</CardDescription>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={exportPDF}
              className="gap-2"
            >
              <Download className="w-4 h-4" />
              PDF
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={exportExcel}
              className="gap-2"
            >
              <Download className="w-4 h-4" />
              Excel
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Filtros */}
          <div className="flex gap-2 flex-wrap">
            <Button
              variant={filterStatus === "all" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilterStatus("all")}
            >
              Todos
            </Button>
            <Button
              variant={filterStatus === "vigente" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilterStatus("vigente")}
              className={filterStatus === "vigente" ? "bg-green-600 hover:bg-green-700" : ""}
            >
              Vigentes
            </Button>
            <Button
              variant={filterStatus === "por-vencer" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilterStatus("por-vencer")}
              className={filterStatus === "por-vencer" ? "bg-yellow-600 hover:bg-yellow-700" : ""}
            >
              Por Vencer
            </Button>
            <Button
              variant={filterStatus === "vencido" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilterStatus("vencido")}
              className={filterStatus === "vencido" ? "bg-red-600 hover:bg-red-700" : ""}
            >
              Vencidos
            </Button>
          </div>

          {/* Tabla de Matriz */}
          <div className="space-y-4">
            {filteredMatrix.map(item => (
              <div key={item.id} className="border border-slate-700 rounded-lg p-4 space-y-3">
                <div className="flex items-center gap-2">
                  {item.type === "vehicle" && <Truck className="w-5 h-5 text-blue-400" />}
                  {item.type === "conductor" && <FileText className="w-5 h-5 text-purple-400" />}
                  {item.type === "contractor" && <Shield className="w-5 h-5 text-orange-400" />}
                  <span className="font-semibold text-white">{item.name}</span>
                  <span className="text-xs text-slate-400 ml-auto">ID: {item.id}</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {item.documents.map((doc, idx) => (
                    <div key={idx} className={`p-3 rounded border ${getStatusColor(doc.status)} flex items-center justify-between`}>
                      <div className="flex items-center gap-2 flex-1">
                        {getStatusIcon(doc.status)}
                        <div className="flex-1">
                          <p className="text-sm font-medium">{doc.type}</p>
                          <p className="text-xs opacity-75">Vence: {doc.expiryDate}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-semibold">
                          {doc.expiresIn > 0 ? `${doc.expiresIn}d` : "Vencido"}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Alertas Críticas */}
      {stats.vencidos > 0 && (
        <Card className="border-red-500/30 bg-red-500/5">
          <CardHeader>
            <CardTitle className="text-red-400 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              Acción Requerida: {stats.vencidos} Documento(s) Vencido(s)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-slate-300">
              {stats.vencidos} documento(s) están vencidos y requieren renovación inmediata. Contacta a los responsables para actualizar la documentación y evitar sanciones.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
