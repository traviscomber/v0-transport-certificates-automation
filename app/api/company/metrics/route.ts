export const dynamic = 'force-dynamic'

import { createAdminClient } from '@/lib/supabase/admin'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const adminClient = createAdminClient()

    // Get company_id/transportista_id from query params
    const searchParams = request.nextUrl.searchParams
    let transportistaId = searchParams.get('company_id') || searchParams.get('transportista_id')

    const range = searchParams.get('range') || 'week'

    // Calculate date range
    let daysBack = 7
    if (range === 'day') daysBack = 1
    if (range === 'month') daysBack = 30

    const startDate = new Date()
    startDate.setDate(startDate.getDate() - daysBack)
    startDate.setHours(0, 0, 0, 0)

    console.log('[v0] Fetching metrics for transportista:', transportistaId, 'range:', range)

    // If no transportista specified, get Labbe (Transportes Labbe Hermanos Limitada)
    if (!transportistaId) {
      const { data: labbe, error: labbeError } = await adminClient
        .from('transportistas')
        .select('id')
        .or('nombre_fantasia.eq.Transportes Labbe,razon_social.eq.Transportes Labbe Hermanos Limitada,rut.eq.78.376.780-5')
        .single()

      if (labbeError || !labbe) {
        console.error('[v0] Error finding Labbe transportista:', labbeError)
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
      transportistaId = labbe.id
      console.log('[v0] Found Labbe transportista ID:', transportistaId)
    }

    // Step 1: Get executives for this transportista
    const { data: executives, error: execError } = await adminClient
      .from('executive_staff')
      .select('id, full_name, rut, email, cargo, transportista_id')
      .eq('cargo', 'Ejecutiva')
      .eq('transportista_id', transportistaId)

    if (execError) {
      console.error('[v0] Error fetching executives:', execError)
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

    console.log('[v0] Found all executives:', executives?.length || 0)

    // Step 1b: Get transportista info to find which executives belong to this company
    const { data: transportista, error: transportError } = await adminClient
      .from('transportistas')
      .select('id')
      .eq('id', companyId)
      .single()
    if (execError) {
      console.error('[v0] Error fetching executives:', execError)
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

    console.log('[v0] Found executives:', executives?.length || 0)

    if (!executives || executives.length === 0) {
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

    // Step 2: Get documents from this transportista
    const { data: documents, error: docsError } = await adminClient
      .from('uploaded_documents')
      .select('*')
      .eq('transportista_id', transportistaId)
      .gte('created_at', startDate.toISOString())

    console.log('[v0] Fetched documents:', documents?.length || 0, 'error:', docsError?.message)

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

    // Process documents if available
    if (documents && documents.length > 0) {
      documents.forEach((doc: any) => {
        // Get who validated this document
        const validatedBy = doc.validated_by || doc.executor_id || doc.reviewed_by
        if (!validatedBy) return

        // Find matching executive by ID
        let matchingExec = executives.find((e: any) => e.id === validatedBy)

        // If not found by ID, try by email
        if (!matchingExec && doc.validated_by_email) {
          matchingExec = executives.find((e: any) => e.email === doc.validated_by_email)
        }

        if (!matchingExec) return

        totalDocuments++

        // Check if document is validated/approved
        const isValidated =
          doc.validation_status === 'validated' ||
          doc.status === 'approved' ||
          doc.status === 'validated'
        if (isValidated) totalValidated++

        // Calculate validation time
        if (doc.created_at && doc.validated_at) {
          const createdTime = new Date(doc.created_at).getTime()
          const validatedTime = new Date(doc.validated_at).getTime()
          const timeSeconds = Math.round((validatedTime - createdTime) / 1000)
          totalValidationTime += timeSeconds
        }

        const metrics = metricsMap.get(matchingExec.id)
        metrics.documents_processed++
        if (isValidated) metrics.validated_count++
        if (doc.created_at && doc.validated_at) {
          const createdTime = new Date(doc.created_at).getTime()
          const validatedTime = new Date(doc.validated_at).getTime()
          const timeSeconds = Math.round((validatedTime - createdTime) / 1000)
          metrics.total_validation_time += timeSeconds
        }
      })
    }

    // Format response
    const executivesMetrics = Array.from(metricsMap.values()).map((m: any) => ({
      executive_id: m.executive_id,
      executive_name: m.executive_name,
      documents_processed: m.documents_processed,
      approval_rate:
        m.documents_processed > 0
          ? Math.round((m.validated_count / m.documents_processed) * 100)
          : 0,
      avg_validation_time:
        m.documents_processed > 0
          ? Math.round(m.total_validation_time / m.documents_processed)
          : 0,
      avg_ai_confidence: 0,
    }))

    const summary = {
      total_documents: totalDocuments,
      documents_increase: 0,
      avg_approval_rate:
        totalDocuments > 0
          ? Math.round((totalValidated / totalDocuments) * 100)
          : 0,
      avg_validation_time:
        totalDocuments > 0 ? Math.round(totalValidationTime / totalDocuments) : 0,
    }

    console.log('[v0] Metrics calculated:', {
      executives: executivesMetrics.length,
      total_docs: totalDocuments,
    })

    return NextResponse.json({
      executives: executivesMetrics.sort(
        (a: any, b: any) => b.documents_processed - a.documents_processed
      ),
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
