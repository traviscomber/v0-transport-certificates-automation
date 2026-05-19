'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'
import { LayoutDashboard, Users, FileText, BarChart3, LogOut, Zap, Users2, Lock, TrendingUp, Menu, Bell, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { NotificationCenter } from '@/components/notification-center'
import { CompanyHeader } from '@/components/layout/company-header'

const navItems = [
  { href: '/dashboard/company', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/dashboard/company/equipo', label: 'Gestión de Equipo', icon: Users2 },
  { href: '/dashboard/company/subcontratistas', label: 'Subcontratistas', icon: Zap },
  { href: '/dashboard/company/conductores', label: 'Conductores', icon: Users },
  { href: '/dashboard/company/documentos', label: 'Documentos', icon: FileText },
  { href: '/dashboard/company/analytics/conductores', label: 'Analytics', icon: TrendingUp },
  { href: '/dashboard/company/reportes', label: 'Reportes', icon: BarChart3 },
  { href: '/admin/metrics', label: 'Métricas de Usuarios', icon: Lock },
]

export default function CompanyLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [hasAccess, setHasAccess] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check if user has a simple email login (ejecutivas, subcontratistas, conductores via /login)
    const userEmail = document.cookie
      .split('; ')
      .find(row => row.startsWith('user_email='))
      ?.split('=')[1]
    
    if (userEmail) {
      setHasAccess(true)
    }
    setIsLoading(false)
  }, [])

  useEffect(() => {
    if (!isLoading && !hasAccess) {
      router.push('/login')
    }
  }, [isLoading, hasAccess, router])

  if (isLoading || !hasAccess) {
    return null
  }

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
      <div className="p-4 md:p-6 border-b bg-slate-900/80 shadow-sm">
        <h2 className="text-lg md:text-xl font-bold text-white">Transportes Labbé</h2>
        <p className="text-xs md:text-sm text-slate-300 mt-1">Portal de Empresa</p>
      </div>

      <nav className="p-3 md:p-4 space-y-1 flex-1 overflow-y-auto bg-slate-900/60">
        {navItems.map(item => {
          const Icon = item.icon
          // Exact match only - no prefix matching to avoid Dashboard being highlighted for all /dashboard/company/* routes
          const isActive = pathname === item.href
          
          return (
            <Link key={item.href} href={item.href}>
              <button
                onClick={() => setSidebarOpen(false)}
                className={cn(
                  'w-full flex items-center gap-3 px-3 md:px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-orange-500 text-white'
                    : 'text-white hover:bg-slate-800/50 hover:text-white'
                )}
              >
                <Icon className="h-4 w-4 flex-shrink-0" />
                <span className="hidden sm:inline text-white">{item.label}</span>
              </button>
            </Link>
          )
        })}
      </nav>

      <div className="p-3 md:p-4 border-t border-slate-700 bg-slate-900/60">
        <Button 
          variant="outline" 
          size="sm" 
          className="w-full justify-start text-white border-slate-600 hover:bg-slate-800 hover:text-white"
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
          {/* Header - New Naranja Header */}
          <CompanyHeader />
          
          {/* Main content */}
          <main className="flex-1 overflow-auto p-3 md:p-6 lg:p-8">
            {children}
          </main>
        </div>
      </div>
    </Sheet>
  )
}
