export const dynamic = 'force-dynamic'
export const revalidate = 0

import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
)

export async function GET(request: Request) {
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

    console.log('[v0] Fetching metrics for range:', range, 'from:', startDate.toISOString())

    // Step 2: Get executives from /api/company/data (real data, not hardcoded)
    let executives: any[] = []
    let totalConductores = 0
    let totalSubcontratistas = 0
    try {
      const companyDataRes = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/company/data`)
      if (!companyDataRes.ok) throw new Error('Failed to fetch company data')
      const companyData = await companyDataRes.json()
      executives = companyData.executives || []
      totalConductores = (companyData.drivers || []).length
      totalSubcontratistas = (companyData.subcontractors || []).length
      console.log('[v0] Loaded from company data:', { executives: executives.length, drivers: totalConductores, subcontractors: totalSubcontratistas })
    } catch (error) {
      console.error('[v0] Failed to fetch company data:', error)
      executives = []
    }

    // Step 2: Fetch documents from uploaded_documents table
    const { data: dbDocuments, error: dbError } = await supabase
      .from('uploaded_documents')
      .select('id, conductor_id, validation_status, created_at, validated_at, validated_by')
      .eq('validation_status', 'validated')
      .gte('created_at', startDate.toISOString())
      .lte('created_at', endDate.toISOString())

    if (dbError) {
      console.error('[v0] Error fetching documents:', dbError)
    }

    console.log('[v0] Found documents from uploaded_documents table:', dbDocuments?.length || 0)

    // Step 3: Get executives from /api/company/data (real data, not hardcoded)
    try {
      const companyDataRes = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/company/data`)
      if (!companyDataRes.ok) throw new Error('Failed to fetch company data')
      const companyData = await companyDataRes.json()
      executives = companyData.executives || []
      totalConductores = (companyData.drivers || []).length
      totalSubcontratistas = (companyData.subcontractors || []).length
      console.log('[v0] Loaded from company data:', { executives: executives.length, drivers: totalConductores, subcontractors: totalSubcontratistas })
    } catch (error) {
      console.error('[v0] Failed to fetch company data:', error)
      executives = []
    }

    console.log('[v0] Found documents from uploaded_documents table:', dbDocuments?.length || 0)

    // Step 2: Get executives from /api/company/data (real data, not hardcoded)
    try {
      const companyDataRes = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/company/data`)
      if (!companyDataRes.ok) throw new Error('Failed to fetch company data')
      const companyData = await companyDataRes.json()
      executives = companyData.executives || []
      console.log('[v0] Loaded executives from company data:', executives.length)
    } catch (error) {
      console.error('[v0] Failed to fetch executives from company data, using empty list:', error)
      executives = []
    }

    // Step 3: Build metrics for each executive
    const metricsMap = new Map<string, any>()

    // Initialize all executives with 0 metrics
    executives.forEach((exec: any) => {
      metricsMap.set(exec.id, {
        executive_id: exec.id,
        executive_name: exec.full_name,
        documents_processed: 0,
        validated_count: 0,
        total_validation_time: 0,
      })
    })

    let totalDocuments = 0
    let totalValidated = 0
    let totalValidationTime = 0

    // Step 4: Process documents - link to executives by validated_by UUID
    if (dbDocuments && dbDocuments.length > 0) {
      dbDocuments.forEach((doc: any) => {
        // Only count documents that have been validated
        if (!doc.validated_by || doc.validation_status !== 'validated') {
          return
        }

        // The validated_by field contains a UUID, we need to match it with executive IDs
        // For now, since we have hardcoded executives, we'll skip if no validated_by
        const validatedBy = doc.validated_by
        
        // Try to find matching executive by ID (validated_by is a UUID)
        let matchingExec = executives.find((e: any) => e.id === validatedBy)

        // If not found and validated_by looks like an email, try matching by email
        if (!matchingExec && validatedBy && validatedBy.includes('@')) {
          matchingExec = executives.find((e: any) => e.email === validatedBy)
        }

        // If still no match, skip this document
        if (!matchingExec) {
          console.log('[v0] No matching executive found for validated_by:', validatedBy)
          return
        }

        totalDocuments++
        totalValidated++

        // Calculate validation time
        if (doc.created_at && doc.validated_at) {
          const createdTime = new Date(doc.created_at).getTime()
          const validatedTime = new Date(doc.validated_at).getTime()
          const timeSeconds = Math.round((validatedTime - createdTime) / 1000)
          totalValidationTime += timeSeconds
        }

        const metrics = metricsMap.get(matchingExec.id)
        metrics.documents_processed++
        metrics.validated_count++
        if (doc.created_at && doc.validated_at) {
          const createdTime = new Date(doc.created_at).getTime()
          const validatedTime = new Date(doc.validated_at).getTime()
          const timeSeconds = Math.round((validatedTime - createdTime) / 1000)
          metrics.total_validation_time += timeSeconds
        }
      })
    }

    // Format response with correct field names for frontend
    const executivesMetrics = Array.from(metricsMap.values()).map((m: any) => {
      const tasa = m.documents_processed > 0 
        ? Math.round((m.validated_count / m.documents_processed) * 100) 
        : 0
      const tiempo = m.documents_processed > 0
        ? Math.round(m.total_validation_time / m.documents_processed)
        : 0
      
      return {
        ejecutiva: m.executive_name,
        documentos_procesados: m.documents_processed,
        documentos_validados: m.validated_count,
        tasa_validacion: `${tasa}%`,
        tiempo_promedio: tiempo > 0 ? `${Math.floor(tiempo / 60)}m ${tiempo % 60}s` : '-',
      }
    })

    const summary = {
      total_documentos: totalDocuments,
      total_validados: totalValidated,
      total_conductores: totalConductores,
      total_subcontratistas: totalSubcontratistas,
    }

    console.log('[v0] Metrics calculated:', { 
      executives: executivesMetrics.length, 
      total_docs: totalDocuments,
      total_validated: totalValidated,
      metrics_by_exec: executivesMetrics.map(e => ({ name: e.ejecutiva, count: e.documentos_procesados }))
    })

    console.log('[v0] All executives being returned:', executivesMetrics)

    return NextResponse.json({
      executives: executivesMetrics,
      summary,
    })
  } catch (error) {
    console.error('[v0] Metrics endpoint error:', error)
    return NextResponse.json(
      { 
        executives: [],
        summary: {
          total_documents: 0,
          documents_increase: 0,
          avg_approval_rate: 0,
          avg_validation_time: 0,
        }
      },
      { status: 200 }
    )
  }
}
