'use client'

export const dynamic = 'force-dynamic'
export const revalidate = 0

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { 
  Shield, 
  CheckCircle, 
  AlertTriangle, 
  XCircle,
  TrendingUp,
  TrendingDown,
  FileText,
  Users,
  Truck,
  Calendar,
  Download,
} from 'lucide-react'

// Demo compliance data
const complianceOverview = {
  overall: 87,
  trend: +3,
  categories: [
    { name: 'Documentos Empresa', score: 95, total: 20, compliant: 19 },
    { name: 'Documentos Conductor', score: 82, total: 50, compliant: 41 },
    { name: 'Documentos Vehiculo', score: 88, total: 40, compliant: 35 },
    { name: 'Seguridad', score: 78, total: 18, compliant: 14 },
  ]
}

const expiringDocuments = [
  { id: 1, type: 'Licencia de Conducir', entity: 'Juan Perez', daysLeft: 7, priority: 'high' },
  { id: 2, type: 'Revision Tecnica', entity: 'Camion ABC-123', daysLeft: 12, priority: 'high' },
  { id: 3, type: 'SOAP', entity: 'Vehiculo XY-4567', daysLeft: 15, priority: 'normal' },
  { id: 4, type: 'Cert. Antecedentes Laborales', entity: 'Transportes Norte SpA', daysLeft: 20, priority: 'normal' },
  { id: 5, type: 'Permiso Circulacion', entity: 'Furgon LM-2345', daysLeft: 25, priority: 'low' },
]

const missingDocuments = [
  { id: 1, type: 'Hoja Vida Conductor', entity: 'Carlos Rodriguez', category: 'Conductor' },
  { id: 2, type: 'Seguro Responsabilidad', entity: 'Trailer NO-6789', category: 'Vehiculo' },
  { id: 3, type: 'Charla Seguridad', entity: 'Ana Martinez', category: 'Seguridad' },
]

export default function CompliancePage() {
  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-400'
    if (score >= 70) return 'text-yellow-400'
    return 'text-red-400'
  }

  const getProgressColor = (score: number) => {
    if (score >= 90) return 'bg-green-500'
    if (score >= 70) return 'bg-yellow-500'
    return 'bg-red-500'
  }

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'high':
        return <Badge className="bg-red-500/30 text-red-300 border-red-500/50">Urgente</Badge>
      case 'normal':
        return <Badge className="bg-yellow-500/30 text-yellow-300 border-yellow-500/50">Proximo</Badge>
      case 'low':
        return <Badge className="bg-blue-500/30 text-blue-300 border-blue-500/50">Planificado</Badge>
      default:
        return null
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
            <Shield className="h-8 w-8 text-green-400" />
            Panel de Compliance
          </h1>
          <p className="text-muted-foreground">Monitoreo del cumplimiento documental</p>
        </div>
        <Button className="btn-orange">
          <Download className="h-4 w-4 mr-2" />
          Exportar Reporte
        </Button>
      </div>

      {/* Main Score */}
      <Card className="border-slate-700/50 bg-gradient-to-br from-slate-800 to-slate-900">
        <CardContent className="p-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="text-center md:text-left">
              <p className="text-slate-400 mb-2">Score de Compliance General</p>
              <div className="flex items-baseline gap-4">
                <span className={`text-7xl font-bold ${getScoreColor(complianceOverview.overall)}`}>
                  {complianceOverview.overall}%
                </span>
                <div className={`flex items-center gap-1 ${complianceOverview.trend >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {complianceOverview.trend >= 0 ? (
                    <TrendingUp className="h-5 w-5" />
                  ) : (
                    <TrendingDown className="h-5 w-5" />
                  )}
                  <span className="text-lg font-medium">{complianceOverview.trend > 0 ? '+' : ''}{complianceOverview.trend}%</span>
                </div>
              </div>
              <p className="text-slate-500 mt-2">vs. mes anterior</p>
            </div>
            
            <div className="flex gap-6">
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mb-2">
                  <CheckCircle className="h-8 w-8 text-green-400" />
                </div>
                <p className="text-2xl font-bold text-white">109</p>
                <p className="text-xs text-slate-400">Conformes</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-yellow-500/20 flex items-center justify-center mb-2">
                  <AlertTriangle className="h-8 w-8 text-yellow-400" />
                </div>
                <p className="text-2xl font-bold text-white">16</p>
                <p className="text-xs text-slate-400">Por vencer</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center mb-2">
                  <XCircle className="h-8 w-8 text-red-400" />
                </div>
                <p className="text-2xl font-bold text-white">3</p>
                <p className="text-xs text-slate-400">Faltantes</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Category Breakdown */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {complianceOverview.categories.map((category, index) => (
          <Card key={index} className="border-slate-700/50 bg-gradient-to-br from-slate-800 to-slate-900">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-400">{category.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline justify-between mb-3">
                <span className={`text-3xl font-bold ${getScoreColor(category.score)}`}>
                  {category.score}%
                </span>
                <span className="text-sm text-slate-500">{category.compliant}/{category.total}</span>
              </div>
              <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                <div 
                  className={`h-full ${getProgressColor(category.score)} transition-all`}
                  style={{ width: `${category.score}%` }}
                />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Lists */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Expiring Soon */}
        <Card className="border-slate-700/50 bg-gradient-to-br from-slate-800 to-slate-900">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-foreground flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-yellow-400" />
                  Proximos a Vencer
                </CardTitle>
                <CardDescription>Documentos con vencimiento cercano</CardDescription>
              </div>
              <Button variant="outline" size="sm" className="border-slate-600">
                Ver todos
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {expiringDocuments.map((doc) => (
              <div
                key={doc.id}
                className="flex items-center justify-between p-3 rounded-lg bg-slate-800/50 border border-slate-700/50"
              >
                <div className="flex items-center gap-3">
                  <FileText className="h-5 w-5 text-slate-400" />
                  <div>
                    <p className="font-medium text-foreground text-sm">{doc.type}</p>
                    <p className="text-xs text-muted-foreground">{doc.entity}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-foreground">{doc.daysLeft} dias</span>
                  {getPriorityBadge(doc.priority)}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Missing Documents */}
        <Card className="border-slate-700/50 bg-gradient-to-br from-slate-800 to-slate-900">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-foreground flex items-center gap-2">
                  <XCircle className="h-5 w-5 text-red-400" />
                  Documentos Faltantes
                </CardTitle>
                <CardDescription>Requieren carga inmediata</CardDescription>
              </div>
              <Button variant="outline" size="sm" className="border-slate-600">
                Ver todos
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {missingDocuments.map((doc) => (
              <div
                key={doc.id}
                className="flex items-center justify-between p-3 rounded-lg bg-slate-800/50 border border-red-500/20"
              >
                <div className="flex items-center gap-3">
                  <XCircle className="h-5 w-5 text-red-400" />
                  <div>
                    <p className="font-medium text-foreground text-sm">{doc.type}</p>
                    <p className="text-xs text-muted-foreground">{doc.entity}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant="outline" className="border-slate-600 text-slate-400">
                    {doc.category}
                  </Badge>
                  <Button size="sm" className="btn-orange text-xs">
                    Subir
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
