'use client'

export const dynamic = 'force-dynamic'
export const revalidate = 0

import { useState } from 'react'
import { useAuth } from '@/lib/auth-context'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { User, Shield, Lock, Bell, LogOut } from 'lucide-react'

export default function ProfilePage() {
  const { user, logout, loading } = useAuth()
  const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'preferences'>('profile')

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-slate-400">Cargando perfil...</div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-red-500">No autenticado</div>
      </div>
    )
  }

  const roleColors: Record<string, string> = {
    admin: 'bg-red-500/20 text-red-300 border-red-500/30',
    dispatcher: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
    transportista: 'bg-green-500/20 text-green-300 border-green-500/30',
    driver: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
    mandante: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Mi Perfil</h1>
        <p className="text-slate-400">Gestiona tu información personal y preferencias</p>
      </div>

      {/* Tabs */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <button
          onClick={() => setActiveTab('profile')}
          className={`p-3 rounded-lg border transition-all ${
            activeTab === 'profile'
              ? 'border-orange-500 bg-orange-500/10 text-orange-400'
              : 'border-slate-700 text-slate-400 hover:text-white'
          }`}
        >
          <User className="h-5 w-5 mx-auto mb-2" />
          <span className="text-sm font-medium">Perfil</span>
        </button>
        <button
          onClick={() => setActiveTab('security')}
          className={`p-3 rounded-lg border transition-all ${
            activeTab === 'security'
              ? 'border-orange-500 bg-orange-500/10 text-orange-400'
              : 'border-slate-700 text-slate-400 hover:text-white'
          }`}
        >
          <Lock className="h-5 w-5 mx-auto mb-2" />
          <span className="text-sm font-medium">Seguridad</span>
        </button>
        <button
          onClick={() => setActiveTab('preferences')}
          className={`p-3 rounded-lg border transition-all ${
            activeTab === 'preferences'
              ? 'border-orange-500 bg-orange-500/10 text-orange-400'
              : 'border-slate-700 text-slate-400 hover:text-white'
          }`}
        >
          <Bell className="h-5 w-5 mx-auto mb-2" />
          <span className="text-sm font-medium">Preferencias</span>
        </button>
      </div>

      {/* Profile Tab */}
      {activeTab === 'profile' && (
        <div className="space-y-6">
          {/* User Info Card */}
          <Card className="border-slate-700/50 bg-gradient-to-br from-slate-800/30 to-slate-900/30">
            <CardHeader>
              <CardTitle className="text-white">Información Personal</CardTitle>
              <CardDescription>Detalles de tu cuenta</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Avatar */}
              <div className="flex items-center gap-6 p-6 rounded-lg bg-slate-800/50 border border-slate-700/50">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center text-white text-2xl font-bold">
                  {user.full_name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="text-sm text-slate-400">Avatar</p>
                  <p className="text-white font-medium">{user.full_name}</p>
                </div>
              </div>

              {/* Info Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                <div className="p-4 rounded-lg bg-slate-800/50">
                  <label className="text-xs font-medium text-slate-400 uppercase">Nombre Completo</label>
                  <p className="text-white mt-1">{user.full_name}</p>
                </div>
                <div className="p-4 rounded-lg bg-slate-800/50">
                  <label className="text-xs font-medium text-slate-400 uppercase">Email</label>
                  <p className="text-white mt-1">{user.email}</p>
                </div>
                <div className="p-4 rounded-lg bg-slate-800/50">
                  <label className="text-xs font-medium text-slate-400 uppercase">Rol</label>
                  <div className="mt-1">
                    <Badge className={`${roleColors[user.role] || 'bg-slate-600'}`}>
                      {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                    </Badge>
                  </div>
                </div>
                <div className="p-4 rounded-lg bg-slate-800/50">
                  <label className="text-xs font-medium text-slate-400 uppercase">ID Usuario</label>
                  <p className="text-white text-xs font-mono mt-1 truncate">{user.id}</p>
                </div>
              </div>

              <div className="pt-4">
                <Button className="w-full bg-orange-500 hover:bg-orange-600">
                  Editar Perfil
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Security Tab */}
      {activeTab === 'security' && (
        <div className="space-y-6">
          <Card className="border-slate-700/50 bg-gradient-to-br from-slate-800/30 to-slate-900/30">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Seguridad
              </CardTitle>
              <CardDescription>Gestiona tu seguridad y contraseña</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 rounded-lg bg-slate-800/50 border border-slate-700/50">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white font-medium">Cambiar Contraseña</p>
                    <p className="text-sm text-slate-400">Actualiza tu contraseña regularmente</p>
                  </div>
                  <Button variant="outline" className="border-slate-600">
                    Cambiar
                  </Button>
                </div>
              </div>

              <div className="p-4 rounded-lg bg-slate-800/50 border border-slate-700/50">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white font-medium">Autenticación de Dos Factores</p>
                    <p className="text-sm text-slate-400">Aumenta la seguridad de tu cuenta</p>
                  </div>
                  <Badge variant="outline" className="border-slate-600 text-slate-400">
                    Deshabilitado
                  </Badge>
                </div>
              </div>

              <div className="pt-4">
                <p className="text-sm text-slate-400 mb-3">Sesiones activas</p>
                <div className="p-4 rounded-lg bg-slate-800/50 border border-slate-700/50">
                  <p className="text-white text-sm">Esta sesión</p>
                  <p className="text-xs text-slate-400 mt-1">Dispositivo actual</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Preferences Tab */}
      {activeTab === 'preferences' && (
        <div className="space-y-6">
          <Card className="border-slate-700/50 bg-gradient-to-br from-slate-800/30 to-slate-900/30">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Preferencias
              </CardTitle>
              <CardDescription>Personaliza tu experiencia</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 rounded-lg bg-slate-800/50 border border-slate-700/50 flex items-center justify-between">
                <div>
                  <p className="text-white font-medium">Notificaciones por Email</p>
                  <p className="text-sm text-slate-400">Recibe actualizaciones por correo</p>
                </div>
                <input type="checkbox" className="rounded" defaultChecked />
              </div>

              <div className="p-4 rounded-lg bg-slate-800/50 border border-slate-700/50 flex items-center justify-between">
                <div>
                  <p className="text-white font-medium">Tema Oscuro</p>
                  <p className="text-sm text-slate-400">Usa tema oscuro por defecto</p>
                </div>
                <input type="checkbox" className="rounded" defaultChecked />
              </div>

              <div className="p-4 rounded-lg bg-slate-800/50 border border-slate-700/50">
                <p className="text-white font-medium mb-2">Idioma</p>
                <select className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white text-sm">
                  <option>Español</option>
                  <option>English</option>
                  <option>Português</option>
                </select>
              </div>

              <div className="pt-4">
                <Button className="w-full bg-orange-500 hover:bg-orange-600">
                  Guardar Preferencias
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Logout Button */}
      <div className="mt-12 pt-8 border-t border-slate-700/50">
        <Button
          variant="outline"
          className="w-full border-red-500/30 text-red-400 hover:bg-red-500/10"
          onClick={logout}
        >
          <LogOut className="h-5 w-5 mr-2" />
          Cerrar Sesión
        </Button>
      </div>
    </div>
  )
}
