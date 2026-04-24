'use client'

import { useAuth } from '@/lib/auth-context'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { BarChart3, FileText, Users, AlertTriangle } from 'lucide-react'
import { DocumentAlertsWidget } from '@/components/admin/document-alerts-widget'

export default function DashboardPage() {
  const { user } = useAuth()

  if (!user) return null

  const roleLabels: Record<string, string> = {
    admin: 'Administrador',
    dispatcher: 'Despachador',
    driver: 'Conductor',
    mandante: 'Mandante',
    transportista: 'Transportista',
  }

  const roleDescriptions: Record<string, string> = {
    admin: 'Control total del sistema y organizaciones',
    dispatcher: 'Administración de conductores y compliance del equipo',
    driver: 'Gestión de tus documentos y certificados personales',
    mandante: 'Monitoreo de compliance y reportes',
    transportista: 'Administración de flota y conductores',
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">
          Bienvenido, {user.full_name || user.email.split('@')[0]}
        </h1>
        <p className="text-slate-400">
          Iniciaste sesión como <span className="text-orange-400 font-semibold">{roleLabels[user.role] || user.role}</span>
        </p>
        <p className="text-sm text-slate-500 mt-1">
          {roleDescriptions[user.role] || 'Acceso al sistema DocuFleet'}
        </p>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-slate-700 bg-slate-900/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-400 flex items-center gap-2">
              <FileText className="w-4 h-4 text-orange-500" />
              Documentos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">0</div>
            <p className="text-xs text-slate-500 mt-1">Certificados cargados</p>
          </CardContent>
        </Card>

        <Card className="border-slate-700 bg-slate-900/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-400 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-yellow-500" />
              Alertas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">0</div>
            <p className="text-xs text-slate-500 mt-1">Alertas activas</p>
          </CardContent>
        </Card>

        <Card className="border-slate-700 bg-slate-900/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-400 flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-blue-500" />
              Compliance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">0%</div>
            <p className="text-xs text-slate-500 mt-1">Estado de cumplimiento</p>
          </CardContent>
        </Card>

        <Card className="border-slate-700 bg-slate-900/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-400 flex items-center gap-2">
              <Users className="w-4 h-4 text-green-500" />
              {user.role === 'driver' ? 'Equipo' : 'Conductores'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">0</div>
            <p className="text-xs text-slate-500 mt-1">Miembros del equipo</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card className="border-slate-700 bg-slate-900/50">
            <CardHeader>
              <CardTitle>Información de tu rol</CardTitle>
              <CardDescription>Detalles sobre tu acceso y permisos</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-slate-800/50 rounded-lg border border-slate-700">
                <p className="text-sm text-slate-300">
                  <span className="font-semibold">Correo:</span> {user.email}
                </p>
                <p className="text-sm text-slate-300 mt-2">
                  <span className="font-semibold">Rol:</span> {roleLabels[user.role] || user.role}
                </p>
                <p className="text-sm text-slate-300 mt-2">
                  <span className="font-semibold">Descripción:</span> {roleDescriptions[user.role] || 'Usuario del sistema'}
                </p>
              </div>

              <div className="pt-4 border-t border-slate-700">
                <p className="text-xs text-slate-500 mb-3">Acciones disponibles:</p>
                <div className="flex flex-wrap gap-2">
                  {user.role === 'driver' && (
                    <>
                      <Button variant="outline" size="sm">Subir Certificados</Button>
                      <Button variant="outline" size="sm">Ver Estado</Button>
                    </>
                  )}
                  {user.role === 'dispatcher' && (
                    <>
                      <Button variant="outline" size="sm">Gestionar Conductores</Button>
                      <Button variant="outline" size="sm">Ver Reportes</Button>
                    </>
                  )}
                  {user.role === 'admin' && (
                    <>
                      <Button variant="outline" size="sm">Panel Admin</Button>
                      <Button variant="outline" size="sm">Gestionar Organizaciones</Button>
                    </>
                  )}
                  {!['driver', 'dispatcher', 'admin'].includes(user.role) && (
                    <Button variant="outline" size="sm">Explorar Dashboard</Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Alertas de Documentos - Sidebar */}
        <div>
          <Card className="border-slate-700 bg-slate-900/50 h-full">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-yellow-500" />
                Alertas de Documentos
              </CardTitle>
              <CardDescription>Vencimientos próximos</CardDescription>
            </CardHeader>
            <CardContent>
              <DocumentAlertsWidget daysThreshold={30} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
