'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Building2, Mail, Phone, MapPin, LogOut, FileCheck } from 'lucide-react'

interface ExecutiveProfile {
  id: string
  rut: string
  full_name: string
  email: string
  cargo: string
}

interface CompanyData {
  id: string
  rut: string
  razon_social: string
  email: string
  telefono: string
  direccion: string
  region: string
}

export default function CompanyDashboard() {
  const [executive, setExecutive] = useState<ExecutiveProfile | null>(null)
  const [company, setCompany] = useState<CompanyData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        // Obtener ID del ejecutivo de la cookie
        const response = await fetch('/api/dashboard/data')
        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.error || 'Error al cargar datos')
        }

        setExecutive(data.executive)
        setCompany(data.company)
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Error desconocido'
        setError(errorMessage)
        console.error('[v0] Error loading dashboard:', err)
      } finally {
        setIsLoading(false)
      }
    }

    loadDashboardData()
  }, [])

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
      router.push('/auth/login-company')
    } catch (err) {
      console.error('[v0] Logout error:', err)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mb-4" />
          <p className="text-slate-300">Cargando datos...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-red-950/20 border-red-500/50">
          <CardHeader>
            <CardTitle className="text-red-400">Error</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-slate-300">{error}</p>
            <Button
              onClick={() => router.push('/auth/login-company')}
              className="w-full bg-orange-500 hover:bg-orange-600"
            >
              Volver a iniciar sesión
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <header className="border-b border-slate-700/50 bg-slate-900/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Building2 className="w-8 h-8 text-orange-500" />
            <div>
              <h1 className="text-xl font-bold text-white">{company?.razon_social}</h1>
              <p className="text-sm text-slate-400">RUT: {company?.rut}</p>
            </div>
          </div>
          <Button
            onClick={handleLogout}
            variant="ghost"
            className="gap-2 text-slate-300 hover:text-white"
          >
            <LogOut className="w-4 h-4" />
            Cerrar Sesión
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12">
        {/* Welcome Section */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-white mb-2">
            Bienvenido, {executive?.full_name}
          </h2>
          <p className="text-slate-400">Cargo: {executive?.cargo}</p>
        </div>

        {/* Company Info */}
        <div className="grid md:grid-cols-2 gap-6 mb-12">
          <Card className="bg-slate-800/50 border-slate-700/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <Building2 className="w-5 h-5 text-orange-500" />
                Información de la Empresa
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-slate-400 text-sm">Razón Social</p>
                <p className="text-white font-semibold">{company?.razon_social}</p>
              </div>
              <div>
                <p className="text-slate-400 text-sm">RUT</p>
                <p className="text-white font-semibold">{company?.rut}</p>
              </div>
              <div>
                <p className="text-slate-400 text-sm">Región</p>
                <p className="text-white font-semibold">{company?.region || 'N/A'}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <Mail className="w-5 h-5 text-orange-500" />
                Contacto
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-3">
                <Mail className="w-5 h-5 text-orange-500 mt-1 flex-shrink-0" />
                <div>
                  <p className="text-slate-400 text-sm">Email</p>
                  <p className="text-white">{company?.email}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Phone className="w-5 h-5 text-orange-500 mt-1 flex-shrink-0" />
                <div>
                  <p className="text-slate-400 text-sm">Teléfono</p>
                  <p className="text-white">{company?.telefono || 'N/A'}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-orange-500 mt-1 flex-shrink-0" />
                <div>
                  <p className="text-slate-400 text-sm">Dirección</p>
                  <p className="text-white">{company?.direccion || 'N/A'}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-3 gap-6">
          <Card className="bg-slate-800/50 border-slate-700/50 hover:border-orange-500/50 transition cursor-pointer">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <FileCheck className="w-5 h-5 text-orange-500" />
                Certificados
              </CardTitle>
              <CardDescription>Gestiona tus certificados</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-slate-400">Próximamente</p>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700/50 hover:border-orange-500/50 transition cursor-pointer">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <FileCheck className="w-5 h-5 text-orange-500" />
                Documentos
              </CardTitle>
              <CardDescription>Visualiza tus documentos</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-slate-400">Próximamente</p>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700/50 hover:border-orange-500/50 transition cursor-pointer">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <FileCheck className="w-5 h-5 text-orange-500" />
                Permisos
              </CardTitle>
              <CardDescription>Consulta tus permisos</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-slate-400">Próximamente</p>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
