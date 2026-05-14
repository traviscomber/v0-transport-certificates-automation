'use client'

import { useAuth } from '@/lib/auth-context'
import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { AlertTriangle } from 'lucide-react'
import { DocumentAlertsWidget } from '@/components/admin/document-alerts-widget'

export default function DashboardPage() {
  const { user, loading } = useAuth()
  const [simpleUser, setSimpleUser] = useState<{ email: string; name: string } | null>(null)
  const [cookieCheckDone, setCookieCheckDone] = useState(false)

  useEffect(() => {
    // Check for simple email login (ejecutivas)
    const userEmail = document.cookie
      .split('; ')
      .find(row => row.startsWith('user_email='))
      ?.split('=')[1]
    
    if (userEmail) {
      const decodedEmail = decodeURIComponent(userEmail)
      const name = decodedEmail.split('@')[0]
      setSimpleUser({ email: decodedEmail, name })
    }
    setCookieCheckDone(true)
  }, [])

  // Wait for both auth loading and cookie check to complete
  if (loading || !cookieCheckDone) {
    return null
  }

  // Use either Supabase Auth user or simple login user
  const currentUser = user || simpleUser
  if (!currentUser) return null

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

  const userRole = 'admin' in currentUser ? (currentUser as any).role : 'admin'

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">
          Bienvenida, {currentUser.name}
        </h1>
        <p className="text-slate-400">
          Iniciaste sesión como <span className="text-orange-400 font-semibold">{roleLabels[userRole] || userRole}</span>
        </p>
        <p className="text-sm text-slate-500 mt-1">
          {roleDescriptions[userRole] || 'Acceso al sistema DocuFleet'}
        </p>
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
                  <span className="font-semibold">Correo:</span> {currentUser.email}
                </p>
                <p className="text-sm text-slate-300 mt-2">
                  <span className="font-semibold">Rol:</span> {roleLabels[userRole] || userRole}
                </p>
                <p className="text-sm text-slate-300 mt-2">
                  <span className="font-semibold">Descripción:</span> {roleDescriptions[userRole] || 'Usuario del sistema'}
                </p>
              </div>

              <div className="pt-4 border-t border-slate-700">
                <p className="text-xs text-slate-500 mb-3">Acciones disponibles:</p>
                <div className="flex flex-wrap gap-2">
                  {userRole === 'driver' && (
                    <>
                      <Button variant="outline" size="sm">Subir Certificados</Button>
                      <Button variant="outline" size="sm">Ver Estado</Button>
                    </>
                  )}
                  {userRole === 'dispatcher' && (
                    <>
                      <Button variant="outline" size="sm">Gestionar Conductores</Button>
                      <Button variant="outline" size="sm">Ver Reportes</Button>
                    </>
                  )}
                  {userRole === 'admin' && (
                    <>
                      <Button variant="outline" size="sm">Panel Admin</Button>
                      <Button variant="outline" size="sm">Gestionar Organizaciones</Button>
                    </>
                  )}
                  {!['driver', 'dispatcher', 'admin'].includes(userRole) && (
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
