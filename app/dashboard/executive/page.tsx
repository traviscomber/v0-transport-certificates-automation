"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  FileText,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  LogOut,
  Eye,
  ChevronRight,
  RefreshCw,
  Filter,
  BarChart3,
  Loader,
} from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { DocumentReviewPanel } from "@/components/executives/document-review-panel"

interface QueueItem {
  id: string
  document_id: string
  company_name: string
  priority: number
  queue_status: string
  assigned_to: string | null
  created_at: string
  documents: {
    id: string
    file_name: string
    file_size: string
    document_type: string
    validation_status: string
    profiles: {
      full_name: string
      email: string
      role: string
    }
  }
}

interface ExecutiveStats {
  queue: {
    pending: number
    inReview: number
    completed: number
    rejected: number
    total: number
  }
  reviews: {
    approved: number
    rejected: number
    inProgress: number
    total: number
  }
  performance: {
    averageReviewTimeHours: number
    approvalRate: number
  }
}

export default function ExecutiveDashboard() {
  const router = useRouter()
  const supabase = createClient()

  const [isLoading, setIsLoading] = useState(true)
  const [queue, setQueue] = useState<QueueItem[]>([])
  const [stats, setStats] = useState<ExecutiveStats | null>(null)
  const [selectedDocument, setSelectedDocument] = useState<string | null>(null)
  const [statusFilter, setStatusFilter] = useState("pending")
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    fetchData()
  }, [statusFilter])

  const fetchData = async () => {
    setIsLoading(true)
    try {
      // Fetch queue
      const queueRes = await fetch(
        `/api/document-queue?status=${statusFilter}&limit=20`
      )
      const queueData = await queueRes.json()
      if (queueData.success) {
        setQueue(queueData.queue)
      }

      // Fetch statistics
      const statsRes = await fetch("/api/executive-stats")
      const statsData = await statsRes.json()
      if (statsData.success) {
        setStats(statsData.statistics)
      }
    } catch (error) {
      console.error("[v0] Error fetching data:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push("/")
  }

  const filteredQueue = queue.filter((item) =>
    item.documents.file_name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "in_review":
        return "bg-blue-100 text-blue-800"
      case "completed":
        return "bg-green-100 text-green-800"
      case "rejected":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getValidationStatusIcon = (status: string) => {
    switch (status) {
      case "approved":
        return <CheckCircle className="w-4 h-4 text-green-600" />
      case "rejected":
        return <XCircle className="w-4 h-4 text-red-600" />
      case "pending":
        return <Clock className="w-4 h-4 text-yellow-600" />
      default:
        return <AlertCircle className="w-4 h-4 text-gray-600" />
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Centro de Revisión de Documentos</h1>
            <p className="text-sm text-muted-foreground">Ejecutiva - Transportes Labbe</p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={fetchData}
              disabled={isLoading}
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Actualizar
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleLogout}
            >
              <LogOut className="w-4 h-4 mr-2" />
              Cerrar Sesión
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 space-y-6">
        {/* Statistics Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Pendientes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{stats.queue.pending}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  De {stats.queue.total} documentos
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  En Revisión
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{stats.queue.inReview}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  Actualmente asignados
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Completados
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{stats.queue.completed}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  Tasa de aprobación: {stats.performance.approvalRate}%
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Tiempo Promedio
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {stats.performance.averageReviewTimeHours}h
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Por revisión
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Main Content */}
        <Tabs defaultValue="queue" className="w-full">
          <TabsList>
            <TabsTrigger value="queue">Cola de Documentos</TabsTrigger>
            <TabsTrigger value="review">Revisar Documento</TabsTrigger>
            <TabsTrigger value="analytics">Estadísticas</TabsTrigger>
          </TabsList>

          {/* Queue Tab */}
          <TabsContent value="queue" className="space-y-4">
            <div className="flex gap-4 items-center">
              <Input
                placeholder="Buscar documento..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1"
              />
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pendiente</SelectItem>
                  <SelectItem value="in_review">En Revisión</SelectItem>
                  <SelectItem value="completed">Completado</SelectItem>
                  <SelectItem value="rejected">Rechazado</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {isLoading ? (
              <div className="flex justify-center py-8">
                <Loader className="w-6 h-6 animate-spin" />
              </div>
            ) : filteredQueue.length === 0 ? (
              <Card>
                <CardContent className="py-8 text-center text-muted-foreground">
                  No hay documentos para mostrar
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-2">
                {filteredQueue.map((item) => (
                  <Card
                    key={item.id}
                    className="hover:border-primary/50 transition-colors cursor-pointer"
                    onClick={() => setSelectedDocument(item.document_id)}
                  >
                    <CardContent className="p-4 flex justify-between items-center">
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4" />
                          <span className="font-medium">
                            {item.documents.file_name}
                          </span>
                          <Badge className={getStatusColor(item.queue_status)}>
                            {item.queue_status === "in_review"
                              ? "En Revisión"
                              : item.queue_status === "pending"
                                ? "Pendiente"
                                : item.queue_status === "completed"
                                  ? "Completado"
                                  : "Rechazado"}
                          </Badge>
                        </div>
                        <div className="text-sm text-muted-foreground space-x-4">
                          <span>
                            Tipo: {item.documents.document_type}
                          </span>
                          <span>
                            De: {item.documents.profiles.full_name}
                          </span>
                          <span>
                            {new Date(item.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          setSelectedDocument(item.document_id)
                        }}
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        Revisar
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Review Tab */}
          <TabsContent value="review">
            {selectedDocument ? (
              <DocumentReviewPanel
                documentId={selectedDocument}
                onClose={() => setSelectedDocument(null)}
                onRefresh={fetchData}
              />
            ) : (
              <Card>
                <CardContent className="py-8 text-center text-muted-foreground">
                  Selecciona un documento de la cola para revisar
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics">
            {stats && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Resumen de Revisiones</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span>Aprobadas</span>
                      <span className="font-bold text-green-600">
                        {stats.reviews.approved}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Rechazadas</span>
                      <span className="font-bold text-red-600">
                        {stats.reviews.rejected}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>En Progreso</span>
                      <span className="font-bold text-blue-600">
                        {stats.reviews.inProgress}
                      </span>
                    </div>
                    <div className="border-t pt-4 flex justify-between items-center font-bold">
                      <span>Total</span>
                      <span>{stats.reviews.total}</span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Desempeño</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span>Tasa de Aprobación</span>
                      <span className="font-bold">
                        {stats.performance.approvalRate}%
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Tiempo Promedio</span>
                      <span className="font-bold">
                        {stats.performance.averageReviewTimeHours} horas
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Documentos Procesados</span>
                      <span className="font-bold">
                        {stats.queue.completed + stats.queue.rejected}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
