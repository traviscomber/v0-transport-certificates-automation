export const dynamic = 'force-dynamic'
export const revalidate = 0

import { createClient } from '@/lib/supabase/server'
import { RejectedDocumentsList } from '@/components/rejected-documents-list'
import { XCircle } from 'lucide-react'

async function getRejectedDocuments() {
  const supabase = await createClient()
  
  // Get rejected conductor documents - check both English and Spanish status values
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
      updated_at,
      reviewed_at,
      conductor_id,
      conductores (
        id,
        nombres,
        apellido_paterno,
        rut
      )
    `)
    .in('validation_status', ['rejected', 'rechazado'])
    .order('updated_at', { ascending: false })
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
      updated_at,
      transportista_id,
      transportistas (
        id,
        razon_social,
        rut
      )
    `)
    .eq('status', 'rechazado')
    .order('updated_at', { ascending: false })
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
  const totalRejected = conductorDocs.length + subDocs.length

  return (
    <div className="flex flex-col gap-8 p-6">
      {/* Header */}
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-500/10 border border-red-500/20">
            <XCircle className="h-6 w-6 text-red-500" />
          </div>
          <h1 className="text-4xl font-bold text-white">Documentos Rechazados</h1>
        </div>
        <p className="text-slate-400">Historial completo de documentos rechazados • Total: {totalRejected} documentos</p>
      </div>

      {/* Content */}
      <RejectedDocumentsList 
        conductorDocs={conductorDocs as any} 
        subDocs={subDocs as any} 
      />
    </div>
  )
}
