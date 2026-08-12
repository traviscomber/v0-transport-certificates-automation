import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { TransporterManagement } from '@/components/transporters/transporter-management'
import { getLatestTransportistaVerificationsByRut } from '@/lib/external-verification/latest-transportista'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function TransportersPage() {
  let mercadoPublicoByRut = {}

  try {
    mercadoPublicoByRut = await getLatestTransportistaVerificationsByRut('mercado_publico_supplier')
  } catch (error) {
    console.error('[transporters] Could not load Mercado Publico summaries:', error)
  }

  return (
    <DashboardLayout>
      <TransporterManagement mercadoPublicoByRut={mercadoPublicoByRut} />
    </DashboardLayout>
  )
}
