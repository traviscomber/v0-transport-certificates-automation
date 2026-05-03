'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'

interface Company {
  id: string
  rut: string
  name: string
  representative: string
  email: string
  phone: string
  region: string
  is_labbe_admin: boolean
}

export default function AdminDashboard() {
  const [companies, setCompanies] = useState<Company[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    const loadCompanies = async () => {
      try {
        const response = await fetch('/api/admin/companies')
        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.error || 'Error al cargar empresas')
        }

        setCompanies(data.companies || [])
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Error desconocido'
        setError(errorMessage)
        console.error('[v0] Error loading companies:', err)
      } finally {
        setIsLoading(false)
      }
    }

    loadCompanies()
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
            <h1 className="text-2xl font-bold text-foreground">Dashboard Admin - Transportes Labbe</h1>
            <p className="text-sm text-muted-foreground mt-1">Gestión de empresas y documentos</p>
          </div>
          <Button
            onClick={handleLogout}
            variant="outline"
            className="border-border text-foreground hover:bg-accent"
          >
            Cerrar Sesión
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="container max-w-7xl mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-card border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Empresas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{companies.length}</div>
            </CardContent>
          </Card>
          <Card className="bg-card border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Documentos Pendientes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">0</div>
            </CardContent>
          </Card>
          <Card className="bg-card border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Documentos Revisados</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-success">0</div>
            </CardContent>
          </Card>
          <Card className="bg-card border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Empresas Activas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-info">{companies.length - 1}</div>
            </CardContent>
          </Card>
        </div>

        {/* Companies Section */}
        <Card className="bg-card border-border">
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle className="text-foreground">Empresas Transportistas</CardTitle>
                <CardDescription>Lista de todas las empresas registradas</CardDescription>
              </div>
              <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
                + Agregar Empresa
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {error && (
              <div className="p-4 mb-4 bg-destructive/10 border border-destructive/50 rounded-lg text-destructive text-sm">
                {error}
              </div>
            )}

            {isLoading ? (
              <div className="flex justify-center items-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : companies.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No hay empresas registradas
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">RUT</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">Empresa</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">Representante</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">Email</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">Región</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {companies.map((company) => (
                      <tr key={company.id} className="border-b border-border hover:bg-accent/50 transition">
                        <td className="px-4 py-3 text-sm font-mono text-foreground">{company.rut}</td>
                        <td className="px-4 py-3 text-sm text-foreground font-medium">{company.name}</td>
                        <td className="px-4 py-3 text-sm text-muted-foreground">{company.representative}</td>
                        <td className="px-4 py-3 text-sm text-muted-foreground">{company.email}</td>
                        <td className="px-4 py-3 text-sm text-muted-foreground">{company.region}</td>
                        <td className="px-4 py-3 text-sm">
                          <Link
                            href={`/dashboard/admin/company/${company.id}`}
                            className="text-primary hover:text-primary/80 font-medium"
                          >
                            Ver Detalles
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
