import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET() {
  try {
    const supabase = await createClient()

    // PAGE 0: Get conductor documents stats (0-999)
    const { data: conductorPage0 } = await supabase
      .from('uploaded_documents')
      .select('validation_status', { head: false })
      .range(0, 999)

    // PAGE 1: Get conductor documents stats (1000-1999)
    const { data: conductorPage1 } = await supabase
      .from('uploaded_documents')
      .select('validation_status', { head: false })
      .range(1000, 1999)

    const allConductorDocs = [...(conductorPage0 || []), ...(conductorPage1 || [])]

    const conductorPending = allConductorDocs.filter(d => d.validation_status === 'pending' || !d.validation_status).length
    const conductorApproved = allConductorDocs.filter(d => d.validation_status === 'approved').length
    const conductorRejected = allConductorDocs.filter(d => d.validation_status === 'rejected').length

    // PAGE 0: Get subcontractor documents stats (0-999)
    const { data: subPage0 } = await supabase
      .from('subcontractor_documents')
      .select('status', { head: false })
      .range(0, 999)

    // PAGE 1: Get subcontractor documents stats (1000-1999)
    const { data: subPage1 } = await supabase
      .from('subcontractor_documents')
      .select('status', { head: false })
      .range(1000, 1999)

    const allSubDocs = [...(subPage0 || []), ...(subPage1 || [])]

    const subPending = allSubDocs.filter(d => d.status === 'pending').length
    const subApproved = allSubDocs.filter(d => d.status === 'approved').length
    const subRejected = allSubDocs.filter(d => d.status === 'rejected').length

    // Calculate totals
    const totals = {
      total: allConductorDocs.length + allSubDocs.length,
      pending: conductorPending + subPending,
      approved: conductorApproved + subApproved,
      rejected: conductorRejected + subRejected,
    }

    const stats = {
      conductores: {
        total: allConductorDocs.length,
        pendientes: conductorPending,
        aprobados: conductorApproved,
        rechazados: conductorRejected,
      },
      subcontratistas: {
        total: allSubDocs.length,
        pendientes: subPending,
        aprobados: subApproved,
        rechazados: subRejected,
      },
      totals: totals
    }

    return NextResponse.json({ stats }, { status: 200 })
  } catch (error: any) {
    console.error('[v0] Error in /api/dashboard/stats:', error.message)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
