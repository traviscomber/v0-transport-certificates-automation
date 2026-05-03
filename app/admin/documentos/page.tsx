export const dynamic = 'force-dynamic'

import { createClient } from "@/lib/supabase/server"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { FileText, Search, ExternalLink, CheckCircle, XCircle, Clock } from "lucide-react"
import Link from "next/link"
import DocumentosFilterClient from "@/components/admin/documentos-filter-client"
import { DocumentosUpload } from "@/components/admin/documentos-upload"

async function getDocumentos(conductorId?: string) {
  const supabase = await createClient()
  
  let query = supabase
    .from("uploaded_documents")
    .select(`
      id,
      original_filename,
      conductor_id,
      document_type_id,
      validation_status,
      file_url,
      created_at,
      conductores!inner (
        id,
        nombres,
        apellido_paterno,
        rut
      )
    `)
    .order("created_at", { ascending: false })
    .limit(500)

  if (conductorId) {
    query = query.eq("conductor_id", conductorId)
  }

  const { data, error } = await query

  if (error) {
    console.error("Error fetching documentos:", error)
    return []
  }

  return data || []
}

async function getExecutivas() {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from("conductores")
    .select("id, nombres, apellido_paterno, rut")
    .order("apellido_paterno", { ascending: true })

  if (error) {
    console.error("Error fetching ejecutivas:", error)
    return []
  }

  return data || []
}

async function getStats(conductorId?: string) {
  const supabase = await createClient()
  
  let totalQuery = supabase.from("uploaded_documents").select("id", { count: "exact", head: true })
  let pendingQuery = supabase.from("uploaded_documents").select("id", { count: "exact", head: true }).eq("validation_status", "pending")
  let validatedQuery = supabase.from("uploaded_documents").select("id", { count: "exact", head: true }).eq("validation_status", "approved")
  let rejectedQuery = supabase.from("uploaded_documents").select("id", { count: "exact", head: true }).eq("validation_status", "rejected")

  if (conductorId) {
    totalQuery = totalQuery.eq("conductor_id", conductorId)
    pendingQuery = pendingQuery.eq("conductor_id", conductorId)
    validatedQuery = validatedQuery.eq("conductor_id", conductorId)
    rejectedQuery = rejectedQuery.eq("conductor_id", conductorId)
  }

  const [total, pending, validated, rejected] = await Promise.all([
    totalQuery,
    pendingQuery,
    validatedQuery,
    rejectedQuery,
  ])

  return {
    total: total.count || 0,
    pending: pending.count || 0,
    validated: validated.count || 0,
    rejected: rejected.count || 0,
  }
}

export default async function DocumentosPage({ searchParams }: { searchParams: Record<string, string> }) {
  const conductorId = searchParams.conductor_id
  const documentos = await getDocumentos(conductorId)
  const stats = await getStats(conductorId)
  const ejecutivas = await getExecutivas()

  const selectedEjecutiva = ejecutivas.find(e => e.id === conductorId)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Documentos</h1>
          <p className="text-muted-foreground">
            {selectedEjecutiva 
              ? `Documentos de ${selectedEjecutiva.nombres} ${selectedEjecutiva.apellido_paterno}`
              : 'Todos los documentos subidos y procesados'
            }
          </p>
        </div>
      </div>

      {/* Filter by Ejecutiva */}
      <DocumentosFilterClient ejecutivas={ejecutivas} selectedId={conductorId} />

      {/* Upload Section */}
      <DocumentosUpload conductores={ejecutivas} />

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-sm text-muted-foreground">Total documentos</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
            <p className="text-sm text-muted-foreground">Pendientes</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-green-600">{stats.validated}</div>
            <p className="text-sm text-muted-foreground">Aprobados</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-red-600">{stats.rejected}</div>
            <p className="text-sm text-muted-foreground">Rechazados</p>
          </CardContent>
        </Card>
      </div>

      {/* Documents List */}
      {documentos.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <FileText className="h-16 w-16 text-muted-foreground/50 mb-4" />
            <h3 className="text-lg font-semibold mb-2">No hay documentos</h3>
            <p className="text-muted-foreground text-center">
              {selectedEjecutiva ? `No hay documentos para ${selectedEjecutiva.nombres}` : 'No hay documentos cargados'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <table className="w-full">
              <thead className="border-b bg-muted/50">
                <tr>
                  <th className="text-left p-4 font-medium">Documento</th>
                  <th className="text-left p-4 font-medium">Conductor</th>
                  <th className="text-left p-4 font-medium">Estado</th>
                  <th className="text-left p-4 font-medium">Fecha</th>
                  <th className="text-right p-4 font-medium">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {documentos.map((doc: any) => (
                  <tr key={doc.id} className="border-b hover:bg-muted/50">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <FileText className="h-5 w-5 text-muted-foreground" />
                        <span className="font-medium truncate max-w-[250px]">
                          {doc.original_filename || "Sin nombre"}
                        </span>
                      </div>
                    </td>
                    <td className="p-4 text-sm">
                      {doc.conductores ? 
                        `${doc.conductores.nombres} ${doc.conductores.apellido_paterno}` :
                        '-'}
                    </td>
                    <td className="p-4">
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                        doc.validation_status === "approved" 
                          ? "bg-green-100 text-green-700"
                          : doc.validation_status === "rejected"
                          ? "bg-red-100 text-red-700"
                          : "bg-yellow-100 text-yellow-700"
                      }`}>
                        {doc.validation_status === "approved" && <CheckCircle className="h-3 w-3" />}
                        {doc.validation_status === "rejected" && <XCircle className="h-3 w-3" />}
                        {doc.validation_status === "pending" && <Clock className="h-3 w-3" />}
                        {doc.validation_status === "approved" ? "Aprobado" :
                         doc.validation_status === "rejected" ? "Rechazado" : "Pendiente"}
                      </span>
                    </td>
                    <td className="p-4 text-sm text-muted-foreground">
                      {new Date(doc.created_at).toLocaleDateString("es-CL")}
                    </td>
                    <td className="p-4 text-right">
                      {doc.file_url && (
                        <a 
                          href={doc.file_url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
                        >
                          Ver <ExternalLink className="h-3 w-3" />
                        </a>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
