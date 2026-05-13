export const dynamic = 'force-dynamic'
export const revalidate = 0

import { createClient } from "@/lib/supabase/server"
import { ApprovedDocumentsList } from "@/components/approved-documents-list"
import { CheckCircle2 } from "lucide-react"

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
      updated_at,
      reviewed_at,
      conductores (
        id,
        nombres,
        apellido_paterno,
        rut
      )
    `, { count: 'exact' })
    .eq('validation_status', 'approved')
    .order("updated_at", { ascending: false })
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
      updated_at,
      transportistas (
        id,
        razon_social,
        rut
      )
    `, { count: 'exact' })
    .eq('status', 'aprobado')
    .order("updated_at", { ascending: false })
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
  const totalApproved = conductorDocs.length + subDocs.length

  return (
    <div className="flex flex-col gap-8 p-6">
      {/* Header */}
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-500/10 border border-green-500/20">
            <CheckCircle2 className="h-6 w-6 text-green-500" />
          </div>
          <h1 className="text-4xl font-bold text-white">Documentos Aprobados</h1>
        </div>
        <p className="text-slate-400">Historial completo de documentos aprobados • Total: {totalApproved} documentos</p>
      </div>

      {/* Content */}
      <ApprovedDocumentsList 
        conductorDocs={conductorDocs as any} 
        subDocs={subDocs as any} 
      />
    </div>
  )
}
