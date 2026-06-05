export const dynamic = 'force-dynamic'
export const revalidate = 0

import { NextResponse, NextRequest } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { verifyAuth } from '@/lib/auth-middleware'

export async function GET(request: NextRequest) {
  try {
    const { user, error: authError } = await verifyAuth(request)
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const supabase = createAdminClient()

    // Get conductor documents - paginate all 1000+
    const { data: condPage0 } = await supabase
      .from('uploaded_documents')
      .select('validation_status')
      .range(0, 999)

    const { data: condPage1 } = await supabase
      .from('uploaded_documents')
      .select('validation_status')
      .range(1000, 1999)

    const allCond = [...(condPage0 || []), ...(condPage1 || [])]

    const conductorStats = {
      total: allCond.length,
      pendientes: allCond.filter(d => d.validation_status === 'pending' || !d.validation_status).length,
      aprobados: allCond.filter(d => d.validation_status === 'approved').length,
      rechazados: allCond.filter(d => d.validation_status === 'rejected').length,
      vencidos: 0
    }

    // Get subcontractor documents - paginate all 1000+
    const { data: subPage0 } = await supabase
      .from('subcontractor_documents')
      .select('status')
      .range(0, 999)

    const { data: subPage1 } = await supabase
      .from('subcontractor_documents')
      .select('status')
      .range(1000, 1999)

    const allSub = [...(subPage0 || []), ...(subPage1 || [])]

    const subStats = {
      total: allSub.length,
      pendientes: allSub.filter(d => d.status === 'pending').length,
      aprobados: allSub.filter(d => d.status === 'approved').length,
      rechazados: allSub.filter(d => d.status === 'rejected').length,
      vencidos: 0
    }

    // Get certification stats
    const { data: certs } = await supabase
      .from('transportistas')
      .select('id')
      .limit(1000)

    const certStats = {
      total: certs?.length || 0,
      vigentes: 0,
      porVencer: 0,
      vencidas: 0
    }

    const stats = {
      conductores: conductorStats,
      subcontratistas: subStats,
      certificaciones: certStats
    }

    const response = NextResponse.json({
      stats,
      timestamp: new Date().toISOString()
    })

    response.headers.set('Cache-Control', 'no-store, must-revalidate')
    return response

  } catch (error: any) {
    console.error('[v0] Stats API error:', error.message)
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}
