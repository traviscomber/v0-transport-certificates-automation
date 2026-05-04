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
        rut,
        rut_proveedor
      )
    `)
    .order("created_at", { ascending: false })
    .limit(500)

  if (ejecutiva) {
    // Get conductor IDs that belong to this ejecutiva through subcontratistas
    const { data: subcontratistas } = await supabase
      .from("subcontratistas")
      .select("rut_proveedor")
      .eq("ejecutiva", ejecutiva)
    
    if (subcontratistas && subcontratistas.length > 0) {
      const rutProveedores = subcontratistas.map(s => s.rut_proveedor)
      // Get conductores with those rut_proveedor values
      const { data: conductoresForEjecutiva } = await supabase
        .from("conductores")
        .select("id")
        .in("rut_proveedor", rutProveedores)
      
      if (conductoresForEjecutiva && conductoresForEjecutiva.length > 0) {
        const conductorIds = conductoresForEjecutiva.map(c => c.id)
        query = query.in("conductor_id", conductorIds)
      }
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
  
  // Get unique ejecutivas from subcontratistas table
  const { data, error } = await supabase
    .from("subcontratistas")
    .select("ejecutiva, rut_proveedor")
    .not("ejecutiva", "is", null)
    .neq("ejecutiva", "")

  if (error) {
    console.error("Error fetching ejecutivas:", error)
    return []
  }

  // Count conductores per ejecutiva
  const supabase2 = await createClient()
  const ejecutivasMap = new Map<string, number>()
  
  for (const subcon of data || []) {
    if (subcon.ejecutiva) {
      const { data: conductorCount } = await supabase2
        .from("conductores")
        .select("id", { count: "exact", head: true })
        .eq("rut_proveedor", subcon.rut_proveedor)
      
      const currentCount = ejecutivasMap.get(subcon.ejecutiva) || 0
      ejecutivasMap.set(subcon.ejecutiva, currentCount + (conductorCount?.length || 0))
    }
  }

  return Array.from(ejecutivasMap.entries()).map(([name, count]) => ({
    name,
    count
  }))
}

async function getConductores(ejecutiva?: string) {
  const supabase = await createClient()
  
  if (!ejecutiva) {
    // Return all conductores if no ejecutiva selected
    const { data, error } = await supabase
      .from("conductores")
      .select("id, nombres, apellido_paterno, rut")
      .order("apellido_paterno", { ascending: true })
      .limit(500)

    if (error) {
      console.error("Error fetching conductores:", error)
      return []
    }
    return data || []
  }

  // Get conductores for selected ejecutiva
  const { data: subcontratistas, error: subError } = await supabase
    .from("subcontratistas")
    .select("rut_proveedor")
    .eq("ejecutiva", ejecutiva)

  if (subError || !subcontratistas) {
    console.error("Error fetching subcontratistas:", subError)
    return []
  }

  const rutProveedores = subcontratistas.map(s => s.rut_proveedor)
  
  const { data, error } = await supabase
    .from("conductores")
    .select("id, nombres, apellido_paterno, rut")
    .in("rut_proveedor", rutProveedores)
    .order("apellido_paterno", { ascending: true })

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
