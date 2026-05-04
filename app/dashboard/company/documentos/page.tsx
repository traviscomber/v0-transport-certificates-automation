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
  
  console.log('[v0] getDocumentos called with ejecutiva:', ejecutiva)
  
  // Build query for documents - now use ejecutiva column directly
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
      ejecutiva,
      conductores!inner (
        id,
        nombres,
        apellido_paterno,
        rut,
        rut_proveedor
      )
    `)
    .order("created_at", { ascending: false })
    .limit(2000)

  // Filter by ejecutiva column directly if selected
  if (ejecutiva) {
    query = query.eq("ejecutiva", ejecutiva)
  }

  const { data, error } = await query

  if (error) {
    console.error("[v0] Error fetching documentos:", error)
    return []
  }

  console.log('[v0] Returned', data?.length || 0, 'documents')
  return data || []
}

async function getEjecutivas() {
  const supabase = await createClient()
  
  // Get 4 designated executives from LABBE: Carolina, Cecilia, Daniela, Olga
  const LABBE_EJECUTIVAS = ['Carolina', 'Cecilia', 'Daniela', 'Olga']
  
  // Count documents per ejecutiva
  const result = []
  
  for (const name of LABBE_EJECUTIVAS) {
    const { data, count, error } = await supabase
      .from('uploaded_documents')
      .select('id', { count: 'exact', head: true })
      .eq('ejecutiva', name)
    
    if (!error) {
      result.push({
        name,
        count: count || 0
      })
    } else {
      console.error(`[v0] Error counting documents for ${name}:`, error)
      result.push({ name, count: 0 })
    }
  }

  return result
}

async function getConductores(ejecutiva?: string) {
  const supabase = await createClient()
  
  let query = supabase
    .from("conductores")
    .select("id, nombres, apellido_paterno, rut")
    .order("apellido_paterno", { ascending: true })

  const { data, error } = await query

  if (error) {
    console.error("Error fetching conductores:", error)
    return []
  }

  return data || []
}

export default async function DocumentosPage({ searchParams }: { searchParams: Record<string, string | string[]> }) {
  const selectedEjecutiva = typeof searchParams.ejecutiva === 'string' ? searchParams.ejecutiva : undefined
  const documentos = await getDocumentos(selectedEjecutiva)
  const ejecutivas = await getEjecutivas()
  const conductores = await getConductores(selectedEjecutiva)

  return (
    <div className="space-y-6">
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
