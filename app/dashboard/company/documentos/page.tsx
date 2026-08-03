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

  const countByStatus = async (table: string, statusColumn: string, status: string) => {
    const { count, error } = await supabase
      .from(table)
      .select('id', { count: 'exact', head: true })
      .eq('is_current', true)
      .eq(statusColumn, status)

    if (error) throw error
    return count || 0
  }

  const countCurrent = async (table: string) => {
    const { count, error } = await supabase
      .from(table)
      .select('id', { count: 'exact', head: true })
      .eq('is_current', true)

    if (error) throw error
    return count || 0
  }

  const [
    conductorTotal,
    conductorApproved,
    conductorRejected,
    conductorPending,
    subcontractorTotal,
    subcontractorApproved,
    subcontractorRejected,
    subcontractorPending,
    transportistasResult,
  ] = await Promise.all([
    countCurrent('uploaded_documents'),
    countByStatus('uploaded_documents', 'validation_status', 'approved'),
    countByStatus('uploaded_documents', 'validation_status', 'rejected'),
    countByStatus('uploaded_documents', 'validation_status', 'pending'),
    countCurrent('subcontractor_documents'),
    countByStatus('subcontractor_documents', 'status', 'approved'),
    countByStatus('subcontractor_documents', 'status', 'rejected'),
    countByStatus('subcontractor_documents', 'status', 'pending'),
    supabase.from('transportistas').select('ariztia, lts, rendic, interpolar'),
  ])

  if (transportistasResult.error) throw transportistasResult.error

  const certificationFlags = (transportistasResult.data || []) as TransportistaCertificationFlags[]
  const totalCertifications = certificationFlags.reduce((total, transportista) => {
    return total + [transportista.ariztia, transportista.lts, transportista.rendic, transportista.interpolar]
      .filter(Boolean).length
  }, 0)

  return {
    conductores: {
      total: conductorTotal,
      pendientes: conductorPending,
      aprobados: conductorApproved,
      rechazados: conductorRejected,
      vencidos: 0,
    },
    subcontratistas: {
      total: subcontractorTotal,
      pendientes: subcontractorPending,
      aprobados: subcontractorApproved,
      rechazados: subcontractorRejected,
      vencidos: 0,
    },
    certificaciones: {
      total: totalCertifications,
      vigentes: totalCertifications,
      porVencer: 0,
      vencidas: 0,
    },
  }
}

export default async function DocumentosPage() {
  const stats = await getDocumentStats()
  return <DocumentManagerHub stats={stats} />
}
