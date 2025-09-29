"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar, Download, Mail, FileText, TrendingUp, AlertTriangle, CheckCircle, Clock, Zap } from "lucide-react"

interface Report {
  id: string
  name: string
  type: "compliance" | "expiry" | "audit" | "performance"
  frequency: "daily" | "weekly" | "monthly" | "quarterly"
  lastGenerated: Date
  nextScheduled: Date
  recipients: string[]
  status: "active" | "paused" | "error"
}

export function AutomatedReports() {
  const [reports] = useState<Report[]>([
    {
      id: "1",
      name: "Reporte de Cumplimiento Semanal",
      type: "compliance",
      frequency: "weekly",
      lastGenerated: new Date("2024-01-15"),
      nextScheduled: new Date("2024-01-22"),
      recipients: ["admin@cleaner.cl", "compliance@cleaner.cl"],
      status: "active",
    },
    {
      id: "2",
      name: "Alertas de Vencimiento Mensual",
      type: "expiry",
      frequency: "monthly",
      lastGenerated: new Date("2024-01-01"),
      nextScheduled: new Date("2024-02-01"),
      recipients: ["operations@cleaner.cl"],
      status: "active",
    },
    {
      id: "3",
      name: "Auditoría Trimestral",
      type: "audit",
      frequency: "quarterly",
      lastGenerated: new Date("2023-10-01"),
      nextScheduled: new Date("2024-01-01"),
      recipients: ["audit@cleaner.cl", "legal@cleaner.cl"],
      status: "paused",
    },
  ])

  const [selectedPeriod, setSelectedPeriod] = useState("monthly")
  const [isGenerating, setIsGenerating] = useState(false)

  const generateInstantReport = async () => {
    setIsGenerating(true)

    // Simulate report generation
    setTimeout(() => {
      setIsGenerating(false)
      console.log("[v0] Generated instant report for period:", selectedPeriod)
    }, 3000)
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "compliance":
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case "expiry":
        return <Clock className="h-4 w-4 text-yellow-600" />
      case "audit":
        return <FileText className="h-4 w-4 text-blue-600" />
      case "performance":
        return <TrendingUp className="h-4 w-4 text-purple-600" />
      default:
        return <FileText className="h-4 w-4" />
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-100 text-green-800">Activo</Badge>
      case "paused":
        return <Badge variant="secondary">Pausado</Badge>
      case "error":
        return <Badge variant="destructive">Error</Badge>
      default:
        return <Badge variant="outline">Desconocido</Badge>
    }
  }

  const getFrequencyText = (frequency: string) => {
    switch (frequency) {
      case "daily":
        return "Diario"
      case "weekly":
        return "Semanal"
      case "monthly":
        return "Mensual"
      case "quarterly":
        return "Trimestral"
      default:
        return frequency
    }
  }

  return (
    <div className="space-y-6">
      {/* Instant Report Generation */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-orange-600" />
            Generación Instantánea de Reportes
          </CardTitle>
          <CardDescription>Genera reportes personalizados al instante con análisis de IA</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 items-end">
            <div className="flex-1">
              <label className="text-sm font-medium mb-2 block">Período del Reporte</label>
              <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="weekly">Última Semana</SelectItem>
                  <SelectItem value="monthly">Último Mes</SelectItem>
                  <SelectItem value="quarterly">Último Trimestre</SelectItem>
                  <SelectItem value="yearly">Último Año</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button
              onClick={generateInstantReport}
              disabled={isGenerating}
              className="bg-orange-600 hover:bg-orange-700"
            >
              {isGenerating ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Generando...
                </>
              ) : (
                <>
                  <Download className="h-4 w-4 mr-2" />
                  Generar Reporte
                </>
              )}
            </Button>
          </div>

          {isGenerating && (
            <div className="mt-4 p-4 bg-orange-50 rounded-lg border border-orange-200">
              <div className="flex items-center gap-2 text-orange-800">
                <div className="animate-pulse">
                  <TrendingUp className="h-4 w-4" />
                </div>
                <span className="text-sm font-medium">Analizando datos y generando insights con IA...</span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Scheduled Reports */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-blue-600" />
            Reportes Programados
          </CardTitle>
          <CardDescription>Reportes automáticos enviados por email según programación</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {reports.map((report) => (
              <div key={report.id} className="border rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    {getTypeIcon(report.type)}
                    <div className="space-y-1">
                      <h4 className="font-semibold">{report.name}</h4>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>Frecuencia: {getFrequencyText(report.frequency)}</span>
                        <span>•</span>
                        <span>Último: {report.lastGenerated.toLocaleDateString()}</span>
                        <span>•</span>
                        <span>Próximo: {report.nextScheduled.toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Mail className="h-3 w-3" />
                        <span>{report.recipients.length} destinatario(s)</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {getStatusBadge(report.status)}
                    <Button variant="outline" size="sm">
                      <FileText className="h-3 w-3 mr-1" />
                      Ver
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Report Templates */}
      <Card>
        <CardHeader>
          <CardTitle>Plantillas de Reportes Disponibles</CardTitle>
          <CardDescription>Plantillas predefinidas para diferentes tipos de análisis</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="border rounded-lg p-4 hover:bg-muted/50 cursor-pointer transition-colors">
              <div className="flex items-center gap-3 mb-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <h4 className="font-semibold">Reporte de Cumplimiento</h4>
              </div>
              <p className="text-sm text-muted-foreground mb-3">
                Estado general de cumplimiento normativo y documentos vigentes
              </p>
              <div className="flex gap-2">
                <Badge variant="outline">Cumplimiento</Badge>
                <Badge variant="outline">Normativo</Badge>
              </div>
            </div>

            <div className="border rounded-lg p-4 hover:bg-muted/50 cursor-pointer transition-colors">
              <div className="flex items-center gap-3 mb-2">
                <AlertTriangle className="h-5 w-5 text-yellow-600" />
                <h4 className="font-semibold">Análisis de Riesgos</h4>
              </div>
              <p className="text-sm text-muted-foreground mb-3">
                Identificación predictiva de riesgos y documentos por vencer
              </p>
              <div className="flex gap-2">
                <Badge variant="outline">Predictivo</Badge>
                <Badge variant="outline">Riesgos</Badge>
              </div>
            </div>

            <div className="border rounded-lg p-4 hover:bg-muted/50 cursor-pointer transition-colors">
              <div className="flex items-center gap-3 mb-2">
                <TrendingUp className="h-5 w-5 text-blue-600" />
                <h4 className="font-semibold">Métricas de Rendimiento</h4>
              </div>
              <p className="text-sm text-muted-foreground mb-3">
                KPIs operacionales y tendencias de eficiencia del sistema
              </p>
              <div className="flex gap-2">
                <Badge variant="outline">KPIs</Badge>
                <Badge variant="outline">Rendimiento</Badge>
              </div>
            </div>

            <div className="border rounded-lg p-4 hover:bg-muted/50 cursor-pointer transition-colors">
              <div className="flex items-center gap-3 mb-2">
                <FileText className="h-5 w-5 text-purple-600" />
                <h4 className="font-semibold">Auditoría Completa</h4>
              </div>
              <p className="text-sm text-muted-foreground mb-3">
                Reporte detallado para auditorías internas y externas
              </p>
              <div className="flex gap-2">
                <Badge variant="outline">Auditoría</Badge>
                <Badge variant="outline">Detallado</Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
