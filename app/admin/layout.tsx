"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Building2, Truck, Users, Car, FileText, LayoutDashboard, Settings, LogOut, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"

const navItems = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/mandantes", label: "Mandantes", icon: Building2 },
  { href: "/admin/transportistas", label: "Transportistas", icon: Truck },
  { href: "/admin/vehiculos", label: "Vehículos", icon: Car },
  { href: "/admin/conductores", label: "Conductores", icon: Users },
  { href: "/admin/documentos", label: "Documentos", icon: FileText },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  return (
    <div className="min-h-screen bg-[#F9F9FB]">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-screen w-64 border-r border-[#E4E4E7] bg-gradient-to-b from-[#0A2540] to-[#0D3050] text-white shadow-lg">
        <div className="flex h-16 items-center px-6 border-b border-white/10">
          <Link href="/admin" className="flex items-center gap-3 font-bold text-lg">
            <div className="w-8 h-8 rounded-lg bg-[#0066FF] flex items-center justify-center">
              <Truck className="w-5 h-5 text-white" />
            </div>
            <span>DocuFleet</span>
          </Link>
        </div>

        <nav className="space-y-2 p-4">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href || 
              (item.href !== "/admin" && pathname.startsWith(item.href))
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-4 py-2.5 text-sm font-medium transition-all duration-150",
                  isActive 
                    ? "bg-[#0066FF] text-white shadow-lg" 
                    : "text-white/60 hover:text-white hover:bg-white/10"
                )}
              >
                <Icon className="w-5 h-5" />
                <span>{item.label}</span>
              </Link>
            )
          })}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-white/10">
          <button className="flex items-center gap-3 w-full rounded-lg px-4 py-2.5 text-sm text-white/60 hover:text-white hover:bg-white/10 transition-all">
            <LogOut className="w-5 h-5" />
            <span>Cerrar Sesión</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="ml-64 flex flex-col min-h-screen">
        {/* Top Bar */}
        <header className="sticky top-0 z-40 h-16 border-b border-[#E4E4E7] bg-white shadow-sm">
          <div className="flex h-full items-center justify-between px-8">
            <div>
              <h1 className="text-lg font-semibold text-[#18181B]">
                {navItems.find(item => pathname === item.href || pathname.startsWith(item.href))?.label || 'Dashboard'}
              </h1>
            </div>
            <div className="flex items-center gap-6">
              <button className="relative group">
                <img 
                  src="https://api.dicebear.com/7.x/avataaars/svg?seed=admin" 
                  alt="Avatar"
                  className="w-8 h-8 rounded-full"
                />
              </button>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto">
          <div className="p-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
