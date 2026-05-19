import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET() {
  try {
    const supabase = await createClient()

    // Get conductor documents stats
    const { data: conductorDocs, count: conductorCount } = await supabase
      .from('uploaded_documents')
      .select('validation_status', { count: 'exact', head: false })
      .limit(10000)

    const conductorPending = (conductorDocs || []).filter(d => 
      d.validation_status === 'pending' || d.validation_status === null
    ).length
    const conductorApproved = (conductorDocs || []).filter(d => d.validation_status === 'approved').length
    const conductorRejected = (conductorDocs || []).filter(d => d.validation_status === 'rejected').length

    // Get subcontractor documents stats
    const { data: subDocs, count: subCount } = await supabase
      .from('subcontractor_documents')
      .select('status', { count: 'exact', head: false })
      .limit(10000)

    const subPending = (subDocs || []).filter(d => d.status === 'pending').length
    const subApproved = (subDocs || []).filter(d => d.status === 'approved').length
    const subRejected = (subDocs || []).filter(d => d.status === 'rejected').length

    // Calculate totals
    const totals = {
      total: (conductorCount || 0) + (subCount || 0),
      pending: conductorPending + subPending,
      approved: conductorApproved + subApproved,
      rejected: conductorRejected + subRejected,
    }

    const stats = {
      conductores: {
        total: conductorCount || 0,
        pendientes: conductorPending,
        aprobados: conductorApproved,
        rechazados: conductorRejected,
      },
      subcontratistas: {
        total: subCount || 0,
        pendientes: subPending,
        aprobados: subApproved,
        rechazados: subRejected,
      },
      totals: totals
    }

    return NextResponse.json({
      stats: stats,
      timestamp: new Date().toISOString()
    })

  } catch (error: any) {
    console.error('[v0] Dashboard stats error:', error.message)
    return NextResponse.json({
      error: error.message,
      stats: {
        totals: { total: 0, pending: 0, approved: 0, rejected: 0 }
      }
    }, { status: 500 })
  }
}
