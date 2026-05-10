export const dynamic = 'force-dynamic'
export const revalidate = 0

import { createClient } from "@/lib/supabase/server"
import { ApprovedDocumentsList } from "@/components/approved-documents-list"

async function getApprovedDocuments() {
  const supabase = await createClient()
  
  // Get approved conductor documents with no cache
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
    .eq('validation_status', 'approved')
    .order("created_at", { ascending: false })
    .limit(100)
  
  if (conductorError) {
    console.error("[v0] Error fetching approved conductor docs:", conductorError)
  }

  // Get approved subcontractor documents with no cache
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
    `, { count: 'exact' })
    .eq('status', 'aprobado')
    .order("created_at", { ascending: false })
    .limit(100)
  
  if (subError) {
    console.error("[v0] Error fetching approved sub docs:", subError)
  }

  return {
    conductorDocs: conductorDocs || [],
    subDocs: subDocs || []
  }
}

export default async function ApprovedDocumentsPage() {
  const { conductorDocs, subDocs } = await getApprovedDocuments()

  return (
    <div className="flex flex-col gap-6 p-6">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <span>✓</span>
          Documentos Aprobados
        </h1>
        <p className="text-muted-foreground mt-1">
          Historial de documentos que han sido aprobados
        </p>
      </div>

      <ApprovedDocumentsList 
        conductorDocs={conductorDocs as any} 
        subDocs={subDocs as any} 
      />
    </div>
  )
}
