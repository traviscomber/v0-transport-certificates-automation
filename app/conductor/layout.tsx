import { LogOut, LayoutDashboard, FileText, Clock, Settings, Home } from "lucide-react"
import Link from "next/link"

const navItems = [
  { href: "/conductor", label: "Dashboard", icon: Home },
  { href: "/conductor/documentos", label: "Mis Documentos", icon: FileText },
  { href: "/conductor/perfil", label: "Mi Perfil", icon: Settings },
  { href: "/conductor/onboarding", label: "Guía de Inicio", icon: Clock },
]

export default function ConductorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex h-screen bg-slate-900">
      {/* Sidebar - Dark theme with brand orange accents */}
      <aside className="w-64 border-r border-slate-700 bg-slate-950 shadow-lg flex flex-col">
        {/* Logo */}
        <div className="p-6 border-b border-slate-700">
          <Link href="/conductor" className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center shadow-lg">
              <FileText className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="font-bold text-white">Labbe</p>
              <p className="text-xs text-slate-400">Conductor</p>
            </div>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-3 rounded-lg px-4 py-3 text-sm transition-all hover:bg-slate-800 text-slate-300 hover:text-orange-400 hover:bg-slate-800/50 group"
              >
                <Icon className="h-4 w-4 group-hover:text-orange-400" />
                {item.label}
              </Link>
            )
          })}
        </nav>

        {/* Info Card */}
        <div className="p-4 border-t border-slate-700">
          <div className="bg-gradient-to-br from-orange-950/40 to-orange-900/20 rounded-lg p-4 border border-orange-900/50">
            <p className="text-xs font-semibold text-orange-300 mb-2">Soporte</p>
            <p className="text-xs text-slate-300">soporte@labbe.cl</p>
            <p className="text-xs text-slate-300 mt-1">+56977764753</p>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col bg-slate-900">
        {/* Header */}
        <header className="bg-slate-950/50 border-b border-slate-700 shadow-sm backdrop-blur-sm">
          <div className="px-8 py-4 flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-white">Portal de Documentos</h1>
              <p className="text-sm text-slate-400">Gestiona tu documentación para trabajar con Labbe</p>
            </div>
            <div className="flex items-center gap-4">
              <button className="text-slate-400 hover:text-orange-400 transition-colors">
                <Settings className="h-5 w-5" />
              </button>
              <button className="text-slate-400 hover:text-red-400 transition-colors">
                <LogOut className="h-5 w-5" />
              </button>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-auto p-8 bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800">
          {children}
        </div>
      </main>
    </div>
  )
}
