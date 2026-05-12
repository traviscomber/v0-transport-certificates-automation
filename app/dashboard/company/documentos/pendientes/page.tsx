export const dynamic = 'force-dynamic'
export const revalidate = 0

import { createClient } from "@/lib/supabase/server"
import { PendingDocumentsList } from "@/components/pending-documents-list"

async function getPendingDocuments() {
  const supabase = await createClient()
  
  // Get pending conductor documents with no cache
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
    `, { count: 'exact' })
    .or('validation_status.eq.pending,validation_status.is.null')
    .order("created_at", { ascending: false })
    .limit(100)
  
  if (conductorError) {
    console.error("[v0] Error fetching pending conductor docs:", conductorError)
  }

  // Get pending subcontractor documents with no cache
  const { data: subDocs, error: subError } = await supabase
    .from("subcontractor_documents")
    .select(`
      id,
      file_name,
      document_type_id,
      status,
      file_url,
      created_at,
      subcontractor_id,
      transportistas:subcontractor_id (
        id,
        razon_social,
        rut
      )
    `, { count: 'exact' })
    .eq('status', 'pending')
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
