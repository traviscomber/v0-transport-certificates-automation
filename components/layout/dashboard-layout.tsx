"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import type { User } from "@supabase/supabase-js"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import {
  FileText,
  Upload,
  Users,
  Settings,
  Menu,
  LogOut,
  Shield,
  Truck,
  CheckSquare,
  ChevronDown,
  ChevronRight,
  BarChart3,
  FolderOpen,
  Zap,
  TrendingUp,
  Camera,
  Bell,
  X,
} from "lucide-react"

const navigationGroups = [
  {
    name: "Panel Principal",
    items: [{ name: "Resumen", href: "/dashboard", icon: BarChart3 }],
  },
  {
    name: "Funciones IA",
    items: [
      { name: "Escáner Inteligente", href: "/ai-scanner", icon: Zap },
      { name: "Captura Móvil", href: "/mobile-capture", icon: Camera },
      { name: "Análisis Predictivo", href: "/analytics", icon: TrendingUp },
      { name: "Reportes Automáticos", href: "/reports", icon: FileText },
    ],
  },
  {
    name: "Certificados de Transporte",
    items: [
      { name: "Certificados F-30", href: "/dashboard/f30", icon: FileText },
      { name: "Certificados F-30-1", href: "/dashboard/f30-1", icon: Shield },
    ],
  },
  {
    name: "Documentos Vehiculares",
    items: [
      { name: "Documentos de Máquinas", href: "/dashboard/machines", icon: Truck },
      { name: "Documentos de Muestra", href: "/dashboard/samples", icon: FolderOpen },
    ],
  },
  {
    name: "Gestión de Documentos",
    items: [
      { name: "Subir Documentos", href: "/dashboard/upload", icon: Upload },
      { name: "Verificación", href: "/dashboard/verification", icon: CheckSquare },
    ],
  },
  {
    name: "Administración",
    items: [
      { name: "Transportistas", href: "/dashboard/transporters", icon: Users },
      { name: "Configuración", href: "/dashboard/settings", icon: Settings },
    ],
  },
]

