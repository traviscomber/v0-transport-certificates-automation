export const dynamic = 'force-dynamic'
export const revalidate = 0

import { createClient } from "@/lib/supabase/server"
import { DocumentManagerHub } from "@/components/document-manager-hub"

async function getDocumentStats() {
  const supabase = await createClient()
  
  // Get conductor documents stats
  const { data: conductorDocs, error: conductorError } = await supabase
    .from("uploaded_documents")
    .select("id, validation_status")
  
  if (conductorError) {
    console.error("[v0] Error fetching conductor docs:", conductorError)
  }
  
  const conductorStats = {
    total: conductorDocs?.length || 0,
    pendientes: conductorDocs?.filter(d => d.validation_status === 'pending' || !d.validation_status).length || 0,
    aprobados: conductorDocs?.filter(d => d.validation_status === 'approved').length || 0,
    rechazados: conductorDocs?.filter(d => d.validation_status === 'rejected').length || 0,
    vencidos: 0 // Calculate based on expiry dates if available
  }

  // Get subcontractor documents stats
  const { data: subDocs, error: subError } = await supabase
    .from("subcontractor_documents")
    .select("id, status")
  
  if (subError) {
    console.error("[v0] Error fetching subcontractor docs:", subError)
  }
  
  const subStats = {
    total: subDocs?.length || 0,
    pendientes: subDocs?.filter(d => d.status === 'pendiente' || !d.status).length || 0,
    aprobados: subDocs?.filter(d => d.status === 'aprobado').length || 0,
    rechazados: subDocs?.filter(d => d.status === 'rechazado').length || 0,
    vencidos: 0
  }

  // Get certifications stats from transportistas
  const { data: transportistas, error: transError } = await supabase
    .from("transportistas")
    .select("id, certificacion_ariztia, certificacion_lts, certificacion_rendic, certificacion_interpolar, ariztia_vencimiento, lts_vencimiento, rendic_vencimiento, interpolar_vencimiento")
  
  if (transError) {
    console.error("[v0] Error fetching transportistas:", transError)
  }
  
  // Count certifications
  let totalCerts = 0
  let vigentes = 0
  let porVencer = 0
  let vencidas = 0
  const now = new Date()
  const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)
  
  const certFields = [
    { cert: 'certificacion_ariztia', venc: 'ariztia_vencimiento' },
    { cert: 'certificacion_lts', venc: 'lts_vencimiento' },
    { cert: 'certificacion_rendic', venc: 'rendic_vencimiento' },
    { cert: 'certificacion_interpolar', venc: 'interpolar_vencimiento' },
  ]
  
  transportistas?.forEach((t: any) => {
    certFields.forEach(({ cert, venc }) => {
      if (t[cert]) {
        totalCerts++
        const vencDate = t[venc] ? new Date(t[venc]) : null
        if (vencDate) {
          if (vencDate < now) {
            vencidas++
          } else if (vencDate < thirtyDaysFromNow) {
            porVencer++
          } else {
            vigentes++
          }
        } else {
          vigentes++ // If no expiry date, assume vigente
        }
      }
    })
  })

  const certStats = {
    total: totalCerts,
    vigentes,
    porVencer,
    vencidas
  }

  return {
    conductores: conductorStats,
    subcontratistas: subStats,
    certificaciones: certStats
  }
}

export default async function DocumentosPage() {
  const stats = await getDocumentStats()

  return <DocumentManagerHub stats={stats} />
}
