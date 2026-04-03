'use client'

// Cache buster v5: Force webpack module reload for User icon fix
import { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/lib/auth-context'
import {
  LayoutDashboard,
  FileText,
  Users,
  Truck,
  Bell,
  BarChart3,
  Settings,
  LogOut,
  Menu,
  X,
  Building2,
  Shield,
  Upload,
  CheckCircle,
  AlertTriangle,
  User,
} from 'lucide-react'

interface NavItem {
  label: string
  href: string
  icon: React.ReactNode
  roles?: string[]
}

const navItems: NavItem[] = [
  { label: 'Dashboard', href: '/dashboard', icon: <LayoutDashboard className="h-5 w-5" /> },
  { label: 'Certificados', href: '/certificates', icon: <FileText className="h-5 w-5" /> },
  { label: 'Conductores', href: '/drivers-management', icon: <Users className="h-5 w-5" />, roles: ['admin', 'dispatcher', 'transportista'] },
  { label: 'Vehiculos', href: '/vehicles-management', icon: <Truck className="h-5 w-5" />, roles: ['admin', 'dispatcher', 'transportista'] },
  { label: 'Organizaciones', href: '/organizations', icon: <Building2 className="h-5 w-5" />, roles: ['admin', 'mandante'] },
  { label: 'Subir Documentos', href: '/upload', icon: <Upload className="h-5 w-5" /> },
  { label: 'Validacion OCR', href: '/walmart-ocr', icon: <CheckCircle className="h-5 w-5" /> },
  { label: 'Alertas', href: '/alerts', icon: <Bell className="h-5 w-5" /> },
  { label: 'Reportes', href: '/reports', icon: <BarChart3 className="h-5 w-5" /> },
  { label: 'Compliance', href: '/compliance', icon: <Shield className="h-5 w-5" />, roles: ['admin', 'mandante'] },
]

const adminItems: NavItem[] = [
  { label: 'Admin', href: '/admin', icon: <Settings className="h-5 w-5" />, roles: ['admin'] },
]

const settingsItems: NavItem[] = [
  { label: 'Mi Perfil', href: '/settings/profile', icon: <User className="h-5 w-5" /> },
]

export function DashboardSidebar() {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()
  const router = useRouter()
  const { user, loading, logout } = useAuth()

  // Mostrar loading mientras se verifica el usuario
  if (loading) {
    return (
      <aside className="fixed top-0 left-0 z-40 h-screen w-64 bg-slate-900 border-r border-slate-700/50 flex items-center justify-center">
        <div className="text-slate-400">Cargando...</div>
      </aside>
    )
  }

  // Si no hay usuario, no mostrar sidebar
  if (!user) {
    return null
  }

  const userRole = user.role
  const userName = user.full_name || user.email

  const filteredNavItems = navItems.filter(item => {
    if (!item.roles) return true
    return item.roles.includes(userRole)
  })

  const filteredAdminItems = adminItems.filter(item => {
    if (!item.roles) return true
    return item.roles.includes(userRole)
  })

  const roleLabels: Record<string, string> = {
    admin: 'Administrador',
    dispatcher: 'Despachador',
    driver: 'Conductor',
    mandante: 'Mandante',
    transportista: 'Transportista',
  }

  const handleLogout = async () => {
    try {
      await logout()
      setIsOpen(false)
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  return (
    <>
      {/* Mobile menu button */}
      <Button
        variant="ghost"
        size="icon"
        className="fixed top-4 left-4 z-50 md:hidden"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </Button>

      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed top-0 left-0 z-40 h-screen w-64 transition-transform duration-300 ease-in-out',
          'bg-slate-900 border-r border-slate-700/50',
          isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        )}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center gap-3 p-6 border-b border-slate-700/50">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center">
              <FileText className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-white">DocuFleet</h1>
              <p className="text-xs text-slate-400">by Segur-ia</p>
            </div>
          </div>

          {/* User info */}
          <div className="p-4 border-b border-slate-700/50 hover:bg-slate-800/50 transition-colors cursor-pointer">
            <Link href="/profile" className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center text-white font-bold">
                {userName.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="text-sm font-medium text-white truncate">{userName}</p>
                <p className="text-xs text-slate-400">{roleLabels[userRole] || userRole}</p>
              </div>
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Menu Principal</p>
            {filteredNavItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all',
                  pathname === item.href
                    ? 'bg-orange-500/20 text-orange-400 font-medium'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                )}
              >
                {item.icon}
                {item.label}
              </Link>
            ))}

            {filteredAdminItems.length > 0 && (
              <>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mt-6 mb-3">Administracion</p>
                {filteredAdminItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsOpen(false)}
                    className={cn(
                      'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all',
                      pathname === item.href
                        ? 'bg-orange-500/20 text-orange-400 font-medium'
                        : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                    )}
                  >
                    {item.icon}
                    {item.label}
                  </Link>
                ))}
              </>
            )}

            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mt-6 mb-3">Configuracion</p>
            {settingsItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all',
                  pathname === item.href
                    ? 'bg-orange-500/20 text-orange-400 font-medium'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                )}
              >
                {item.icon}
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Logout */}
          <div className="p-4 border-t border-slate-700/50">
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start text-slate-300 hover:bg-slate-800 hover:text-white"
              onClick={handleLogout}
            >
              <LogOut className="h-5 w-5 mr-3" />
              Cerrar Sesión
            </Button>
          </div>
        </div>
      </aside>
    </>
  )
}
