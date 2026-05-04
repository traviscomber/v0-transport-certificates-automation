'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import { LayoutDashboard, Users, FileText, BarChart3, LogOut, Zap, AlertTriangle, Users2, Lock, TrendingUp, UserPlus, Menu, Bell, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { NotificationCenter } from '@/components/notification-center'
import { useState } from 'react'

const navItems = [
  { href: '/dashboard/company', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/dashboard/company/equipo', label: 'Gestión de Equipo', icon: Users2 },
  { href: '/dashboard/company/subcontratistas', label: 'Subcontratistas', icon: Zap },
  { href: '/dashboard/company/conductores', label: 'Conductores', icon: Users },
  { href: '/dashboard/company/documentos', label: 'Documentos', icon: FileText },
  { href: '/admin/postulantes', label: 'Postulantes', icon: UserPlus },
  { href: '/dashboard/company/analytics/conductores', label: 'Analytics', icon: TrendingUp },
  { href: '/dashboard/company/alertas', label: 'Alertas', icon: AlertTriangle },
  { href: '/dashboard/company/reportes', label: 'Reportes', icon: BarChart3 },
  { href: '/admin/metrics', label: 'Métricas de Usuarios', icon: Lock },
]

export default function CompanyLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const handleLogout = async () => {
    try {
      await fetch('/api/logout', { method: 'POST' })
      router.push('/login')
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  const SidebarContent = () => (
    <>
      <div className="p-4 md:p-6 border-b bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900">
        <h2 className="text-lg md:text-xl font-bold text-white">Transportes Labbé</h2>
        <p className="text-xs md:text-sm text-slate-300 mt-1">Portal de Empresa</p>
      </div>

      <nav className="p-3 md:p-4 space-y-1 flex-1 overflow-y-auto">
        {navItems.map(item => {
          const Icon = item.icon
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
          
          return (
            <Link key={item.href} href={item.href}>
              <button
                onClick={() => setSidebarOpen(false)}
                className={cn(
                  'w-full flex items-center gap-3 px-3 md:px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-orange-500 text-white'
                    : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                )}
              >
                <Icon className="h-4 w-4 flex-shrink-0" />
                <span className="hidden sm:inline">{item.label}</span>
              </button>
            </Link>
          )
        })}
      </nav>

      <div className="p-3 md:p-4 border-t">
        <Button 
          variant="outline" 
          size="sm" 
          className="w-full justify-start"
          onClick={handleLogout}
        >
          <LogOut className="mr-2 h-4 w-4 flex-shrink-0" />
          <span className="hidden sm:inline">Cerrar Sesión</span>
        </Button>
      </div>
    </>
  )

  return (
    <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
      <div className="flex h-screen bg-background flex-col md:flex-row">
        {/* Desktop Sidebar - Fixed on md and up */}
        <div className="hidden md:flex md:w-64 md:flex-col border-r bg-card">
          <SidebarContent />
        </div>

        {/* Mobile Sidebar - Drawer */}
        <SheetContent side="left" className="w-64 p-0 flex flex-col">
          <SidebarContent />
        </SheetContent>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Header */}
          <div className="border-b bg-card px-3 md:px-6 py-3 md:py-4 flex items-center justify-between gap-4 sticky top-0 z-30">
            {/* Mobile menu button */}
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>

            {/* Brand info - Mobile */}
            <div className="flex-1 md:hidden min-w-0">
              <h1 className="text-sm font-bold text-foreground truncate">Transportes Labbé</h1>
              <p className="text-xs text-muted-foreground truncate">Portal de Empresa</p>
            </div>

            {/* Right side - Notifications and close button */}
            <div className="flex items-center gap-2 md:gap-4">
              <NotificationCenter />
            </div>
          </div>
          
          {/* Main content */}
          <main className="flex-1 overflow-auto p-3 md:p-6 lg:p-8">
            <div className="mx-auto w-full max-w-7xl">
              {children}
            </div>
          </main>
        </div>
      </div>
    </Sheet>
  )
}
