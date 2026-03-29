'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  BarChart3,
  Download,
  Eye,
  RefreshCw,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Clock,
  Users,
  Truck,
  FileText,
} from 'lucide-react'

// Mandant (Walmart) dashboard - Read-only view
const mandantData = {
  organizationName: 'Transportes Labbe',
  mandantName: 'Walmart Chile',
  lastUpdate: new Date().toISOString(),
  complianceScore: 87,
  trend: '+3%',
  totalTransportists: 24,
  totalVehicles: 18,
  certifiedDrivers: 21,
  certifiedVehicles: 16,
  pendingDocuments: 8,
  expiringDocuments: 5,
  blockedDeliveries: 2,
}

const statusOverview = [
  { status: 'Conforme', count: 156, color: 'bg-green-500', icon: CheckCircle },
  { status: 'Por vencer', count: 12, color: 'bg-yellow-500', icon: Clock },
  { status: 'Vencido', count: 3, color: 'bg-red-500', icon: AlertTriangle },
  { status: 'Faltante', count: 5, color: 'bg-orange-500', icon: AlertTriangle },
]

const transportersList = [
  { id: 1, name: 'Juan Perez Rodriguez', documents: 8, compliant: 7, score: 88, status: 'ok' },
  { id: 2, name: 'Maria Lopez Martinez', documents: 8, compliant: 8, score: 100, status: 'ok' },
  { id: 3, name: 'Carlos Rodriguez Silva', documents: 8, compliant: 6, score: 75, status: 'warning' },
  { id: 4, name: 'Ana Martinez Gonzalez', documents: 8, compliant: 7, score: 88, status: 'ok' },
  { id: 5, name: 'Pedro Sanchez Lopez', documents: 8, compliant: 5, score: 63, status: 'critical' },
]

const vehiclesList = [
  { patente: 'ABC-1234', type: 'Camion', documents: 6, compliant: 6, score: 100, status: 'ok' },
  { patente: 'XYZ-5678', type: 'Furgon', documents: 6, compliant: 5, score: 83, status: 'ok' },
  { patente: 'LMN-9012', type: 'Trailer', documents: 6, compliant: 4, score: 67, status: 'warning' },
]

const criticalAlerts = [
  { id: 1, type: 'Vencimiento', entity: 'Licencia - Juan Perez', daysLeft: 5, severity: 'critical' },
  { id: 2, type: 'Faltante', entity: 'Revision Tecnica - ABC-1234', severity: 'high' },
  { id: 3, type: 'Vencimiento', entity: 'SOAP - XYZ-5678', daysLeft: 12, severity: 'high' },
]

