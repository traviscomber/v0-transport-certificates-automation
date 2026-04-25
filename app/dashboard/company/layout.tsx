'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import { LayoutDashboard, Zap, Wrench, Package, Shield, FileText, ShoppingCart, DollarSign, BarChart3, LogOut, AlertTriangle, Brain, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'

const navItems = [
  { href: '/dashboard/company', label: 'Centro de Operaciones', icon: LayoutDashboard },
  // Operación Crítica
  { href: '/dashboard/company/produccion', label: 'Producción', icon: Zap },
  { href: '/dashboard/company/mantencion', label: 'Mantención', icon: Wrench },
  { href: '/dashboard/company/bodega', label: 'Bodega', icon: Package },
  { href: '/dashboard/company/hse', label: 'HSE / Seguridad', icon: Shield },
  { href: '/dashboard/company/documentos', label: 'Documentos', icon: FileText },
  // Gestión Empresarial
  { href: '/dashboard/company/compras', label: 'Compras', icon: ShoppingCart },
  { href: '/dashboard/company/finanzas', label: 'Finanzas', icon: DollarSign },
  { href: '/dashboard/company/reportes', label: 'Reportes IA', icon: BarChart3 },
  { href: '/dashboard/company/usuarios', label: 'Usuarios', icon: Users },
  // Herramientas
  { href: '/dashboard/company/alertas', label: 'Alertas', icon: AlertTriangle },
  { href: '/dashboard/company/asistente', label: 'Asistente IA', icon: Brain },
]

export default function CompanyLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()

  const handleLogout = async () => {
    try {
      await fetch('/api/logout', { method: 'POST' })
      router.push('/login')
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <div className="w-64 border-r bg-card">
        <div className="p-6 border-b">
          <h2 className="text-lg font-bold">N3uralia ERP Minería</h2>
          <p className="text-xs text-muted-foreground mt-1">Cía. Minera La Patagua</p>
        </div>

        <nav className="p-4 space-y-2">
          {navItems.map(item => {
            const Icon = item.icon
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
            
            return (
              <Link key={item.href} href={item.href}>
                <button
                  className={cn(
                    'w-full flex items-center gap-3 px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:bg-accent'
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </button>
              </Link>
            )
          })}
        </nav>

        <div className="p-4 border-t mt-auto">
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full"
            onClick={handleLogout}
          >
            <LogOut className="mr-2 h-4 w-4" />
            Cerrar Sesión
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-auto p-8">
          {children}
        </main>
      </div>
    </div>
  )
}