interface DashboardLayoutProps {
  children: React.ReactNode
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [user, setUser] = useState<User | null>(null)
  const [userProfile, setUserProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [isMounted, setIsMounted] = useState(false)
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({
    "Panel Principal": true,
    "Funciones IA": true,
    "Certificados de Transporte": true,
    "Documentos Vehiculares": false,
    "Gestión de Documentos": false,
    Administración: false,
  })

  // Mark component as mounted to prevent hydration mismatch
  useEffect(() => {
    setIsMounted(true)
  }, [])

  useEffect(() => {
    if (!isMounted) return

    const supabase = createClient()

    const getUser = async () => {
      try {
        const { data: { user }, error } = await supabase.auth.getUser()
        
        if (process.env.NODE_ENV === "development") {
          console.log("[v0] Dashboard-Layout - Auth user:", user?.email, "Error:", error)
        }

        setUser(user)

        // Fetch user profile from profiles table
        if (user?.id) {
          try {
            const { data: profile, error: profileError } = await supabase
              .from("profiles")
              .select("full_name, email, role")
              .eq("id", user.id)
              .maybeSingle()

            if (process.env.NODE_ENV === "development") {
              console.log("[v0] Dashboard-Layout - Profile fetched:", profile)
              if (profileError) console.log("[v0] Profile fetch error:", profileError)
            }

            setUserProfile(profile || {})
          } catch (err) {
            if (process.env.NODE_ENV === "development") {
              console.log("[v0] Profile fetch exception:", err)
            }
            setUserProfile({})
          }
        }
      } catch (err) {
        if (process.env.NODE_ENV === "development") {
          console.log("[v0] Auth user fetch error:", err)
        }
      }

      setLoading(false)
    }

    getUser()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      const user = session?.user ?? null
      setUser(user)

      if (process.env.NODE_ENV === "development") {
        console.log("[v0] Dashboard-Layout - Auth state changed:", user?.email, "Event:", event)
      }

      // Fetch profile when auth state changes
      if (user?.id) {
        try {
          const { data: profile } = await supabase
            .from("profiles")
            .select("full_name, email, role")
            .eq("id", user.id)
            .maybeSingle()

          setUserProfile(profile || {})
        } catch (err) {
          if (process.env.NODE_ENV === "development") {
            console.log("[v0] Profile fetch on auth change failed:", err)
          }
          setUserProfile({})
        }
      } else {
        setUserProfile(null)
      }

      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [isMounted])

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    window.location.href = "/login"
  }

  const getUserDisplayName = () => {
    // Only after component is mounted to avoid hydration mismatch
    if (!isMounted) return "Usuario"

    // Check if it's a demo account
    const demoEmails = ["conductor@demo.cl", "despachador@demo.cl", "admin@demo.cl"]
    if (user?.email && demoEmails.includes(user.email)) {
      return "Demo"
    }

    // First, try to use the full_name from profiles table
    if (userProfile?.full_name && userProfile.full_name.trim()) {
      return userProfile.full_name
    }

    // Then try metadata name from auth
    if (user?.user_metadata?.name) {
      return user.user_metadata.name
    }

    // Finally, use the part before @ from email (most reliable)
    if (user?.email) {
      const namePart = user.email.split("@")[0]
      const displayName = namePart.charAt(0).toUpperCase() + namePart.slice(1)
      return displayName
    }

    return "Usuario"
  }

  const toggleGroup = (groupName: string) => {
    setExpandedGroups((prev) => ({
      ...prev,
      [groupName]: !prev[groupName],
    }))
  }

  const NavigationContent = () => (
    <div className="flex h-full flex-col">
      <div className="flex h-16 items-center px-6 border-b bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900">
        <h1 className="text-lg font-bold text-white">Transportes Labbé</h1>
      </div>
      <nav className="flex-1 space-y-2 px-3 py-4 overflow-y-auto">
        {navigationGroups.map((group) => (
          <div key={group.name} className="space-y-1">
            <Collapsible open={expandedGroups[group.name]} onOpenChange={() => toggleGroup(group.name)}>
              <CollapsibleTrigger className="flex w-full items-center justify-between px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent rounded-md transition-colors">
                <span>{group.name}</span>
                {expandedGroups[group.name] ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
              </CollapsibleTrigger>
              <CollapsibleContent className="space-y-1 pl-3">
                {group.items.map((item) => (
                  <a
                    key={item.name}
                    href={item.href}
                    className="flex items-center px-3 py-2 text-sm font-medium rounded-md text-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
                    onClick={() => setSidebarOpen(false)}
                  >
                    <item.icon className="mr-3 h-4 w-4" />
                    {item.name}
                  </a>
                ))}
              </CollapsibleContent>
            </Collapsible>
          </div>
        ))}
      </nav>
      <div className="border-t p-4 space-y-2">
        <div className="text-xs text-muted-foreground font-medium uppercase tracking-wide px-2">Usuario</div>
        {isMounted && (
          <div className="px-3 py-2 bg-accent/50 rounded-md mb-3">
            <p className="text-sm font-medium text-foreground truncate">{getUserDisplayName()}</p>
            {userProfile?.email && (
              <p className="text-xs text-muted-foreground truncate">{userProfile.email}</p>
            )}
            {userProfile?.role && (
              <p className="text-xs text-muted-foreground capitalize">{userProfile.role}</p>
            )}
          </div>
        )}
        <Button variant="ghost" className="w-full justify-start text-red-500 hover:text-red-600 hover:bg-red-50" onClick={handleLogout}>
          <LogOut className="mr-3 h-5 w-5" />
          Cerrar Sesión
        </Button>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-background">
      <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
        {/* Mobile sidebar drawer */}
        <SheetContent side="left" className="w-64 p-0 sm:w-80">
          <NavigationContent />
        </SheetContent>

        {/* Main layout */}
        <div className="flex flex-col md:flex-row min-h-screen">
          {/* Desktop sidebar - fixed on desktop, hidden on mobile/tablet */}
          <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
            <div className="flex flex-col flex-grow bg-card border-r border-border">
              <NavigationContent />
            </div>
          </div>

          {/* Main content area */}
          <div className="flex flex-col flex-1 lg:pl-64">
            {/* Header */}
            <header className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-2 md:gap-x-4 border-b border-border bg-background px-3 md:px-6 shadow-sm">
              {/* Mobile menu button */}
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="lg:hidden">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>

              {/* Brand info */}
              <div className="flex flex-col flex-1 min-w-0">
                <h1 className="text-lg md:text-xl font-bold text-foreground truncate">Transportes Labbé</h1>
                <p className="text-xs md:text-sm text-muted-foreground truncate">Portal de Empresa</p>
              </div>

              {/* Right section - alerts and user */}
              <div className="flex items-center gap-2 md:gap-4">
                {/* Alerts bell */}
                <Button variant="ghost" size="icon" className="relative">
                  <Bell className="h-5 w-5" />
                  <span className="absolute top-1 right-1 h-2 w-2 bg-orange-500 rounded-full"></span>
                </Button>

                {/* User info - hidden on mobile */}
                {isMounted && (
                  <div className="hidden md:flex flex-col items-end text-sm min-w-0">
                    <span className="font-medium text-foreground truncate">
                      {loading ? "Cargando..." : getUserDisplayName()}
                    </span>
                    {userProfile?.role && (
                      <span className="text-xs text-muted-foreground capitalize">{userProfile.role}</span>
                    )}
                  </div>
                )}
              </div>
            </header>

            {/* Main content */}
            <main className="flex-1 overflow-y-auto py-6 md:py-8">
              <div className="mx-auto w-full max-w-7xl px-3 md:px-6 lg:px-8">
                {children}
              </div>
            </main>
          </div>
        </div>
      </Sheet>
    </div>
  )
}
