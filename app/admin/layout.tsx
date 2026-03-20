"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Building2, Truck, Users, Car, FileText, LayoutDashboard, Settings } from "lucide-react"

const navItems = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/mandantes", label: "Mandantes", icon: Building2 },
  { href: "/admin/transportistas", label: "Transportistas", icon: Truck },
  { href: "/admin/vehiculos", label: "Vehiculos", icon: Car },
  { href: "/admin/conductores", label: "Conductores", icon: Users },
  { href: "/admin/documentos", label: "Documentos", icon: FileText },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex h-16 items-center px-6">
          <Link href="/admin" className="flex items-center gap-2 font-semibold">
            <Truck className="h-6 w-6 text-primary" />
            <span>TransportesLabbe</span>
          </Link>
          <nav className="ml-8 flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href || 
                (item.href !== "/admin" && pathname.startsWith(item.href))
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                    isActive 
                      ? "bg-primary text-primary-foreground" 
                      : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Link>
              )
            })}
          </nav>
          <div className="ml-auto flex items-center gap-4">
            <Link 
              href="/walmart-ocr" 
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              Portal OCR
            </Link>
            <button className="rounded-full p-2 hover:bg-accent">
              <Settings className="h-5 w-5 text-muted-foreground" />
            </button>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="p-6">
        {children}
      </main>
    </div>
  )
}
