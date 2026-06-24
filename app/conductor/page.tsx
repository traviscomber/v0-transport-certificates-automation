"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { AlertCircle, CheckCircle2, Upload, FileText, BookOpen } from "lucide-react"
import Link from "next/link"

export default function ConductorDashboard() {
  const [documents, setDocuments] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [complianceStats, setComplianceStats] = useState({
    total: 0,
    valid: 0,
    expired: 0,
    pending: 0,
  })

  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        console.log('[v0] Fetching documents from /api/conductor/documents')
        const response = await fetch("/api/conductor/documents")
        console.log('[v0] Response status:', response.status)
        
        if (response.ok) {
          const json = await response.json()
          // API returns { success: true, documents: [...] }
          const documents = json.documents || json
          console.log('[v0] Documents received:', documents)
          console.log('[v0] Documents count:', documents.length)
          setDocuments(documents)
          
          // Calculate compliance stats - validation_status values: pending, approved, rejected, expired
          const valid = documents.filter((d: any) => 
            d.validation_status === "approved" || d.validation_status === "validated"
          ).length
          const expired = documents.filter((d: any) => d.validation_status === "expired").length
          const pending = documents.filter((d: any) => 
            d.validation_status === "pending" || !d.validation_status
          ).length
          
          console.log('[v0] Compliance stats:', { total: documents.length, valid, expired, pending })
          
          setComplianceStats({
            total: documents.length,
            valid,
            expired,
            pending,
          })
        } else {
          console.error('[v0] Response not OK:', response.status)
        }
      } catch (error) {
        console.error("[v0] Error fetching documents:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchDocuments()
  }, [])

  const compliancePercentage = complianceStats.total > 0 
    ? Math.round((complianceStats.valid / complianceStats.total) * 100)
    : 0

  return (
    <div className="min-h-screen bg-slate-900 p-4 sm:p-6 lg:p-8">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Header */}
        <div className="space-y-3 border-b border-slate-700 pb-6">
          <h1 className="text-5xl font-bold text-white">Portal del Conductor</h1>
          <p className="text-slate-300 text-lg">Bienvenido de vuelta. Aqui esta tu resumen de documentacion y cumplimiento.</p>
        </div>

        {/* Compliance Status */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card className="border-slate-700 bg-slate-800/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-300">Cumplimiento</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-orange-500">{compliancePercentage}%</div>
              <p className="text-xs text-slate-400 mt-1">{complianceStats.valid}/{complianceStats.total} válidos</p>
            </CardContent>
          </Card>

          <Card className="border-green-600/40 bg-green-500/10">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-green-300">Válidos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-400">{complianceStats.valid}</div>
              <p className="text-xs text-green-300 mt-1">Documentos vigentes</p>
            </CardContent>
          </Card>

          <Card className="border-red-600/40 bg-red-500/10">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-red-300">Vencidos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-red-400">{complianceStats.expired}</div>
              <p className="text-xs text-red-300 mt-1">Requiere renovación</p>
            </CardContent>
          </Card>

          <Card className="border-amber-600/40 bg-amber-500/10">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-amber-300">Pendientes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-amber-400">{complianceStats.pending}</div>
              <p className="text-xs text-amber-300 mt-1">En revisión</p>
            </CardContent>
          </Card>
        </div>

        {/* Onboarding Reminder */}
        <Card className="border-slate-700 bg-gradient-to-r from-cyan-950/30 to-cyan-900/20 shadow-lg">
          <CardHeader>
            <CardTitle className="text-cyan-300 flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Revisar Guía de Inicio
            </CardTitle>
            <CardDescription className="text-slate-400">
              Si tienes dudas, puedes revisar la guía de inicio en cualquier momento
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/conductor/onboarding" className="block">
              <Button variant="outline" className="w-full border-cyan-700 text-cyan-300 hover:bg-cyan-950/50 hover:text-cyan-200">
                <BookOpen className="w-4 h-4 mr-2" />
                Ver Guía de Inicio
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Upload Section */}
        <Card className="border-slate-700 bg-gradient-to-r from-slate-800/50 to-slate-800/30 shadow-lg">
          <CardHeader>
            <CardTitle className="text-white text-lg font-semibold">Subir Nuevo Documento</CardTitle>
            <CardDescription className="text-slate-400">Carga fotos o PDFs de tus certificaciones y documentos</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/conductor/upload" className="block">
              <Button size="lg" className="w-full bg-orange-600 hover:bg-orange-700 text-white font-semibold shadow-md transition-all">
                <Upload className="w-5 h-5 mr-2" />
                Subir Documento
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Documents Gallery */}
        <Card className="border-slate-700 bg-slate-800/50">
          <CardHeader>
            <CardTitle className="text-foreground">Mis Documentos ({documents.length})</CardTitle>
            <CardDescription>Historial de documentos subidos y su estado</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8 text-slate-400">Cargando documentos...</div>
            ) : documents.length === 0 ? (
              <div className="text-center py-8">
                <FileText className="w-12 h-12 mx-auto text-slate-500 mb-3" />
                <p className="text-slate-400">No hay documentos aún. Sube tu primer documento.</p>
              </div>
            ) : (
              <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                {documents.map((doc) => (
                  <div key={doc.id} className="border border-slate-700 rounded-lg p-4 bg-slate-700/30 hover:border-slate-600 transition-all">
                    {/* Document thumbnail */}
                    {doc.file_url && (
                      <div className="mb-3 bg-slate-900 rounded h-32 overflow-hidden border border-slate-600 flex items-center justify-center">
                        {doc.file_url.endsWith(".pdf") ? (
                          <FileText className="w-8 h-8 text-slate-500" />
                        ) : (
                          <img
                            src={doc.file_url}
                            alt={doc.document_type}
                            className="w-full h-full object-cover"
                          />
                        )}
                      </div>
                    )}
                    
                    {/* Document info */}
                    <div className="space-y-2">
                      <div>
                        <p className="text-sm font-medium text-white truncate">{doc.document_type}</p>
                        <p className="text-xs text-slate-500">
                          {new Date(doc.created_at).toLocaleDateString("es-CL")}
                        </p>
                      </div>
                      
                      {/* Status badge */}
                      <div className="pt-2">
                        {(doc.validation_status === "approved" || doc.validation_status === "validated") && (
                          <Badge className="bg-green-500/30 text-green-200 border-green-500/50">
                            <CheckCircle2 className="w-3 h-3 mr-1" />
                            Aprobado
                          </Badge>
                        )}
                        {(doc.validation_status === "pending" || !doc.validation_status) && (
                          <Badge className="bg-amber-500/30 text-amber-200 border-amber-500/50">
                            <AlertCircle className="w-3 h-3 mr-1" />
                            Pendiente
                          </Badge>
                        )}
                        {doc.validation_status === "rejected" && (
                          <Badge className="bg-red-500/30 text-red-200 border-red-500/50">
                            <AlertCircle className="w-3 h-3 mr-1" />
                            Rechazado
                          </Badge>
                        )}
                        {doc.validation_status === "expired" && (
                          <Badge className="bg-red-500/30 text-red-200 border-red-500/50">
                            <AlertCircle className="w-3 h-3 mr-1" />
                            Vencido
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
