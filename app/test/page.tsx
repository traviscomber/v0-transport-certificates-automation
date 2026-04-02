'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Truck, Users, Shield, Zap, Clock, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuth } from '@/lib/auth-context'

type UserRole = 'conductor' | 'despachador' | 'administrador'

interface DemoAccount {
  role: UserRole
  email: string
  password: string
  name: string
  company: string
  icon: React.ReactNode
}

const demoAccounts: DemoAccount[] = [
  {
    role: 'conductor',
    email: 'driver@demo.cl',
    password: 'demo123',
    name: 'Juan Pérez',
    company: 'Transportista Independiente',
    icon: <Truck className="w-8 h-8" />,
  },
  {
    role: 'despachador',
    email: 'dispatcher@demo.cl',
    password: 'demo123',
    name: 'María García',
    company: 'Logística Express',
    icon: <Users className="w-8 h-8" />,
  },
  {
    role: 'administrador',
    email: 'admin@demo.cl',
    password: 'demo123',
    name: 'Carlos López',
    company: 'Administrador del Sistema',
    icon: <Shield className="w-8 h-8" />,
  },
]

export default function TestPage() {
  const [activeTab, setActiveTab] = useState<UserRole>('conductor')
  const [loadingRole, setLoadingRole] = useState<UserRole | null>(null)
  const [error, setError] = useState<string | null>(null)
  const { login } = useAuth()
  const router = useRouter()

  const filteredAccounts = demoAccounts.filter((acc) => acc.role === activeTab)
  const selectedAccount = filteredAccounts[0]

  const handleQuickLogin = async (account: DemoAccount) => {
    setError(null)
    setLoadingRole(account.role)

    try {
      await login(account.email, account.password)
      // Redirigir al dashboard correcto según el rol
      const dashboardMap: Record<UserRole, string> = {
        conductor: '/conductor',
        despachador: '/despachador',
        administrador: '/admin',
      }
      router.push(dashboardMap[account.role])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al iniciar sesión')
      setLoadingRole(null)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <div className="border-b border-slate-700 bg-slate-900/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">Página de Pruebas</h1>
              <p className="text-slate-400">Selecciona un rol para acceder directamente al sistema</p>
            </div>
            <Zap className="w-12 h-12 text-orange-500 opacity-20" />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Tabs */}
        <div className="mb-8 flex gap-3">
          {(['conductor', 'despachador', 'administrador'] as UserRole[]).map((role) => {
            const roleLabel: Record<UserRole, string> = {
              conductor: 'Conductor',
              despachador: 'Despachador',
              administrador: 'Administrador',
            }
            const isActive = activeTab === role

            return (
              <button
                key={role}
                onClick={() => setActiveTab(role)}
                className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                  isActive
                    ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/50'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700'
                }`}
              >
                {roleLabel[role]}
              </button>
            )
          })}
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-900/20 border border-red-500/50 rounded-lg text-red-200">
            {error}
          </div>
        )}

        {/* Profile Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {filteredAccounts.map((account) => (
            <Card
              key={account.email}
              className="border-slate-700 bg-slate-800/50 hover:bg-slate-800/80 cursor-pointer transition-all hover:shadow-xl hover:shadow-orange-500/10"
              onClick={() => handleQuickLogin(account)}
            >
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="text-orange-500">{account.icon}</div>
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                </div>
                <CardTitle className="text-xl text-white">{account.name}</CardTitle>
                <CardDescription className="text-slate-400">{account.company}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <p className="text-xs text-slate-500 uppercase tracking-wide">Email</p>
                  <p className="text-sm font-mono text-slate-300">{account.email}</p>
                </div>
                <div className="space-y-2">
                  <p className="text-xs text-slate-500 uppercase tracking-wide">Contraseña</p>
                  <p className="text-sm font-mono text-slate-300">•••••••••</p>
                </div>
                <Button
                  onClick={() => handleQuickLogin(account)}
                  disabled={loadingRole === account.role}
                  className="w-full btn-orange mt-4"
                >
                  {loadingRole === account.role ? (
                    <span className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Accediendo...
                    </span>
                  ) : (
                    'Acceder Directamente'
                  )}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Features Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="border-slate-700 bg-slate-800/30">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Clock className="w-5 h-5 text-orange-500" />
                Acceso Rápido
              </CardTitle>
            </CardHeader>
            <CardContent className="text-slate-300">
              <p>
                Haz clic en cualquier perfil para acceder directamente al dashboard con los datos demo ya
                cargados. Perfecto para pruebas y demostraciones.
              </p>
            </CardContent>
          </Card>

          <Card className="border-slate-700 bg-slate-800/30">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Zap className="w-5 h-5 text-orange-500" />
                Tres Roles
              </CardTitle>
            </CardHeader>
            <CardContent className="text-slate-300">
              <p>
                Prueba diferentes funcionalidades según el rol: Conductor, Despachador y Administrador.
                Cada uno con permisos y vistas diferentes.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
