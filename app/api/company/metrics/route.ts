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

    console.log('[v0] Fetching metrics for range:', range, 'from', startDate.toISOString())

    // Fetch uploaded_documents with validation data (has validated_by, validated_at, validation_status)
    const { data: documents, error } = await (supabase as any)
      .from('uploaded_documents')
      .select('id, validation_status, validated_by, validated_at, created_at')
      .not('validated_at', 'is', null)
      .gte('validated_at', startDate.toISOString())

    if (error) {
      console.error('[v0] Error fetching documents:', error)
      return NextResponse.json(
        { error: 'Failed to fetch metrics: ' + error.message },
        { status: 500 }
      )
    }

    console.log('[v0] Fetched documents:', documents?.length || 0)

    // If no documents, return empty metrics
    if (!documents || documents.length === 0) {
      return NextResponse.json({
        executives: [],
        summary: {
          total_documents: 0,
          documents_increase: 0,
          avg_approval_rate: 0,
          avg_validation_time: 0,
        },
      })
    }

    // Get profile info for validated_by executivas
    const validatedByIds = [...new Set(documents.map((d: any) => d.validated_by).filter(Boolean))]
    const { data: profiles, error: profilesError } = await (supabase as any)
      .from('profiles')
      .select('id, full_name')
      .in('id', validatedByIds)

    if (profilesError) {
      console.error('[v0] Error fetching profiles:', profilesError)
    }

    const profileMap = new Map(profiles?.map((p: any) => [p.id, p]) || [])

    // Process metrics grouped by executive (validated_by)
    const metricsMap = new Map<string, any>()
    let totalValidated = 0
    let totalDocuments = 0
    let totalValidationTime = 0

    documents.forEach((doc: any) => {
      if (!doc.validated_by) return

      const profile = profileMap.get(doc.validated_by)
      const executiveName = profile?.full_name || doc.validated_by

      totalDocuments++
      if (doc.validation_status === 'validated') totalValidated++

      // Calculate validation time
      if (doc.created_at && doc.validated_at) {
        const createdTime = new Date(doc.created_at).getTime()
        const validatedTime = new Date(doc.validated_at).getTime()
        const timeSeconds = Math.round((validatedTime - createdTime) / 1000)
        totalValidationTime += timeSeconds
      }

      if (!metricsMap.has(doc.validated_by)) {
        metricsMap.set(doc.validated_by, {
          executive_id: doc.validated_by,
          executive_name: executiveName,
          documents_processed: 0,
          validated_count: 0,
          total_validation_time: 0,
        })
      }

      const metrics = metricsMap.get(doc.validated_by)
      metrics.documents_processed++
      if (doc.validation_status === 'validated') metrics.validated_count++

      if (doc.created_at && doc.validated_at) {
        const createdTime = new Date(doc.created_at).getTime()
        const validatedTime = new Date(doc.validated_at).getTime()
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
        ? Math.round((m.validated_count / m.documents_processed) * 100) 
        : 0,
      avg_validation_time: m.documents_processed > 0
        ? Math.round(m.total_validation_time / m.documents_processed)
        : 0,
      avg_ai_confidence: 0,
    }))

    const summary = {
      total_documents: totalDocuments,
      documents_increase: 0,
      avg_approval_rate: totalDocuments > 0 
        ? Math.round((totalValidated / totalDocuments) * 100)
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
