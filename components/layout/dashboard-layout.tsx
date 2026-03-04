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

    console.log("[v0] getUserDisplayName - mounted, user:", user?.email, "userProfile:", userProfile)

    // First, try to use the full_name from profiles table
    if (userProfile?.full_name && userProfile.full_name.trim()) {
      console.log("[v0] Using full_name:", userProfile.full_name)
      return userProfile.full_name
    }

    // Then try metadata name from auth
    if (user?.user_metadata?.name) {
      console.log("[v0] Using metadata name:", user.user_metadata.name)
      return user.user_metadata.name
    }

    // Finally, use the part before @ from email (most reliable)
    if (user?.email) {
      const namePart = user.email.split("@")[0]
      const displayName = namePart.charAt(0).toUpperCase() + namePart.slice(1)
      console.log("[v0] Using email part:", displayName)
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
      <div className="flex h-16 items-center px-6 border-b">
        <h1 className="text-xl font-bold text-primary">Cleaner.cl</h1>
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
      <div className="border-t p-4">
        <Button variant="ghost" className="w-full justify-start" onClick={handleLogout}>
          <LogOut className="mr-3 h-5 w-5" />
          Cerrar Sesión
        </Button>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-background">
      <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
        {/* Mobile sidebar */}
        <SheetContent side="left" className="w-64 p-0">
          <NavigationContent />
        </SheetContent>

        {/* Main content */}
        <div className="lg:pl-64">
          <div className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-border bg-background px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8">
            <SheetTrigger asChild>
              <Button variant="ghost" size="sm" className="lg:hidden">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>

            <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
              <div className="flex flex-1"></div>
              <div className="flex items-center gap-x-4 lg:gap-x-6">
                <div className="flex flex-col items-end text-sm">
                  <span className="font-medium text-foreground">
                    {loading ? "Cargando..." : `Bienvenido, ${getUserDisplayName()}`}
                  </span>
                  {userProfile?.email && (
                    <span className="text-xs text-muted-foreground">{userProfile.email}</span>
                  )}
                  {userProfile?.role && (
                    <span className="text-xs text-muted-foreground capitalize">{userProfile.role}</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          <main className="py-8">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">{children}</div>
          </main>
        </div>
      </Sheet>

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        <div className="flex flex-col flex-grow bg-card border-r border-border">
          <NavigationContent />
        </div>
      </div>
    </div>
  )
}
