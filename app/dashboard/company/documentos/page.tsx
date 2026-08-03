export const dynamic = 'force-dynamic'
export const revalidate = 0
export const fetchCache = 'force-no-store'

import { createClient } from "@/lib/supabase/server"
import { DocumentManagerHub } from "@/components/document-manager-hub"

type TransportistaCertificationFlags = {
  ariztia: boolean | null
  lts: boolean | null
  rendic: boolean | null
  interpolar: boolean | null
}

async function getDocumentStats() {
  const supabase = await createClient()

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

  const { data: transportistas, error: transportistasError } = await supabase
    .from("transportistas")
    .select("ariztia, lts, rendic, interpolar")

  if (transportistasError) {
    console.error("[v0] Error fetching transportista certification flags:", transportistasError)
  }

  const certificationFlags = (transportistas || []) as TransportistaCertificationFlags[]
  const totalCertifications = certificationFlags.reduce((total, transportista) => {
    return total + [transportista.ariztia, transportista.lts, transportista.rendic, transportista.interpolar]
      .filter(Boolean).length
  }, 0)

  // The current schema stores assignment flags but no certification expiration
  // dates. Every assigned certification is therefore counted as active, while
  // expiring and expired values remain zero until a canonical expiry source exists.
  const certStats = {
    total: totalCertifications,
    vigentes: totalCertifications,
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
