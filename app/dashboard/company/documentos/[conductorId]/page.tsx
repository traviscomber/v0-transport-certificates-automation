export const dynamic = 'force-dynamic'

import { createClient } from "@/lib/supabase/server"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft, FileText, CheckCircle, XCircle, Clock, Eye, Download, Trash2 } from "lucide-react"
import { DocumentsManagementClient } from "@/components/admin/documents-management-client"

async function getConductor(conductorId: string) {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from("conductores")
    .select("id, nombres, apellido_paterno, apellido_materno, rut")
    .eq("id", conductorId)
    .single()

  if (error) {
    console.error("Error fetching conductor:", error)
    return null
  }

  return data
}

async function getConductorDocuments(conductorId: string) {
  const supabase = await createClient()
  
  console.log('[v0] Fetching documents for conductor_id:', conductorId)
  
  const { data, error } = await supabase
    .from("uploaded_documents")
    .select(`
      id,
      original_filename,
      conductor_id,
      document_type_id,
      validation_status,
      rejection_reason,
      file_url,
      storage_path,
      created_at,
      document_types (
        id,
        code,
        name
      )
    `)
    .eq("conductor_id", conductorId)
    .order("created_at", { ascending: false })
    .limit(1000)  // Explicitly limit to 1000 documents per conductor

  if (error) {
    console.error("[v0] Error fetching documents:", error)
    return []
  }

  console.log('[v0] Found', data?.length || 0, 'documents for conductor:', conductorId)
  
  // Transform validation_status to verification_status for frontend
  const transformed = (data || []).map(doc => ({
    ...doc,
    verification_status: doc.validation_status
  }))
  
  return transformed
}

export default async function ConductorDocumentsPage({ 
  params 
}: { 
  params: { conductorId: string } 
}) {
  console.log('[v0] ConductorDocumentsPage - params.conductorId:', params.conductorId)
  
  const conductor = await getConductor(params.conductorId)
  console.log('[v0] Fetched conductor:', conductor?.nombres, conductor?.rut)
  
  const documents = await getConductorDocuments(params.conductorId)
  console.log('[v0] Fetched', documents.length, 'documents')

  if (!conductor) {
    return (
      <div className="space-y-6">
        <Link href="/dashboard/company/conductores">
          <Button variant="outline" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Volver a Conductores
          </Button>
        </Link>
        <div className="text-center py-12">
          <p className="text-muted-foreground">Conductor no encontrado</p>
        </div>
      </div>
    )
  }

  const conductorName = `${conductor.nombres} ${conductor.apellido_paterno} ${conductor.apellido_materno || ''}`.trim()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <Link href="/dashboard/company/conductores">
          <Button variant="outline" size="sm" className="mb-4 gap-2">
            <ArrowLeft className="h-4 w-4" />
            Volver
          </Button>
        </Link>
        
        <h1 className="text-3xl font-bold tracking-tight">Documentos del Conductor</h1>
        <p className="text-muted-foreground mt-2">
          <strong>{conductorName}</strong> • RUT: {conductor.rut}
        </p>
      </div>

      {/* Documents Management */}
      <DocumentsManagementClient 
        conductorId={params.conductorId}
        conductorRut={conductor.rut}
        conductorName={conductorName}
        initialDocuments={documents}
      />
    </div>
  )
}
