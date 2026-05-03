export const dynamic = 'force-dynamic'

import { createClient } from "@/lib/supabase/server"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { FileText, ExternalLink, CheckCircle, XCircle, Clock } from "lucide-react"
import DocumentosFilterClient from "@/components/admin/documentos-filter-client"
import EjecutivasFilterClient from "@/components/admin/ejecutivas-filter-client"
import { DocumentosUploadWrapper } from "@/components/admin/documentos-upload-wrapper"
import { DocumentosClient } from "@/components/admin/documentos-client"

async function getDocumentos(ejecutiva?: string) {
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
      ),
      subcontratistas:conductores(
        rut_proveedor
      )
    `)
    .order("created_at", { ascending: false })
    .limit(500)

  if (ejecutiva) {
    // Get conductor IDs for this ejecutiva first
    const { data: conductores } = await supabase
      .from("conductores")
      .select("id")
      .eq("ejecutiva", ejecutiva)
    
    if (conductores && conductores.length > 0) {
      const conductorIds = conductores.map(c => c.id)
      query = query.in("conductor_id", conductorIds)
    }
  }

  const { data, error } = await query

  if (error) {
    console.error("Error fetching documentos:", error)
    return []
  }

  return data || []
}

async function getEjecutivas() {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from("conductores")
    .select("ejecutiva")
    .not("ejecutiva", "is", null)
    .neq("ejecutiva", "")

  if (error) {
    console.error("Error fetching ejecutivas:", error)
    return []
  }

  // Get unique ejecutivas with conductor count
  const ejecutivasMap = new Map<string, number>()
  data?.forEach(record => {
    if (record.ejecutiva) {
      ejecutivasMap.set(record.ejecutiva, (ejecutivasMap.get(record.ejecutiva) || 0) + 1)
    }
  })

  return Array.from(ejecutivasMap.entries()).map(([name, count]) => ({
    name,
    count
  }))
}

async function getConductores(ejecutiva?: string) {
  const supabase = await createClient()
  
  let query = supabase
    .from("conductores")
    .select("id, nombres, apellido_paterno, rut")
    .order("apellido_paterno", { ascending: true })

  if (ejecutiva) {
    query = query.eq("ejecutiva", ejecutiva)
  }

  const { data, error } = await query

  if (error) {
    console.error("Error fetching conductores:", error)
    return []
  }

  return data || []
}

export default async function DocumentosPage({ searchParams }: { searchParams: Record<string, string> }) {
  const selectedEjecutiva = searchParams.ejecutiva
  const documentos = await getDocumentos(selectedEjecutiva)
  const ejecutivas = await getEjecutivas()
  const conductores = await getConductores(selectedEjecutiva)

  return (
    <div className="space-y-6" suppressHydrationWarning>
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Documentos</h1>
        <p className="text-muted-foreground">
          {selectedEjecutiva 
            ? `Documentos de ${selectedEjecutiva}`
            : 'Todos los documentos subidos y procesados'
          }
        </p>
      </div>

      {/* Filter by Ejecutiva */}
      <EjecutivasFilterClient ejecutivas={ejecutivas} selectedEjecutiva={selectedEjecutiva} />

      {/* Upload Section */}
      <DocumentosUploadWrapper conductores={conductores} />

      {/* Documents List - Client Component */}
      <DocumentosClient documents={documentos} />
    </div>
  )
}
