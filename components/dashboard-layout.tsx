"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useRole } from "@/app/providers"
import { Button } from "@/components/ui/button"
import { 
  Menu, 
  X, 
  LogOut, 
  Settings,
  Home,
  BarChart3,
  Users,
  Truck,
  FileText,
  AlertTriangle,
  Shield
} from "lucide-react"

interface NavItem {
  label: string
  href: string
  icon: React.ReactNode
  roles: string[]
}

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { role } = useRole()
  const pathname = usePathname()
  const router = useRouter()

  // Definir navegación según rol
  const navItems: NavItem[] = [
    {
      label: "Dashboard",
      href: role === "admin" ? "/admin" : role === "mandante" ? "/mandante" : role === "transportista" ? "/transportista" : "/conductor",
      icon: <Home className="w-5 h-5" />,
      roles: ["admin", "mandante", "transportista", "conductor"]
    },
    // Admin navigation
    {
      label: "Mandantes",
      href: "/admin/mandantes",
      icon: <Users className="w-5 h-5" />,
      roles: ["admin"]
    },
    {
      label: "Transportistas",
      href: "/admin/transportistas",
      icon: <Truck className="w-5 h-5" />,
      roles: ["admin"]
    },
    {
      label: "Conductores",
      href: "/admin/conductores",
      icon: <Users className="w-5 h-5" />,
      roles: ["admin"]
    },
    {
      label: "Vehículos",
      href: "/admin/vehiculos",
      icon: <Truck className="w-5 h-5" />,
      roles: ["admin"]
    },
    {
      label: "Documentos",
      href: "/admin/documentos",
      icon: <FileText className="w-5 h-5" />,
      roles: ["admin"]
    },
    {
      label: "Roles & Permisos",
      href: "/admin/roles",
      icon: <Shield className="w-5 h-5" />,
      roles: ["admin"]
    },
    {
      label: "Reportes",
      href: "/admin/reportes",
      icon: <BarChart3 className="w-5 h-5" />,
      roles: ["admin"]
    },
    // Mandante navigation
    {
      label: "Transportistas",
      href: "/mandante/transportistas",
      icon: <Truck className="w-5 h-5" />,
      roles: ["mandante"]
    },
    {
      label: "Alertas",
      href: "/mandante/alertas",
      icon: <AlertTriangle className="w-5 h-5" />,
      roles: ["mandante"]
    },
    {
      label: "Reportes",
      href: "/mandante/reportes",
      icon: <BarChart3 className="w-5 h-5" />,
      roles: ["mandante"]
    },
    // Transportista navigation
    {
      label: "Conductores",
      href: "/transportista/conductores",
      icon: <Users className="w-5 h-5" />,
      roles: ["transportista"]
    },
    {
      label: "Vehículos",
      href: "/transportista/vehiculos",
      icon: <Truck className="w-5 h-5" />,
      roles: ["transportista"]
    },
    {
      label: "Subir Documentos",
      href: "/transportista/upload",
      icon: <FileText className="w-5 h-5" />,
      roles: ["transportista"]
    },
    // Conductor navigation
    {
      label: "Mis Documentos",
      href: "/conductor/documentos",
      icon: <FileText className="w-5 h-5" />,
      roles: ["conductor"]
    },
    {
      label: "Subir Documento",
      href: "/conductor/upload",
      icon: <FileText className="w-5 h-5" />,
      roles: ["conductor"]
    },
  ]

  const filteredItems = navItems.filter(item => item.roles.includes(role || ""))
  
  const isActive = (href: string) => pathname === href || pathname.startsWith(href + "/")

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" })
    router.push("/auth/login")
  }

  return (
    <div className="flex h-screen bg-gradient-dark text-foreground overflow-hidden">
      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-gradient-to-b from-slate-900 to-slate-950 border-r border-slate-700/50 transform transition-transform duration-300 ease-in-out ${
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      } md:translate-x-0 md:fixed md:inset-y-0 md:left-0 md:z-40`}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center gap-3 p-6 border-b border-slate-700/50">
            <div className="w-9 h-9 rounded-lg gradient-accent flex items-center justify-center">
              <FileText className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="font-bold text-lg text-foreground">DocuFleet</div>
              <div className="text-xs text-accent font-semibold capitalize">{role}</div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto px-4 py-6 space-y-2">
            {filteredItems.map((item) => (
              <Link key={item.href} href={item.href}>
                <button
                  onClick={() => setSidebarOpen(false)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                    isActive(item.href)
                      ? "bg-orange-500/20 text-orange-300 border border-orange-500/30"
                      : "text-muted-foreground hover:bg-slate-800 border border-transparent"
                  }`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </button>
              </Link>
            ))}
          </nav>

          {/* Settings & Logout */}
          <div className="border-t border-slate-700/50 p-4 space-y-2">
            <Link href="/settings">
              <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-muted-foreground hover:bg-slate-800 transition-all">
                <Settings className="w-5 h-5" />
                <span>Configuración</span>
              </button>
            </Link>
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-red-400 hover:bg-red-500/10 transition-all"
            >
              <LogOut className="w-5 h-5" />
              <span>Cerrar Sesión</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col md:ml-64">
        {/* Top bar */}
        <header className="sticky top-0 z-40 border-b border-slate-700/50 bg-gradient-to-r from-slate-900 to-slate-950 px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="md:hidden p-2 hover:bg-slate-800 rounded-lg transition-colors"
            >
              {sidebarOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
            <div className="flex-1" />
            <div className="flex items-center gap-4">
              <Link href="/settings">
                <button className="p-2 hover:bg-slate-800 rounded-lg transition-colors">
                  <Settings className="w-5 h-5 text-muted-foreground" />
                </button>
              </Link>
              <button
                onClick={handleLogout}
                className="p-2 hover:bg-red-500/10 rounded-lg transition-colors"
              >
                <LogOut className="w-5 h-5 text-red-400" />
              </button>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
        />
      )}
    </div>
  )
}
