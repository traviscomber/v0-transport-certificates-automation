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
  
  // If ejecutiva is selected, get conductores for that ejecutiva first
  let conductorIds: string[] | null = null
  
  if (ejecutiva) {
    // Get subcontratistas for this ejecutiva
    const { data: subcontratistas, error: subError } = await supabase
      .from("subcontratistas")
      .select("rut_proveedor")
      .eq("ejecutiva", ejecutiva)
    
    console.log('[v0] Found subcontratistas for', ejecutiva, ':', subcontratistas?.length)
    
    if (subcontratistas && subcontratistas.length > 0) {
      const rutProveedores = subcontratistas.map(s => s.rut_proveedor)
      // Get conductores with those rut_proveedor values
      const { data: conductoresForEjecutiva } = await supabase
        .from("conductores")
        .select("id")
        .in("rut_proveedor", rutProveedores)
      
      conductorIds = conductoresForEjecutiva?.map(c => c.id) || []
      console.log('[v0] Found conductores for', ejecutiva, ':', conductorIds.length)
    }
  }

  // Build query for documents
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
    .limit(2000)  // Increased from 500 to 2000 to show all documents

  // Filter by conductor IDs if ejecutiva is selected
  if (conductorIds && conductorIds.length > 0) {
    query = query.in("conductor_id", conductorIds)
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
  
  // Get unique ejecutivas from subcontratistas table with conductor counts
  const { data: subcontratistas, error } = await supabase
    .from("subcontratistas")
    .select("ejecutiva, rut_proveedor")
    .not("ejecutiva", "is", null)
    .neq("ejecutiva", "")

  if (error) {
    console.error("Error fetching ejecutivas:", error)
    return []
  }

  console.log('[v0] Found', subcontratistas?.length || 0, 'subcontratistas')

  // Map ejecutivas to conductor counts
  const ejecutivasMap = new Map<string, Set<string>>()
  
  for (const subcon of subcontratistas || []) {
    if (subcon.ejecutiva) {
      if (!ejecutivasMap.has(subcon.ejecutiva)) {
        ejecutivasMap.set(subcon.ejecutiva, new Set())
      }
      ejecutivasMap.get(subcon.ejecutiva)!.add(subcon.rut_proveedor)
    }
  }

  // Get conductor count for each rut_proveedor
  const supabase2 = await createClient()
  const result = []
  
  for (const [name, rutSet] of ejecutivasMap.entries()) {
    const rutArray = Array.from(rutSet)
    const { data: conductorsData } = await supabase2
      .from("conductores")
      .select("id", { count: "exact" })
      .in("rut_proveedor", rutArray)
    
    const count = conductorsData?.length || 0
    result.push({ name, count })
    console.log('[v0] Ejecutiva:', name, 'count:', count)
  }

  return result.sort((a, b) => b.count - a.count)
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
