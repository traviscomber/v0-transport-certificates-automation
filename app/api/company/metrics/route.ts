import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/client'

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient()
    if (!supabase) {
      return NextResponse.json(
        { error: 'Database connection error' },
        { status: 500 }
      )
    }

    const searchParams = request.nextUrl.searchParams
    const range = searchParams.get('range') || 'week' // day, week, month

    // Calculate date range
    let daysBack = 7
    if (range === 'day') daysBack = 1
    if (range === 'month') daysBack = 30

    const startDate = new Date()
    startDate.setDate(startDate.getDate() - daysBack)
    startDate.setHours(0, 0, 0, 0)

    // Fetch certificates with validation data - use simple select without RLS filters
    const { data: certificates, error } = await (supabase as any)
      .from('certificates')
      .select('id, status, driver_id, validated_by, validated_at, created_at, validation_notes')
      .not('validated_at', 'is', null)
      .gte('validated_at', startDate.toISOString())

    if (error) {
      console.error('[v0] Error fetching certificates:', error)
      console.error('[v0] Error details:', { code: error.code, message: error.message })
      return NextResponse.json(
        { error: 'Failed to fetch metrics: ' + error.message, details: error },
        { status: 500 }
      )
    }

    console.log('[v0] Fetched certificates:', certificates?.length || 0)

    // Process metrics
    const metricsMap = new Map<string, any>()
    let totalApprovals = 0
    let totalDocuments = 0
    let totalValidationTime = 0

    certificates.forEach((cert: any) => {
      if (!cert.validated_by) return

      totalDocuments++
      if (cert.status === 'approved') totalApprovals++

      // Calculate validation time from created_at to validated_at
      if (cert.created_at && cert.validated_at) {
        const createdTime = new Date(cert.created_at).getTime()
        const validatedTime = new Date(cert.validated_at).getTime()
        const timeSeconds = Math.round((validatedTime - createdTime) / 1000)
        totalValidationTime += timeSeconds
      }

      if (!metricsMap.has(cert.validated_by)) {
        metricsMap.set(cert.validated_by, {
          executive_id: cert.validated_by,
          executive_name: cert.validated_by, // TODO: Join with profiles table
          documents_processed: 0,
          approved: 0,
          total_validation_time: 0,
        })
      }

      const metrics = metricsMap.get(cert.validated_by)
      metrics.documents_processed++
      if (cert.status === 'approved') metrics.approved++
      
      // Calculate validation time
      if (cert.created_at && cert.validated_at) {
        const createdTime = new Date(cert.created_at).getTime()
        const validatedTime = new Date(cert.validated_at).getTime()
        const timeSeconds = Math.round((validatedTime - createdTime) / 1000)
        metrics.total_validation_time += timeSeconds
      }
    })

    // Format response
    const executives = Array.from(metricsMap.values()).map((m: any) => ({
      executive_id: m.executive_id,
      executive_name: m.executive_name,
      documents_processed: m.documents_processed,
      approval_rate: m.documents_processed > 0 
        ? Math.round((m.approved / m.documents_processed) * 100) 
        : 0,
      avg_validation_time: m.documents_processed > 0
        ? Math.round(m.total_validation_time / m.documents_processed)
        : 0,
      avg_ai_confidence: 0, // Placeholder - will be updated when AI fields are added
    }))

    const summary = {
      total_documents: totalDocuments,
      documents_increase: 0, // TODO: Calculate from previous period
      avg_approval_rate: totalDocuments > 0 
        ? Math.round((totalApprovals / totalDocuments) * 100)
        : 0,
      avg_validation_time: totalDocuments > 0
        ? Math.round(totalValidationTime / totalDocuments)
        : 0,
    }

    return NextResponse.json({
      executives: executives.sort((a: any, b: any) => b.documents_processed - a.documents_processed),
      summary,
    })
  } catch (error) {
    console.error('[v0] Metrics endpoint error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