export default function MandantPortal() {
  const [selectedTab, setSelectedTab] = useState('overview')
  const [showExportMenu, setShowExportMenu] = useState(false)

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-400'
    if (score >= 75) return 'text-yellow-400'
    return 'text-red-400'
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ok':
        return 'bg-green-500/20 text-green-300 border-green-500/30'
      case 'warning':
        return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30'
      case 'critical':
        return 'bg-red-500/20 text-red-300 border-red-500/30'
      default:
        return 'bg-slate-500/20 text-slate-300 border-slate-500/30'
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header - Read-only indicator */}
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white mb-1">Portal de Compliance</h1>
            <p className="text-slate-400">
              Visualización de cumplimiento: {mandantData.organizationName} → {mandantData.mandantName}
            </p>
            <div className="flex items-center gap-2 mt-2">
              <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30">
                <Eye className="h-3 w-3 mr-1" />
                Solo lectura
              </Badge>
              <Badge variant="outline" className="border-slate-600">
                Última actualización: {new Date(mandantData.lastUpdate).toLocaleTimeString('es-CL')}
              </Badge>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="border-slate-600">
              <RefreshCw className="h-4 w-4 mr-2" />
              Actualizar
            </Button>
            <div className="relative">
              <Button
                variant="outline"
                size="sm"
                className="border-slate-600"
                onClick={() => setShowExportMenu(!showExportMenu)}
              >
                <Download className="h-4 w-4 mr-2" />
                Exportar
              </Button>
              {showExportMenu && (
                <div className="absolute right-0 mt-2 bg-slate-800 border border-slate-700 rounded-lg shadow-xl z-10">
                  <Button variant="ghost" size="sm" className="w-full justify-start rounded-none">
                    Descargar PDF
                  </Button>
                  <Button variant="ghost" size="sm" className="w-full justify-start rounded-none">
                    Descargar Excel
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Main Score */}
        <Card className="border-slate-700/50 bg-gradient-to-br from-slate-800 to-slate-900">
          <CardContent className="p-8">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 mb-2">Score de Compliance General</p>
                <div className="flex items-baseline gap-3">
                  <span className={`text-6xl font-bold ${getScoreColor(mandantData.complianceScore)}`}>
                    {mandantData.complianceScore}%
                  </span>
                  <span className="text-green-400 text-lg font-medium flex items-center gap-1">
                    <TrendingUp className="h-4 w-4" />
                    {mandantData.trend}
                  </span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-white">{mandantData.certifiedDrivers}/{mandantData.totalTransportist}</p>
                  <p className="text-xs text-slate-400">Conductores Conformes</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-white">{mandantData.certifiedVehicles}/{mandantData.totalVehicles}</p>
                  <p className="text-xs text-slate-400">Vehículos Conformes</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-yellow-400">{mandantData.pendingDocuments}</p>
                  <p className="text-xs text-slate-400">Pendientes</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-red-400">{mandantData.blockedDeliveries}</p>
                  <p className="text-xs text-slate-400">Entregas Bloqueadas</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Status Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {statusOverview.map((item, idx) => (
            <Card key={idx} className="border-slate-700/50 bg-gradient-to-br from-slate-800 to-slate-900">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-3">
                  <item.icon className={`h-6 w-6 ${item.color.replace('bg-', 'text-')}`} />
                </div>
                <p className="text-slate-400 text-sm mb-1">{item.status}</p>
                <p className="text-2xl font-bold text-white">{item.count}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Critical Alerts */}
        {criticalAlerts.length > 0 && (
          <Card className="border-red-500/30 bg-gradient-to-br from-red-500/10 to-transparent">
            <CardHeader>
              <CardTitle className="text-red-300 flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Alertas Críticas que Requieren Acción
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {criticalAlerts.map((alert) => (
                <div key={alert.id} className="flex items-start justify-between p-3 rounded-lg bg-slate-800/50 border border-red-500/20">
                  <div className="flex-1">
                    <p className="font-medium text-foreground">{alert.type}</p>
                    <p className="text-sm text-muted-foreground">{alert.entity}</p>
                  </div>
                  <div className="text-right">
                    {alert.daysLeft && (
                      <p className="text-sm font-medium text-red-400">{alert.daysLeft} días</p>
                    )}
                    <Badge className={`mt-1 ${getStatusBadge(alert.severity)}`}>
                      {alert.severity.toUpperCase()}
                    </Badge>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Transporters List */}
        <Card className="border-slate-700/50 bg-gradient-to-br from-slate-800 to-slate-900">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-cyan-400" />
              Conductores
            </CardTitle>
            <CardDescription>Estado de documentación y compliance por conductor</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-700">
                    <th className="text-left py-3 px-4 text-slate-400 font-medium text-sm">Nombre</th>
                    <th className="text-left py-3 px-4 text-slate-400 font-medium text-sm">Documentos</th>
                    <th className="text-left py-3 px-4 text-slate-400 font-medium text-sm">Conforme</th>
                    <th className="text-left py-3 px-4 text-slate-400 font-medium text-sm">Score</th>
                    <th className="text-left py-3 px-4 text-slate-400 font-medium text-sm">Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {transportersList.map((driver) => (
                    <tr key={driver.id} className="border-b border-slate-700/50 hover:bg-slate-800/30">
                      <td className="py-3 px-4 text-foreground">{driver.name}</td>
                      <td className="py-3 px-4 text-slate-400">{driver.documents}</td>
                      <td className="py-3 px-4 text-foreground font-medium">{driver.compliant}/{driver.documents}</td>
                      <td className={`py-3 px-4 font-bold ${getScoreColor(driver.score)}`}>{driver.score}%</td>
                      <td className="py-3 px-4">
                        <Badge className={getStatusBadge(driver.status)}>
                          {driver.status === 'ok' ? 'Conforme' : driver.status === 'warning' ? 'Alerta' : 'Crítico'}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Vehicles List */}
        <Card className="border-slate-700/50 bg-gradient-to-br from-slate-800 to-slate-900">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Truck className="h-5 w-5 text-green-400" />
              Vehículos
            </CardTitle>
            <CardDescription>Estado de documentación y compliance por vehículo</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-700">
                    <th className="text-left py-3 px-4 text-slate-400 font-medium text-sm">Patente</th>
                    <th className="text-left py-3 px-4 text-slate-400 font-medium text-sm">Tipo</th>
                    <th className="text-left py-3 px-4 text-slate-400 font-medium text-sm">Documentos</th>
                    <th className="text-left py-3 px-4 text-slate-400 font-medium text-sm">Conforme</th>
                    <th className="text-left py-3 px-4 text-slate-400 font-medium text-sm">Score</th>
                    <th className="text-left py-3 px-4 text-slate-400 font-medium text-sm">Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {vehiclesList.map((vehicle) => (
                    <tr key={vehicle.patente} className="border-b border-slate-700/50 hover:bg-slate-800/30">
                      <td className="py-3 px-4 font-mono font-bold text-foreground">{vehicle.patente}</td>
                      <td className="py-3 px-4 text-slate-400">{vehicle.type}</td>
                      <td className="py-3 px-4 text-slate-400">{vehicle.documents}</td>
                      <td className="py-3 px-4 text-foreground font-medium">{vehicle.compliant}/{vehicle.documents}</td>
                      <td className={`py-3 px-4 font-bold ${getScoreColor(vehicle.score)}`}>{vehicle.score}%</td>
                      <td className="py-3 px-4">
                        <Badge className={getStatusBadge(vehicle.status)}>
                          {vehicle.status === 'ok' ? 'Conforme' : 'Alerta'}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center text-slate-400 text-xs py-4">
          <p>Este portal es de solo lectura. Los datos se actualizan automáticamente cada 30 minutos.</p>
          <p>Para más información o reportes personalizados, contacte a su supervisor.</p>
        </div>
      </div>
    </div>
  )
}
