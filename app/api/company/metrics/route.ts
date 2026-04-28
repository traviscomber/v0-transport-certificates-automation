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

    // Fetch ALL documents to calculate metrics
    const { data: allDocsDetail, error: allDocsDetailError } = await supabase
      .from('uploaded_documents')
      .select('id, conductor_id, validation_status, created_at, validated_at')
      .gte('created_at', startDate.toISOString())
      .lte('created_at', endDate.toISOString())

    if (allDocsDetailError) {
      console.error('[v0] Error fetching all documents:', allDocsDetailError)
    }

    console.log('[v0] Found all documents:', allDocsDetail?.length || 0)

    // Get validated documents for faster processing
    const { data: validatedDocs, error: validatedError } = await supabase
      .from('uploaded_documents')
      .select('id, conductor_id, validation_status, created_at, validated_at')
      .eq('validation_status', 'validated')
      .gte('created_at', startDate.toISOString())
      .lte('created_at', endDate.toISOString())

    if (validatedError) {
      console.error('[v0] Error fetching validated documents:', validatedError)
    }

    console.log('[v0] Found validated documents:', validatedDocs?.length || 0)

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

    // Build comprehensive metrics map for each executive
    const metricsMap = new Map<string, any>()

    // Initialize all executives with comprehensive metrics
    executives.forEach((exec: any) => {
      metricsMap.set(exec.id, {
        ejecutiva: exec.full_name,
        documentos_procesados: 0,
        documentos_validados: 0,
        documentos_rechazados: 0,
        documentos_pendientes: 0,
        conductores_activos: 0,
        total_validation_time: 0,
        validations_count: 0,
      })
    })

    // Get all conductores associated with each executive through subcontractors
    let conductoesEnriquecidos: any[] = []
    try {
      const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
      const dashboardRes = await fetch(`${siteUrl}/api/dashboard/data`, {
        cache: 'no-store',
        headers: { 'Cache-Control': 'no-cache' }
      })
      if (dashboardRes.ok) {
        const dashboardData = await dashboardRes.json()
        conductoesEnriquecidos = dashboardData.dashboard?.conductores || []
      }
    } catch (error) {
      console.error('[v0] Failed to fetch conductores for executive mapping:', error)
    }

    // Process all documents to populate metrics
    if (Array.isArray(allDocsDetail)) {
      allDocsDetail.forEach((doc: any) => {
        // Find which executive this document belongs to (through conductor's subcontractor)
        const conductor = conductoesEnriquecidos.find((c: any) => c.rut === doc.conductor_id)
        if (conductor?.ejecutivo_nombre) {
          const exec = executives.find((e: any) => e.full_name === conductor.ejecutivo_nombre)
          if (exec) {
            const metric = metricsMap.get(exec.id)
            if (metric) {
              metric.documentos_procesados++

              if (doc.validation_status === 'validated') {
                metric.documentos_validados++
                if (doc.validated_at && doc.created_at) {
                  const validationTime = new Date(doc.validated_at).getTime() - new Date(doc.created_at).getTime()
                  metric.total_validation_time += validationTime
                  metric.validations_count++
                }
              } else if (doc.validation_status === 'rejected') {
                metric.documentos_rechazados++
              } else if (doc.validation_status === 'pending') {
                metric.documentos_pendientes++
              }
            }
          }
        }
      })
    }

    // Count active conductores per executive
    if (Array.isArray(conductoesEnriquecidos)) {
      conductoesEnriquecidos.forEach((conductor: any) => {
        if (conductor.ejecutivo_nombre && conductor.is_active !== false) {
          const exec = executives.find((e: any) => e.full_name === conductor.ejecutivo_nombre)
          if (exec) {
            const metric = metricsMap.get(exec.id)
            if (metric) {
              metric.conductores_activos++
            }
          }
        }
      })
    }

    // Count total documents (all uploaded in period)
    const { data: allDocs, error: allDocsError } = await supabase
      .from('uploaded_documents')
      .select('id', { count: 'exact' })
      .gte('created_at', startDate.toISOString())
      .lte('created_at', endDate.toISOString())

    const totalDocuments = allDocs?.length || 0
    const totalValidated = validatedDocs?.length || 0

    console.log('[v0] Total documents:', totalDocuments, 'Validated:', totalValidated)

    // Format executives metrics with rich data
    const executivesMetrics = Array.from(metricsMap.values()).map((m: any) => {
      const tasa = m.documentos_procesados > 0
        ? Math.round((m.documentos_validados / m.documentos_procesados) * 100)
        : 0

      const tasaRechazo = m.documentos_procesados > 0
        ? Math.round((m.documentos_rechazados / m.documentos_procesados) * 100)
        : 0

      const tiempo = m.validations_count > 0
        ? Math.round(m.total_validation_time / m.validations_count / 1000) // Convert to seconds
        : 0

      // Calculate performance score (0-100)
      // 50% validation rate + 25% rejection rate + 25% completion (time-based)
      let perfScore = 0
      perfScore += (tasa / 100) * 50 // Validation rate weight
      perfScore += Math.max(0, (100 - tasaRechazo) / 100) * 25 // Low rejection rate weight
      perfScore += Math.min(100, (tiempo > 0 ? Math.min(1, 86400 / tiempo) : 0)) * 25 // Speed weight

      return {
        ejecutiva: m.ejecutiva,
        documentos_procesados: m.documentos_procesados,
        documentos_validados: m.documentos_validados,
        documentos_rechazados: m.documentos_rechazados,
        documentos_pendientes: m.documentos_pendientes,
        conductores_activos: m.conductores_activos,
        tasa_validacion: `${tasa}%`,
        tasa_rechazo: `${tasaRechazo}%`,
        tiempo_promedio: tiempo > 0 ? `${Math.floor(tiempo / 3600)}h ${Math.floor((tiempo % 3600) / 60)}m` : '—',
        performance_score: Math.round(perfScore),
      }
    })

    console.log('[v0] Calculated metrics for', executivesMetrics.length, 'executives')

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
