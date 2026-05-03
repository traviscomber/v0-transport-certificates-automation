'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  BarChart3,
  AlertTriangle,
  CheckCircle,
  TrendingUp,
  Users,
  Zap,
  Shield,
} from 'lucide-react'
import Link from 'next/link'

export default function MandanteDashboard() {
  const stats = {
    totalProviders: 24,
    compliant: 22,
    nonCompliant: 2,
    activeAlerts: 3,
    complianceScore: 88,
    qualityScore: 92,
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border border-slate-700/50 p-8 md:p-12">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-0 left-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl"></div>
        </div>
        <div className="relative z-10">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-8">
            <div>
              <Badge className="mb-4 bg-purple-500/20 text-purple-300 border-purple-500/30 font-medium">
                <Shield className="h-3 w-3 mr-1" />
                Panel Mandante
              </Badge>
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">Auditoría de Proveedores</h1>
              <p className="text-lg text-slate-300">Monitoreo de compliance y calidad</p>
            </div>
            <Link href="/compliance">
              <Button className="bg-purple-500 hover:bg-purple-600 text-white font-semibold px-8 py-3 rounded-xl">
                <BarChart3 className="h-5 w-5 mr-2" />
                Ver Reportes
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-6">
        <Card className="border-slate-700/50 bg-gradient-to-br from-slate-800/50 to-slate-900/50">
          <CardContent className="p-6">
            <div className="p-2 rounded-lg bg-blue-500/20 w-fit mb-4">
              <Users className="h-5 w-5 text-blue-400" />
            </div>
            <p className="text-slate-400 text-sm mb-1">Total Proveedores</p>
            <p className="text-3xl font-bold text-white">{stats.totalProviders}</p>
          </CardContent>
        </Card>

        <Card className="border-slate-700/50 bg-gradient-to-br from-slate-800/50 to-slate-900/50">
          <CardContent className="p-6">
            <div className="p-2 rounded-lg bg-green-500/20 w-fit mb-4">
              <CheckCircle className="h-5 w-5 text-green-400" />
            </div>
            <p className="text-slate-400 text-sm mb-1">Compliant</p>
            <p className="text-3xl font-bold text-white">{stats.compliant}</p>
          </CardContent>
        </Card>

        <Card className="border-slate-700/50 bg-gradient-to-br from-slate-800/50 to-slate-900/50">
          <CardContent className="p-6">
            <div className="p-2 rounded-lg bg-red-500/20 w-fit mb-4">
              <AlertTriangle className="h-5 w-5 text-red-400" />
            </div>
            <p className="text-slate-400 text-sm mb-1">No Compliant</p>
            <p className="text-3xl font-bold text-white">{stats.nonCompliant}</p>
          </CardContent>
        </Card>

        <Card className="border-slate-700/50 bg-gradient-to-br from-slate-800/50 to-slate-900/50">
          <CardContent className="p-6">
            <div className="p-2 rounded-lg bg-orange-500/20 w-fit mb-4">
              <Zap className="h-5 w-5 text-orange-400" />
            </div>
            <p className="text-slate-400 text-sm mb-1">Alertas Activas</p>
            <p className="text-3xl font-bold text-white">{stats.activeAlerts}</p>
          </CardContent>
        </Card>

        <Card className="border-slate-700/50 bg-gradient-to-br from-slate-800/50 to-slate-900/50">
          <CardContent className="p-6">
            <div className="p-2 rounded-lg bg-green-500/20 w-fit mb-4">
              <TrendingUp className="h-5 w-5 text-green-400" />
            </div>
            <p className="text-slate-400 text-sm mb-1">Score Compliance</p>
            <p className="text-3xl font-bold text-white">{stats.complianceScore}%</p>
          </CardContent>
        </Card>

        <Card className="border-slate-700/50 bg-gradient-to-br from-slate-800/50 to-slate-900/50">
          <CardContent className="p-6">
            <div className="p-2 rounded-lg bg-purple-500/20 w-fit mb-4">
              <Shield className="h-5 w-5 text-purple-400" />
            </div>
            <p className="text-slate-400 text-sm mb-1">Score Calidad</p>
            <p className="text-3xl font-bold text-white">{stats.qualityScore}%</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="border-slate-700/50 bg-gradient-to-br from-slate-800/30 to-slate-900/30">
          <CardHeader>
            <CardTitle className="text-white">Proveedores Críticos</CardTitle>
            <CardDescription>Requieren atención inmediata</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between p-3 rounded-lg bg-red-500/10 border border-red-500/20">
              <div>
                <p className="text-slate-300 font-medium">TransEx Ltda.</p>
                <p className="text-xs text-slate-400">Última revisión: 5 días atrás</p>
              </div>
              <Badge className="bg-red-500/20 text-red-300">Crítico</Badge>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
              <div>
                <p className="text-slate-300 font-medium">Logística Plus</p>
                <p className="text-xs text-slate-400">Última revisión: 2 días atrás</p>
              </div>
              <Badge className="bg-yellow-500/20 text-yellow-300">Alerta</Badge>
            </div>
            <Link href="/compliance">
              <Button className="w-full mt-4 bg-purple-500 hover:bg-purple-600">
                Ver Todos los Proveedores
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="border-slate-700/50 bg-gradient-to-br from-slate-800/30 to-slate-900/30">
          <CardHeader>
            <CardTitle className="text-white">Métricas Generales</CardTitle>
            <CardDescription>Estado general de la red de proveedores</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-slate-300 text-sm">Documentación Actualizada</span>
                <span className="text-white font-semibold">95%</span>
              </div>
              <div className="w-full bg-slate-700/50 rounded-full h-2">
                <div className="bg-green-500 h-2 rounded-full" style={{ width: '95%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-slate-300 text-sm">Certificaciones Vigentes</span>
                <span className="text-white font-semibold">88%</span>
              </div>
              <div className="w-full bg-slate-700/50 rounded-full h-2">
                <div className="bg-blue-500 h-2 rounded-full" style={{ width: '88%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-slate-300 text-sm">Conformidad de Entregas</span>
                <span className="text-white font-semibold">96%</span>
              </div>
              <div className="w-full bg-slate-700/50 rounded-full h-2">
                <div className="bg-purple-500 h-2 rounded-full" style={{ width: '96%' }}></div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card className="border-slate-700/50 bg-gradient-to-br from-slate-800/30 to-slate-900/30">
        <CardHeader>
          <CardTitle className="text-white">Actividad Reciente</CardTitle>
          <CardDescription>Últimas acciones de auditoría</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-4 p-3 rounded-lg bg-slate-800/50">
            <div className="p-2 rounded-lg bg-green-500/20">
              <CheckCircle className="h-5 w-5 text-green-400" />
            </div>
            <div className="flex-1">
              <p className="text-slate-300 font-medium">Auditoría aprobada</p>
              <p className="text-xs text-slate-400">Transportes Global - Hace 2 horas</p>
            </div>
          </div>
          <div className="flex items-center gap-4 p-3 rounded-lg bg-slate-800/50">
            <div className="p-2 rounded-lg bg-yellow-500/20">
              <AlertTriangle className="h-5 w-5 text-yellow-400" />
            </div>
            <div className="flex-1">
              <p className="text-slate-300 font-medium">Documentación por vencer</p>
              <p className="text-xs text-slate-400">LogistiTech SA - Hace 4 horas</p>
            </div>
          </div>
          <div className="flex items-center gap-4 p-3 rounded-lg bg-slate-800/50">
            <div className="p-2 rounded-lg bg-blue-500/20">
              <BarChart3 className="h-5 w-5 text-blue-400" />
            </div>
            <div className="flex-1">
              <p className="text-slate-300 font-medium">Reporte generado</p>
              <p className="text-xs text-slate-400">Compliance mensual - Hace 1 día</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
