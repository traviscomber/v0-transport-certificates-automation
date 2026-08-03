export const dynamic = 'force-dynamic'
export const revalidate = 0
export const fetchCache = 'force-no-store'

import { createClient } from "@/lib/supabase/server"
import { DocumentManagerHub } from "@/components/document-manager-hub"

async function getDocumentStats() {
  const supabase = await createClient()

  console.log("[v0] documentos/page.tsx getDocumentStats called - fetching all documents with pagination")

  const { data: conductorPage0, error: conductorError } = await supabase
    .from("uploaded_documents")
    .select("id, validation_status")
    .range(0, 999)

  const { data: conductorPage1, error: conductorPage1Error } = await supabase
    .from("uploaded_documents")
    .select("id, validation_status")
    .range(1000, 1999)

  const allConductorDocs = [...(conductorPage0 || []), ...(conductorPage1 || [])]

  if (conductorError || conductorPage1Error) {
    console.error("[v0] Error fetching conductor docs:", conductorError || conductorPage1Error)
  }

  const conductorStats = {
    total: allConductorDocs.length,
    pendientes: allConductorDocs.filter(d => d.validation_status === 'pending' || !d.validation_status).length,
    aprobados: allConductorDocs.filter(d => d.validation_status === 'approved').length,
    rechazados: allConductorDocs.filter(d => d.validation_status === 'rejected').length,
    vencidos: 0,
  }

  const { data: subPage0, error: subError } = await supabase
    .from("subcontractor_documents")
    .select("id, status")
    .range(0, 999)

  const { data: subPage1, error: subPage1Error } = await supabase
    .from("subcontractor_documents")
    .select("id, status")
    .range(1000, 1999)

  const allSubDocs = [...(subPage0 || []), ...(subPage1 || [])]

  if (subError || subPage1Error) {
    console.error("[v0] Error fetching subcontractor docs:", subError || subPage1Error)
  }

  const subStats = {
    total: allSubDocs.length,
    pendientes: allSubDocs.filter(d => d.status === 'pending').length,
    aprobados: allSubDocs.filter(d => d.status === 'approved').length,
    rechazados: allSubDocs.filter(d => d.status === 'rejected').length,
    vencidos: 0,
  }

  // Certification columns previously queried from transportistas are not part of
  // the current production schema. Keep this section explicitly neutral until a
  // canonical certification source is introduced instead of issuing invalid SQL.
  const certStats = {
    total: 0,
    vigentes: 0,
    porVencer: 0,
    vencidas: 0,
  }

  return {
    conductores: conductorStats,
    subcontratistas: subStats,
    certificaciones: certStats,
  }
}

export default async function DocumentosPage() {
  const stats = await getDocumentStats()

  return <DocumentManagerHub stats={stats} />
}
