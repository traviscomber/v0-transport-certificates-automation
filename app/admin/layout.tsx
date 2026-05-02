"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { FileText, LayoutDashboard, Settings, LogOut, Shield, BarChart3, UsersIcon, Lock } from "lucide-react"

const navItems = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/usuarios", label: "Usuarios", icon: UsersIcon },
  { href: "/admin/documentos", label: "Documentos", icon: FileText },
  { href: "/admin/roles", label: "Roles y Permisos", icon: Shield },
  { href: "/admin/reportes", label: "Reportes", icon: BarChart3 },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  return (
    <div className="min-h-screen bg-gradient-dark">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-screen w-64 border-r border-slate-700/50 bg-gradient-to-b from-slate-900 to-slate-950 text-white shadow-2xl">
        <div className="flex h-16 items-center px-6 border-b border-slate-700/30">
          <Link href="/admin" className="flex items-center gap-3 font-bold text-lg group">
            <div className="w-9 h-9 rounded-lg gradient-accent flex items-center justify-center shadow-lg glow-orange group-hover:scale-110 transition-transform">
              <Lock className="w-5 h-5 text-white font-bold" />
            </div>
            <div className="group-hover:text-orange-400 transition-colors">
              <div>DocuFleet</div>
              <div className="text-xs text-orange-400">Panel Admin</div>
            </div>
          </Link>
        </div>

        <nav className="space-y-1 p-3 mt-4">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href || 
              (item.href !== "/admin" && pathname.startsWith(item.href))
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-4 py-2.5 text-sm font-medium transition-all duration-200",
                  isActive 
                    ? "bg-gradient-accent text-white shadow-lg glow-orange" 
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
                )}
              >
                <Icon className="w-5 h-5 shrink-0" />
                <span>{item.label}</span>
              </Link>
            )
          })}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-slate-700/30 bg-gradient-to-t from-slate-950 to-transparent">
          <button className="flex items-center gap-3 w-full rounded-lg px-4 py-2.5 text-sm text-slate-400 hover:text-slate-200 hover:bg-red-500/20 transition-all group">
            <LogOut className="w-5 h-5 group-hover:text-red-400 transition-colors" />
            <span className="group-hover:text-red-400 transition-colors">Cerrar Sesion</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="ml-64 flex flex-col min-h-screen">
        {/* Top Bar */}
        <header className="sticky top-0 z-40 h-16 border-b border-slate-700/50 bg-slate-900/80 backdrop-blur-md shadow-lg">
          <div className="flex h-full items-center justify-between px-8">
            <div>
              <h1 className="text-lg font-bold text-foreground">
                {navItems.find(item => pathname === item.href || pathname.startsWith(item.href))?.label || 'Dashboard'}
              </h1>
              <p className="text-xs text-muted-foreground">
                {pathname === "/admin" ? "Resumen general del sistema" : "Administracion de datos"}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-gradient-accent flex items-center justify-center cursor-pointer hover:shadow-lg hover:glow-orange transition-all">
                <span className="text-sm font-bold text-white">AD</span>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto">
          <div className="p-8 space-y-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
