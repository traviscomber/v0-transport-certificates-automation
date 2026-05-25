import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET() {
  try {
    const supabase = createAdminClient()

    // Get ALL documents without filters to count totals and pending/rejected
    const { data: allConductor } = await supabase
      .from('uploaded_documents')
      .select('id, validation_status')
    
    const { data: allSub } = await supabase
      .from('subcontractor_documents')
      .select('id, status')

    // Count by status
    const conductorStats = {
      total: allConductor?.length || 0,
      pendientes: allConductor?.filter((d: any) => d.validation_status === 'pending' || !d.validation_status).length || 0,
      aprobados: allConductor?.filter((d: any) => d.validation_status === 'approved').length || 0,
      rechazados: allConductor?.filter((d: any) => d.validation_status === 'rejected').length || 0,
      vencidos: 0
    }

    const subStats = {
      total: allSub?.length || 0,
      pendientes: allSub?.filter((d: any) => d.status === 'pending').length || 0,
      aprobados: allSub?.filter((d: any) => d.status === 'approved').length || 0,
      rechazados: allSub?.filter((d: any) => d.status === 'rejected').length || 0,
      vencidos: 0
    }

    // ===== IMPORTANT: Use the ACTUAL aprobados endpoint count for approved docs =====
    // This ensures dashboard shows the exact same value as the detail page
    let detailedApprovedCount = 0
    let approvedCount = (conductorStats.aprobados || 0) + (subStats.aprobados || 0)
    
    try {
      // Call the aprobados endpoint to get the real approved count
      // This endpoint applies all business logic and returns the correct count
      let baseUrl = process.env.NEXTAUTH_URL
      
      // Fallback: construct from VERCEL_URL if NEXTAUTH_URL not set
      if (!baseUrl && process.env.VERCEL_URL) {
        baseUrl = `https://${process.env.VERCEL_URL}`
      }
      
      // Last resort
      if (!baseUrl) {
        baseUrl = 'http://localhost:3000'
      }

      console.log('[v0] Stats API: Calling aprobados endpoint with baseUrl:', baseUrl)
      
      const approvedRes = await fetch(`${baseUrl}/api/company/documents/aprobados`, {
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
        }
      })
      
      if (approvedRes.ok) {
        const approvedData = await approvedRes.json()
        detailedApprovedCount = approvedData.total || 0
        console.log('[v0] Stats API: Using aprobados endpoint count:', detailedApprovedCount)
      } else {
        console.log('[v0] Stats API: aprobados endpoint returned error:', approvedRes.status)
      }
    } catch (e) {
      console.log('[v0] Stats API: Could not call aprobados endpoint, error:', e, 'using direct count:', approvedCount)
    }

    const stats = {
      conductores: conductorStats,
      subcontratistas: subStats,
      totals: {
        total: (conductorStats.total || 0) + (subStats.total || 0),
        pending: (conductorStats.pendientes || 0) + (subStats.pendientes || 0),
        approved: detailedApprovedCount > 0 ? detailedApprovedCount : approvedCount, // Prefer endpoint if successful
        rejected: (conductorStats.rechazados || 0) + (subStats.rechazados || 0),
      }
    }

    console.log('[v0] Stats API - Final counts:', {
      conductorAprobados: conductorStats.aprobados,
      subAprobados: subStats.aprobados,
      approvedFromEndpoint: detailedApprovedCount,
      totalAprobados: stats.totals.approved
    })

    return NextResponse.json({ stats }, { 
      status: 200,
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    })
  } catch (error: any) {
    console.error('[v0] Error in /api/dashboard/stats:', error.message)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
