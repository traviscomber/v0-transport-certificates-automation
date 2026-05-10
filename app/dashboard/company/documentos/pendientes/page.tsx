export const dynamic = 'force-dynamic'

import { createClient } from "@/lib/supabase/server"
import { PendingDocumentsList } from "@/components/pending-documents-list"

async function getPendingDocuments() {
  const supabase = await createClient()
  
  // Get pending conductor documents
  const { data: conductorDocs, error: conductorError } = await supabase
    .from("uploaded_documents")
    .select(`
      id,
      original_filename,
      document_type_id,
      validation_status,
      file_url,
      created_at,
      conductores (
        id,
        nombres,
        apellido_paterno,
        rut
      )
    `)
    .or('validation_status.eq.pending,validation_status.is.null')
    .order("created_at", { ascending: false })
    .limit(100)
  
  if (conductorError) {
    console.error("[v0] Error fetching pending conductor docs:", conductorError)
  }

  // Get pending subcontractor documents
  const { data: subDocs, error: subError } = await supabase
    .from("subcontractor_documents")
    .select(`
      id,
      document_name,
      document_type,
      status,
      file_url,
      created_at,
      transportistas (
        id,
        razon_social,
        rut
      )
    `)
    .or('status.eq.pendiente,status.is.null')
    .order("created_at", { ascending: false })
    .limit(100)
  
  if (subError) {
    console.error("[v0] Error fetching pending sub docs:", subError)
  }

  return {
    conductorDocs: conductorDocs || [],
    subDocs: subDocs || []
  }
}

export default async function PendientesPage() {
  const { conductorDocs, subDocs } = await getPendingDocuments()

  return (
    <PendingDocumentsList 
      conductorDocs={conductorDocs} 
      subDocs={subDocs} 
    />
  )
}
