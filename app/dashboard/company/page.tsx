'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'

interface CompanyProfile {
  id: string
  rut: string
  name: string
  representative: string
  email: string
  phone: string
  address: string
  region: string
}

export default function CompanyDashboard() {
  const [profile, setProfile] = useState<CompanyProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const response = await fetch('/api/company/profile')
        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.error || 'Error al cargar perfil')
        }

        setProfile(data.profile)
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Error desconocido'
        setError(errorMessage)
        console.error('[v0] Error loading profile:', err)
      } finally {
        setIsLoading(false)
      }
    }

    loadProfile()
  }, [])

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/auth/login-company')
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              {profile?.name || 'Panel de Control'}
            </h1>
            <p className="text-sm text-muted-foreground mt-1">Gestiona tus documentos y solicitudes</p>
          </div>
          <div className="flex gap-3">
            <Link href="/dashboard/company/settings">
              <Button variant="outline" className="border-border text-foreground hover:bg-accent">
                Configuración
              </Button>
            </Link>
            <Button
              onClick={handleLogout}
              variant="outline"
              className="border-border text-foreground hover:bg-accent"
            >
              Cerrar Sesión
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container max-w-7xl mx-auto px-4 py-8">
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card className="bg-card border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Documentos Subidos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">0</div>
              <p className="text-xs text-muted-foreground mt-1">Últimos 30 días</p>
            </CardContent>
          </Card>
          <Card className="bg-card border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">En Revisión</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-warning">0</div>
              <p className="text-xs text-muted-foreground mt-1">Esperando revisión</p>
            </CardContent>
          </Card>
          <Card className="bg-card border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Aprobados</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-success">0</div>
              <p className="text-xs text-muted-foreground mt-1">Completamente aprobados</p>
            </CardContent>
          </Card>
        </div>

        {/* Company Info Card */}
        {!isLoading && profile && (
          <Card className="bg-card border-border mb-8">
            <CardHeader>
              <CardTitle className="text-foreground">Información de la Empresa</CardTitle>
              <CardDescription>Datos registrados en el sistema</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">RUT</p>
                  <p className="text-lg font-mono text-foreground">{profile.rut}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Empresa</p>
                  <p className="text-lg text-foreground">{profile.name}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Representante Legal</p>
                  <p className="text-lg text-foreground">{profile.representative}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Email</p>
                  <p className="text-lg text-foreground">{profile.email}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Teléfono</p>
                  <p className="text-lg text-foreground">{profile.phone}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Región</p>
                  <p className="text-lg text-foreground">{profile.region}</p>
                </div>
                <div className="md:col-span-2">
                  <p className="text-sm font-medium text-muted-foreground">Dirección</p>
                  <p className="text-lg text-foreground">{profile.address}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Documents Section */}
        <Card className="bg-card border-border">
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle className="text-foreground">Documentos</CardTitle>
                <CardDescription>Tus documentos cargados y su estado</CardDescription>
              </div>
              <Link href="/dashboard/company/documents/upload">
                <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
                  + Cargar Documento
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-center py-12 text-muted-foreground">
              <p className="mb-4">No hay documentos cargados aún</p>
              <Link href="/dashboard/company/documents/upload">
                <Button variant="outline" className="border-border text-foreground hover:bg-accent">
                  Cargar tu primer documento
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
