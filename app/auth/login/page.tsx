"use client"

import type React from "react"

import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { Truck, User, Users, Shield, Play } from "lucide-react"

const demoAccounts = [
  {
    role: "driver",
    email: "conductor@demo.cl",
    password: "demo123",
    name: "Conductor",
    description: "Acceso como conductor para subir certificados",
    icon: User,
    color: "bg-blue-500 hover:bg-blue-600",
  },
  {
    role: "dispatcher",
    email: "despachador@demo.cl",
    password: "demo123",
    name: "Despachador",
    description: "Acceso como despachador para gestionar conductores",
    icon: Users,
    color: "bg-green-500 hover:bg-green-600",
  },
  {
    role: "admin",
    email: "admin@demo.cl",
    password: "demo123",
    name: "Administrador",
    description: "Acceso completo al sistema",
    icon: Shield,
    color: "bg-purple-500 hover:bg-purple-600",
  },
]

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [demoLoading, setDemoLoading] = useState<string | null>(null)
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    const supabase = createClient()
    setIsLoading(true)
    setError(null)

    try {
      console.log("[v0] Attempting login for:", email)

      const { error, data } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      
      if (error) {
        console.log("[v0] Login auth error:", error)
        throw error
      }

      console.log("[v0] Login successful, user:", data.user?.id)

      // Get the current user to ensure session is established
      const { data: { user } } = await supabase.auth.getUser()
      console.log("[v0] Current user after login:", user?.id, user?.email)

      if (!user) {
        throw new Error("Usuario no encontrado después del login")
      }

      // Get user profile to determine redirect
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single()

      console.log("[v0] User profile fetched:", profile, "error:", profileError)

      // Redirect based on role
      if (profile?.role === "admin") {
        console.log("[v0] Redirecting to admin")
        router.push("/admin")
      } else if (profile?.role === "dispatcher") {
        console.log("[v0] Redirecting to dispatcher")
        router.push("/dispatcher")
      } else {
        console.log("[v0] Redirecting to driver")
        router.push("/driver")
      }
    } catch (error: unknown) {
      console.log("[v0] Login error:", error)
      setError(error instanceof Error ? error.message : "An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  const handleDemoLogin = async (demoAccount: (typeof demoAccounts)[0]) => {
    const supabase = createClient()
    setDemoLoading(demoAccount.role)
    setError(null)

    try {
      console.log("[v0] Attempting demo login for:", demoAccount.email)

      const { error, data } = await supabase.auth.signInWithPassword({
        email: demoAccount.email,
        password: demoAccount.password,
      })

      if (error) {
        console.log("[v0] Demo login auth error:", error)
        throw error
      }

      console.log("[v0] Demo login successful, user:", data.user?.id)

      // Get the current user to ensure session is established
      const { data: { user } } = await supabase.auth.getUser()
      console.log("[v0] Current demo user after login:", user?.id, user?.email)

      if (!user) {
        throw new Error("Usuario demo no encontrado después del login")
      }

      // Redirect based on role (we know the role from demoAccount)
      console.log("[v0] Demo user role:", demoAccount.role)
      
      if (demoAccount.role === "admin") {
        console.log("[v0] Redirecting demo admin to /admin")
        router.push("/admin")
      } else if (demoAccount.role === "dispatcher") {
        console.log("[v0] Redirecting demo dispatcher to /dispatcher")
        router.push("/dispatcher")
      } else {
        console.log("[v0] Redirecting demo driver to /driver")
        router.push("/driver")
      }
    } catch (error: unknown) {
      console.log("[v0] Demo login failed:", error)
      setError(error instanceof Error ? error.message : "Error en login demo")
    } finally {
      setDemoLoading(null)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted/20 p-4">
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Truck className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold">TransporteCL</span>
          </div>
          <p className="text-muted-foreground text-center">Sistema de Gestión de Certificados F-30</p>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-xl text-center flex items-center justify-center gap-2">
              <Play className="h-5 w-5" />
              Cuentas de Demostración
            </CardTitle>
            <CardDescription className="text-center">
              Haz clic para probar el sistema con diferentes roles
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="mb-4 p-3 bg-muted/50 rounded-lg border-2 border-dashed border-muted-foreground/20">
              <div className="text-center space-y-2">
                <p className="text-sm text-muted-foreground">¿Primera vez usando el demo?</p>
                <Link href="/setup-demo">
                  <Button variant="outline" size="sm" className="w-full bg-transparent">
                    <Play className="h-4 w-4 mr-2" />
                    Configurar Cuentas Demo
                  </Button>
                </Link>
              </div>
            </div>

            {demoAccounts.map((account) => {
              const Icon = account.icon
              const isLoading = demoLoading === account.role

              return (
                <Button
                  key={account.role}
                  variant="outline"
                  className={`w-full h-auto p-4 justify-start ${account.color} text-white border-0 hover:text-white`}
                  onClick={() => handleDemoLogin(account)}
                  disabled={!!demoLoading}
                >
                  <div className="flex items-center gap-3 w-full">
                    <Icon className="h-5 w-5 flex-shrink-0" />
                    <div className="text-left flex-1">
                      <div className="font-semibold">{account.name}</div>
                      <div className="text-sm opacity-90">{account.description}</div>
                    </div>
                    {isLoading && (
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                    )}
                  </div>
                </Button>
              )
            })}
          </CardContent>
        </Card>

        <div className="relative mb-6">
          <Separator />
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="bg-background px-2 text-sm text-muted-foreground">o</span>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl text-center">Iniciar Sesión</CardTitle>
            <CardDescription className="text-center">Ingresa tus credenciales para acceder al sistema</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Correo Electrónico</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="conductor@empresa.cl"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Contraseña</Label>
                <Input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              {error && (
                <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">
                  {error}
                  {error.includes("Invalid") && (
                    <div className="mt-2">
                      <Link href="/setup-demo" className="text-primary hover:underline text-xs">
                        ¿Necesitas configurar las cuentas demo? Haz clic aquí
                      </Link>
                    </div>
                  )}
                </div>
              )}
              <Button type="submit" className="w-full" disabled={isLoading || !!demoLoading}>
                {isLoading ? "Iniciando sesión..." : "Iniciar Sesión"}
              </Button>
            </form>
            <div className="mt-6 text-center text-sm">
              ¿No tienes cuenta?{" "}
              <Link href="/auth/register" className="text-primary hover:underline">
                Registrarse
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
