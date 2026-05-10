export const dynamic = 'force-dynamic'
export const revalidate = 0

import { createClient } from '@/lib/supabase/server'
import { RejectedDocumentsList } from '@/components/rejected-documents-list'

async function getRejectedDocuments() {
  const supabase = await createClient()
  
  // Get rejected conductor documents
  const { data: conductorDocs, error: conductorError } = await supabase
    .from('uploaded_documents')
    .select(`
      id,
      original_filename,
      document_type_id,
      validation_status,
      file_url,
      rejection_reason,
      created_at,
      conductor_id,
      conductores (
        id,
        nombres,
        apellido_paterno,
        rut
      )
    `)
    .eq('validation_status', 'rejected')
    .order('created_at', { ascending: false })
    .limit(100)
  
  if (conductorError) {
    console.error('[v0] Error fetching rejected conductor docs:', conductorError)
  }

  // Get rejected subcontractor documents
  const { data: subDocs, error: subError } = await supabase
    .from('subcontractor_documents')
    .select(`
      id,
      document_name,
      document_type,
      status,
      file_url,
      rejection_reason,
      created_at,
      transportista_id,
      transportistas (
        id,
        razon_social,
        rut
      )
    `)
    .eq('status', 'rechazado')
    .order('created_at', { ascending: false })
    .limit(100)
  
  if (subError) {
    console.error('[v0] Error fetching rejected sub docs:', subError)
  }

  return {
    conductorDocs: conductorDocs || [],
    subDocs: subDocs || []
  }
}

export default async function RejectedDocumentsPage() {
  const { conductorDocs, subDocs } = await getRejectedDocuments()

  return (
    <div className="flex flex-col gap-6 p-6">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <span>✗</span>
          Documentos Rechazados
        </h1>
        <p className="text-muted-foreground mt-1">
          Historial de documentos que han sido rechazados
        </p>
      </div>

      <RejectedDocumentsList 
        conductorDocs={conductorDocs as any} 
        subDocs={subDocs as any} 
      />
    </div>
  )
}
