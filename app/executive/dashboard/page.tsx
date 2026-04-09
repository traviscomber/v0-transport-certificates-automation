'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { AlertCircle, CheckCircle2, Clock, LogOut, FileText } from 'lucide-react'
import Link from 'next/link'

interface ExecutiveSession {
  id: string
  email: string
  full_name: string
  rut: string
  role: string
  created_at: string
}

interface Document {
  id: string
  conductor_name: string
  document_type: string
  status: 'pending' | 'validated' | 'rejected' | 'expired'
  created_at: string
  file_url?: string
}

export default function ExecutiveDashboard() {
  const [session, setSession] = useState<ExecutiveSession | null>(null)
  const [documents, setDocuments] = useState<Document[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [stats, setStats] = useState({ pending: 0, validated: 0, rejected: 0 })
  const router = useRouter()

  useEffect(() => {
    const checkSession = async () => {
      const sessionData = localStorage.getItem('executive_session')
      if (!sessionData) {
        router.push('/executive/login')
        return
      }

      try {
        const parsedSession = JSON.parse(sessionData)
        setSession(parsedSession)

        // Fetch pending documents for validation
        const response = await fetch('/api/executive/documents/pending')
        if (response.ok) {
          const data = await response.json()
          setDocuments(data)

          // Calculate stats
          setStats({
            pending: data.filter((d: Document) => d.status === 'pending').length,
            validated: data.filter((d: Document) => d.status === 'validated').length,
            rejected: data.filter((d: Document) => d.status === 'rejected').length,
          })
        }
      } catch (error) {
        console.error('Session error:', error)
        router.push('/executive/login')
      } finally {
        setIsLoading(false)
      }
    }

    checkSession()
  }, [router])

  const handleLogout = () => {
    localStorage.removeItem('executive_session')
    router.push('/executive/login')
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mx-auto mb-4"></div>
          <p className="text-slate-400">Cargando...</p>
        </div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  return (
    <div className="min-h-screen bg-slate-900 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white mb-1">Panel de Ejecutivo</h1>
            <p className="text-slate-400">Validación y revisión de documentos</p>
          </div>
          <Button
            onClick={handleLogout}
            variant="outline"
            className="border-slate-600 hover:bg-slate-800"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Cerrar Sesión
          </Button>
        </div>

        {/* User Info */}
        <Card className="border-slate-700 bg-slate-800/50">
          <CardContent className="pt-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-slate-400">Nombre</p>
                <p className="font-semibold text-white">{session.full_name}</p>
              </div>
              <div>
                <p className="text-sm text-slate-400">RUT</p>
                <p className="font-semibold text-white">{session.rut}</p>
              </div>
              <div>
                <p className="text-sm text-slate-400">Email</p>
                <p className="font-semibold text-white text-sm">{session.email}</p>
              </div>
              <div>
                <p className="text-sm text-slate-400">Rol</p>
                <Badge className="bg-blue-500/30 text-blue-200 border-blue-500/50">
                  Ejecutivo
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Statistics */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="border-amber-600/40 bg-amber-500/10">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-amber-300">Pendientes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-amber-400">{stats.pending}</div>
              <p className="text-xs text-amber-600 mt-1">Requieren revisión</p>
            </CardContent>
          </Card>

          <Card className="border-green-600/40 bg-green-500/10">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-green-300">Validados</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-400">{stats.validated}</div>
              <p className="text-xs text-green-600 mt-1">Aprobados hoy</p>
            </CardContent>
          </Card>

          <Card className="border-red-600/40 bg-red-500/10">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-red-300">Rechazados</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-red-400">{stats.rejected}</div>
              <p className="text-xs text-red-600 mt-1">No aptos para el servicio</p>
            </CardContent>
          </Card>
        </div>

        {/* Documents List */}
        <Card className="border-slate-700 bg-slate-800/50">
          <CardHeader>
            <CardTitle className="text-foreground">Documentos Pendientes</CardTitle>
            <CardDescription>Revisar y validar documentos de conductores</CardDescription>
          </CardHeader>
          <CardContent>
            {documents.length === 0 ? (
              <div className="text-center py-12">
                <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto mb-3" />
                <p className="text-slate-400">No hay documentos pendientes</p>
                <p className="text-xs text-slate-500 mt-1">Todos los documentos han sido revisados</p>
              </div>
            ) : (
              <div className="space-y-3">
                {documents.map((doc) => (
                  <div
                    key={doc.id}
                    className="border border-slate-700 rounded-lg p-4 hover:border-slate-600 transition-all"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <FileText className="w-5 h-5 text-slate-400" />
                          <div>
                            <p className="font-medium text-white">{doc.conductor_name}</p>
                            <p className="text-sm text-slate-400">{doc.document_type}</p>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        {doc.status === 'pending' && (
                          <Badge className="bg-amber-500/30 text-amber-200 border-amber-500/50">
                            <Clock className="w-3 h-3 mr-1" />
                            Pendiente
                          </Badge>
                        )}
                        {doc.status === 'validated' && (
                          <Badge className="bg-green-500/30 text-green-200 border-green-500/50">
                            <CheckCircle2 className="w-3 h-3 mr-1" />
                            Validado
                          </Badge>
                        )}
                        {doc.status === 'rejected' && (
                          <Badge className="bg-red-500/30 text-red-200 border-red-500/50">
                            <AlertCircle className="w-3 h-3 mr-1" />
                            Rechazado
                          </Badge>
                        )}

                        <Button size="sm" variant="outline" className="border-slate-600">
                          Ver
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center py-4 border-t border-slate-700">
          <p className="text-xs text-slate-500">
            Transportes Labbe © 2026 | Panel de Ejecutivos
          </p>
        </div>
      </div>
    </div>
  )
}
