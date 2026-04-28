import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const range = searchParams.get('range') || 'week'

    // Calculate date range
    let daysBack = 7
    if (range === 'day') daysBack = 1
    if (range === 'month') daysBack = 30

    const startDate = new Date()
    startDate.setDate(startDate.getDate() - daysBack)
    startDate.setHours(0, 0, 0, 0)

    const endDate = new Date()
    endDate.setHours(23, 59, 59, 999)

    console.log('[v0] Fetching metrics for range:', range, 'from:', startDate.toISOString(), 'to:', endDate.toISOString())

    // Get Supabase client for queries
    const supabase = await createClient()

    // Fetch validated documents
    const { data: dbDocuments, error: dbError } = await supabase
      .from('uploaded_documents')
      .select('id, conductor_id, validation_status, created_at, validated_at, validated_by')
      .eq('validation_status', 'validated')
      .gte('created_at', startDate.toISOString())
      .lte('created_at', endDate.toISOString())

    if (dbError) {
      console.error('[v0] Error fetching documents:', dbError)
    }

    console.log('[v0] Found validated documents:', dbDocuments?.length || 0)

    // Get executives from company API
    let executives: any[] = []
    let totalConductores = 0
    let totalSubcontratistas = 0
    try {
      const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
      const companyDataRes = await fetch(`${siteUrl}/api/company/data`, { 
        cache: 'no-store',
        headers: { 'Cache-Control': 'no-cache' }
      })
      if (!companyDataRes.ok) throw new Error('Failed to fetch company data')
      const companyData = await companyDataRes.json()
      executives = companyData.executives || []
      
      // Also try to get counts from dashboard data
      const dashboardRes = await fetch(`${siteUrl}/api/dashboard/data`, {
        cache: 'no-store',
        headers: { 'Cache-Control': 'no-cache' }
      })
      if (dashboardRes.ok) {
        const dashboardData = await dashboardRes.json()
        totalConductores = dashboardData.dashboard?.stats?.totalConductores || dashboardData.dashboard?.conductores?.length || 0
        totalSubcontratistas = dashboardData.dashboard?.stats?.totalTransportistas || dashboardData.dashboard?.transportistas?.length || 0
      }
      
      console.log('[v0] Loaded executives:', executives.length, 'conductores:', totalConductores, 'subcontratistas:', totalSubcontratistas)
    } catch (error) {
      console.error('[v0] Failed to fetch executives:', error)
      executives = []
    }

    // Build metrics map for each executive
    const metricsMap = new Map<string, any>()

    // Initialize all executives with zero metrics
    executives.forEach((exec: any) => {
      metricsMap.set(exec.id, {
        ejecutiva: exec.full_name,
        documentos_procesados: 0,
        documentos_validados: 0,
        total_validation_time: 0,
      })
    })

    // Count total documents (all uploaded in period)
    const { data: allDocs, error: allDocsError } = await supabase
      .from('uploaded_documents')
      .select('id', { count: 'exact' })
      .gte('created_at', startDate.toISOString())
      .lte('created_at', endDate.toISOString())

    const totalDocuments = allDocs?.length || 0
    const totalValidated = dbDocuments?.length || 0

    console.log('[v0] Total documents:', totalDocuments, 'Validated:', totalValidated)

    // Format executives metrics
    const executivesMetrics = Array.from(metricsMap.values()).map((m: any) => {
      const tasa = m.documentos_procesados > 0
        ? Math.round((m.documentos_validados / m.documentos_procesados) * 100)
        : 0
      const tiempo = m.documentos_procesados > 0
        ? Math.round(m.total_validation_time / m.documentos_procesados)
        : 0

      return {
        ejecutiva: m.ejecutiva,
        documentos_procesados: m.documentos_procesados,
        documentos_validados: m.documentos_validados,
        tasa_validacion: `${tasa}%`,
        tiempo_promedio: tiempo > 0 ? `${Math.floor(tiempo / 60)}m ${tiempo % 60}s` : '—',
      }
    })

    const summary = {
      total_documentos: totalDocuments,
      total_validados: totalValidated,
      total_conductores: totalConductores,
      total_subcontratistas: totalSubcontratistas,
    }

    console.log('[v0] Metrics response:', { executives: executivesMetrics.length, summary })

    return NextResponse.json({
      executives: executivesMetrics,
      summary,
    })

  } catch (error) {
    console.error('[v0] Error in GET /api/company/metrics:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Error fetching metrics' },
      { status: 500 }
    )
  }
}
