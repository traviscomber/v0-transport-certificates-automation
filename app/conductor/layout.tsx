import { LogOut, LayoutDashboard, FileText, Clock, Settings, Home } from "lucide-react"
import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"

const navItems = [
  { href: "/conductor", label: "Dashboard", icon: Home },
  { href: "/conductor/documentos", label: "Mis Documentos", icon: FileText },
  { href: "/conductor/perfil", label: "Mi Perfil", icon: Settings },
]

export default async function ConductorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Sidebar */}
      <aside className="w-64 border-r border-slate-200 bg-white shadow-sm flex flex-col">
        {/* Logo */}
        <div className="p-6 border-b border-slate-200">
          <Link href="/conductor" className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
              <FileText className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="font-bold text-slate-900">Labbe</p>
              <p className="text-xs text-slate-500">Conductor</p>
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
                className="flex items-center gap-3 rounded-lg px-4 py-3 text-sm transition-all hover:bg-blue-50 text-slate-700 hover:text-blue-600 group"
              >
                <Icon className="h-4 w-4 group-hover:text-blue-600" />
                {item.label}
              </Link>
            )
          })}
        </nav>

        {/* Info Card */}
        <div className="p-4 border-t border-slate-200">
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-100">
            <p className="text-xs font-semibold text-slate-900 mb-2">Soporte</p>
            <p className="text-xs text-slate-600">soporte@labbe.cl</p>
            <p className="text-xs text-slate-600 mt-1">+56977764753</p>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-white border-b border-slate-200 shadow-sm">
          <div className="px-8 py-4 flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Portal de Documentos</h1>
              <p className="text-sm text-slate-500">Gestiona tu documentación para trabajar con Labbe</p>
            </div>
            <div className="flex items-center gap-4">
              <button className="text-slate-500 hover:text-slate-700 transition-colors">
                <Settings className="h-5 w-5" />
              </button>
              <button className="text-slate-500 hover:text-red-600 transition-colors">
                <LogOut className="h-5 w-5" />
              </button>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-auto p-8">
          {children}
        </div>
      </main>
    </div>
  )
}
