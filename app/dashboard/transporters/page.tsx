import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { TransporterManagement } from '@/components/transporters/transporter-management'
import { getLatestTransportistaVerificationsByRut } from '@/lib/external-verification/latest-transportista'
import { createAdminClient } from '@/lib/supabase/admin'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function TransportersPage() {
  const supabase = createAdminClient()

  const [transportistasResult, mercadoPublicoResult] = await Promise.allSettled([
    supabase
      .from('transportistas')
      .select('id, razon_social, rut, email, correo, telefono, ciudad, comuna, direccion, is_active')
      .order('razon_social', { ascending: true }),
    getLatestTransportistaVerificationsByRut('mercado_publico_supplier'),
  ])

  const initialTransporters = transportistasResult.status === 'fulfilled' && !transportistasResult.value.error
    ? (transportistasResult.value.data ?? []).map((row) => ({
        id: row.id,
        name: row.razon_social,
        rut: row.rut,
        email: row.email || row.correo || undefined,
        phone: row.telefono || undefined,
        city: row.ciudad || row.comuna || undefined,
        address: row.direccion || undefined,
        is_active: row.is_active !== false,
      }))
    : []

  if (transportistasResult.status === 'rejected') {
    console.error('[transporters] Could not load canonical transportistas:', transportistasResult.reason)
  } else if (transportistasResult.value.error) {
    console.error('[transporters] Could not load canonical transportistas:', transportistasResult.value.error)
  }

  const mercadoPublicoByRut = mercadoPublicoResult.status === 'fulfilled'
    ? mercadoPublicoResult.value
    : {}

  if (mercadoPublicoResult.status === 'rejected') {
    console.error('[transporters] Could not load Mercado Publico summaries:', mercadoPublicoResult.reason)
  }

  return (
    <DashboardLayout>
      <TransporterManagement
        initialTransporters={initialTransporters}
        mercadoPublicoByRut={mercadoPublicoByRut}
      />
    </DashboardLayout>
  )
}
