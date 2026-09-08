import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { verifyAuth } from '@/lib/auth-middleware'
import { ALL_VALUE, getMonthYearRange } from '@/lib/date-filters'

export const dynamic = 'force-dynamic'
export const revalidate = 0

type SubcontractorDocumentRow = {
  id: string
  status?: string | null
  uploaded_at?: string | null
  reviewed_at?: string | null
  ai_analyzed_at?: string | null
  uploaded_by_ejecutiva?: string | null
}

type UploadedDocumentRow = {
  id: string
  validation_status?: string | null
  created_at?: string | null
  validated_at?: string | null
  ai_processed_at?: string | null
  ai_analyzed_at?: string | null
  vision_processed_at?: string | null
  processed_at?: string | null
}

async function fetchAllRows<T>(query: any, batchSize = 1000): Promise<T[]> {
  const rows: T[] = []
  let start = 0

  while (true) {
    const { data, error } = await query.range(start, start + batchSize - 1)
    if (error) throw error
    const batch = (data || []) as T[]
    rows.push(...batch)
    if (batch.length < batchSize) break
    start += batchSize
  }

  return rows
}

function median(values: number[]) {
  if (values.length === 0) return null
  const sorted = [...values].sort((a, b) => a - b)
  const middle = Math.floor(sorted.length / 2)
  return sorted.length % 2 === 0
    ? Math.round((sorted[middle - 1] + sorted[middle]) / 2)
    : Math.round(sorted[middle])
}

export async function GET(request: NextRequest) {
  try {
    const auth = await verifyAuth(request)
    if (!auth.authenticated) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const month = searchParams.get('month') || ALL_VALUE
    const year = searchParams.get('year') || ALL_VALUE
    const periodRange = getMonthYearRange(month, year)
    const supabase = createAdminClient()

    let subcontractorQuery = supabase
      .from('subcontractor_documents')
      .select('id, status, uploaded_at, reviewed_at, ai_analyzed_at, uploaded_by_ejecutiva')
      .order('uploaded_at', { ascending: false })

    let uploadedQuery = supabase
      .from('uploaded_documents')
      .select('id, validation_status, created_at, validated_at, ai_processed_at, ai_analyzed_at, vision_processed_at, processed_at')
      .order('created_at', { ascending: false })

    if (periodRange) {
      subcontractorQuery = subcontractorQuery
        .gte('uploaded_at', periodRange.start.toISOString())
        .lte('uploaded_at', periodRange.end.toISOString())
      uploadedQuery = uploadedQuery
        .gte('created_at', periodRange.start.toISOString())
        .lte('created_at', periodRange.end.toISOString())
    }

    const [subcontractorDocs, uploadedDocs] = await Promise.all([
      fetchAllRows<SubcontractorDocumentRow>(subcontractorQuery),
      fetchAllRows<UploadedDocumentRow>(uploadedQuery),
    ])

    const delegatedUploads = subcontractorDocs.filter(
      (doc) => !doc.uploaded_by_ejecutiva || doc.uploaded_by_ejecutiva.trim() === ''
    ).length
    const aiAnalyzed = subcontractorDocs.filter((doc) => Boolean(doc.ai_analyzed_at)).length
    const humanReviewed = subcontractorDocs.filter((doc) => Boolean(doc.reviewed_at)).length
    const approvedOrRejected = subcontractorDocs.filter((doc) =>
      ['approved', 'rejected'].includes((doc.status || '').toLowerCase())
    ).length

    const uploadToAiSeconds = subcontractorDocs.flatMap((doc) => {
      if (!doc.uploaded_at || !doc.ai_analyzed_at) return []
      const uploadedAt = new Date(doc.uploaded_at).getTime()
      const analyzedAt = new Date(doc.ai_analyzed_at).getTime()
      if (!Number.isFinite(uploadedAt) || !Number.isFinite(analyzedAt) || analyzedAt < uploadedAt) return []
      return [Math.round((analyzedAt - uploadedAt) / 1000)]
    })

    const legacyProcessed = uploadedDocs.filter((doc) =>
      Boolean(doc.ai_processed_at || doc.ai_analyzed_at || doc.vision_processed_at || doc.processed_at)
    ).length

    const totalObserved = subcontractorDocs.length + uploadedDocs.length
    const totalProcessed = approvedOrRejected + legacyProcessed

    return NextResponse.json(
      {
        summary: {
          total_observed: totalObserved,
          subcontractor_documents: subcontractorDocs.length,
          delegated_uploads: delegatedUploads,
          ai_analyzed: aiAnalyzed,
          human_reviewed: humanReviewed,
          decisions_recorded: approvedOrRejected,
          legacy_processed: legacyProcessed,
          processed_observed: totalProcessed,
          median_upload_to_ai_seconds: median(uploadToAiSeconds),
          ai_timing_samples: uploadToAiSeconds.length,
          period_month: month,
          period_year: year,
        },
        methodology: {
          time_saved_hours: null,
          time_saved_status: 'not_measurable_yet',
          note: 'No se estima ahorro de horas sin una línea base observada de tiempo activo del proceso manual anterior.',
        },
      },
      { headers: { 'Cache-Control': 'no-store, must-revalidate' } }
    )
  } catch (error) {
    console.error('[ChileFlota] Error in GET /api/company/metrics:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Error fetching operational impact metrics' },
      { status: 500 }
    )
  }
}
