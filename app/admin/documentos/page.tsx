export const dynamic = 'force-dynamic'

import { createClient } from "@/lib/supabase/server"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { FileText, Search, ExternalLink, CheckCircle, XCircle, Clock } from "lucide-react"
import Link from "next/link"
import DocumentosFilterClient from "@/components/admin/documentos-filter-client"
import { DocumentosUpload } from "@/components/admin/documentos-upload"
import { DocumentosClient } from "@/components/admin/documentos-client"

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

export default async function DocumentosPage({ searchParams }: { searchParams: Record<string, string> }) {
  const conductorId = searchParams.conductor_id
  const documentos = await getDocumentos(conductorId)
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

      {/* Documents List - Client Component */}
      <DocumentosClient documents={documentos} />
    </div>
  )
}
