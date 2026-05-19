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

    const conductorPending = (conductorDocs || []).filter(d => 
      d.validation_status === 'pending' || d.validation_status === null
    ).length
    const conductorApproved = (conductorDocs || []).filter(d => d.validation_status === 'approved').length
    const conductorRejected = (conductorDocs || []).filter(d => d.validation_status === 'rejected').length

    // Get subcontractor documents stats - MUST paginate for all 1333+ documents
    // Page 0 (0-999)
    const { data: subPage0 } = await supabase
      .from('subcontractor_documents')
      .select('status', { head: false })
      .range(0, 999)

    // Page 1 (1000-1999)
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
      total: (conductorCount || 0) + allSubDocs.length,
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
        total: allSubDocs.length,
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
