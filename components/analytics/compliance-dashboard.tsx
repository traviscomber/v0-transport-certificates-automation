"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts"
import { TrendingUp, TrendingDown, Shield, AlertTriangle, CheckCircle, Clock } from "lucide-react"

const complianceData = [
  { month: "Ene", compliant: 85, nonCompliant: 15 },
  { month: "Feb", compliant: 88, nonCompliant: 12 },
  { month: "Mar", compliant: 92, nonCompliant: 8 },
  { month: "Abr", compliant: 89, nonCompliant: 11 },
  { month: "May", compliant: 94, nonCompliant: 6 },
  { month: "Jun", compliant: 96, nonCompliant: 4 },
]

const documentStatusData = [
  { name: "Vigentes", value: 156, color: "#10b981" },
  { name: "Por Vencer", value: 23, color: "#f59e0b" },
  { name: "Vencidos", value: 8, color: "#ef4444" },
  { name: "En Proceso", value: 12, color: "#3b82f6" },
]

export function ComplianceDashboard() {
  const overallCompliance = 94
  const totalDocuments = documentStatusData.reduce((sum, item) => sum + item.value, 0)

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Cumplimiento General</p>
                <p className="text-2xl font-bold text-green-600">{overallCompliance}%</p>
              </div>
              <Shield className="h-8 w-8 text-green-600" />
            </div>
            <div className="mt-4">
              <Progress value={overallCompliance} className="h-2" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Documentos Vigentes</p>
                <p className="text-2xl font-bold text-blue-600">156</p>
              </div>
              <CheckCircle className="h-8 w-8 text-blue-600" />
            </div>
            <div className="flex items-center mt-2 text-sm">
              <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
              <span className="text-green-600">+12% vs mes anterior</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Por Vencer</p>
                <p className="text-2xl font-bold text-yellow-600">23</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-600" />
            </div>
            <div className="flex items-center mt-2 text-sm">
              <TrendingDown className="h-4 w-4 text-green-500 mr-1" />
              <span className="text-green-600">-5% vs mes anterior</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Documentos Vencidos</p>
                <p className="text-2xl font-bold text-red-600">8</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
            <div className="flex items-center mt-2 text-sm">
              <TrendingDown className="h-4 w-4 text-green-500 mr-1" />
              <span className="text-green-600">-3 vs mes anterior</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Tendencia de Cumplimiento</CardTitle>
            <CardDescription>Evolución mensual del cumplimiento normativo</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={complianceData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="compliant" fill="#10b981" name="Cumplimiento" />
                <Bar dataKey="nonCompliant" fill="#ef4444" name="No Cumplimiento" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Estado de Documentos</CardTitle>
            <CardDescription>Distribución actual de {totalDocuments} documentos</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={documentStatusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {documentStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="grid grid-cols-2 gap-2 mt-4">
              {documentStatusData.map((item, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-sm">
                    {item.name}: {item.value}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Risk Assessment */}
      <Card>
        <CardHeader>
          <CardTitle>Evaluación de Riesgos</CardTitle>
          <CardDescription>Análisis predictivo de riesgos de cumplimiento</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg border border-red-200">
              <div className="flex items-center gap-3">
                <AlertTriangle className="h-5 w-5 text-red-600" />
                <div>
                  <h4 className="font-semibold text-red-800">Riesgo Alto</h4>
                  <p className="text-sm text-red-600">8 documentos vencidos requieren atención inmediata</p>
                </div>
              </div>
              <Badge variant="destructive">Crítico</Badge>
            </div>

            <div className="flex items-center justify-between p-4 bg-yellow-50 rounded-lg border border-yellow-200">
              <div className="flex items-center gap-3">
                <Clock className="h-5 w-5 text-yellow-600" />
                <div>
                  <h4 className="font-semibold text-yellow-800">Riesgo Medio</h4>
                  <p className="text-sm text-yellow-600">23 documentos están próximos a vencer</p>
                </div>
              </div>
              <Badge className="bg-yellow-100 text-yellow-800">Atención</Badge>
            </div>

            <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg border border-green-200">
              <div className="flex items-center gap-3">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <div>
                  <h4 className="font-semibold text-green-800">Bajo Riesgo</h4>
                  <p className="text-sm text-green-600">156 documentos vigentes y en cumplimiento</p>
                </div>
              </div>
              <Badge className="bg-green-100 text-green-800">Óptimo</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
