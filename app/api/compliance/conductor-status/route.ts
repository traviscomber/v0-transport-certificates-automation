import { createClient } from '@supabase/supabase-js'

/**
 * API endpoint: /api/compliance/conductor-status
 * Returns conductor's compliance status and document requirements
 */
export async function POST(request: Request) {
  try {
    const { conductorId } = await request.json()

    if (!conductorId) {
      return Response.json({ error: 'conductorId is required' }, { status: 400 })
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Get all compliance records for conductor
    const { data: compliance, error: complianceError } = await supabase
      .from('conductor_document_compliance')
      .select(
        `
        id,
        status,
        submission_date,
        expiry_date,
        rejection_reason,
        document_requirement_id,
        document_requirement:document_requirements(
          id,
          code,
          name,
          category,
          periodicity,
          expiration_warning_days
        )
      `
      )
      .eq('conductor_id', conductorId)

    if (complianceError) throw complianceError

    // Transform data
    const documents = (compliance || []).map((item: any) => {
      const expiryDate = item.expiry_date ? new Date(item.expiry_date) : null
      const daysUntilExpiry = expiryDate ? Math.floor((expiryDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)) : null

      return {
        id: item.id,
        code: item.document_requirement.code,
        name: item.document_requirement.name,
        category: item.document_requirement.category,
        periodicity: item.document_requirement.periodicity,
        status: item.status,
        submissionDate: item.submission_date,
        expiryDate: item.expiry_date,
        daysUntilExpiry,
        rejectionReason: item.rejection_reason,
      }
    })

    // Calculate compliance score
    const now = new Date()
    let completed = 0
    let expired = 0

    documents.forEach((doc: any) => {
      if (doc.status === 'approved') {
        completed++
        if (doc.expiryDate && new Date(doc.expiryDate) < now) {
          expired++
        }
      }
    })

    const total = documents.length
    const score = total > 0 ? (completed / total) * 100 : 0
    const riskLevel = score >= 90 ? 'low' : score >= 70 ? 'medium' : 'high'

    return Response.json({
      conductorId,
      documents,
      complianceScore: {
        score: Math.round(score),
        riskLevel,
        completed,
        total,
        expired,
      },
    })
  } catch (error) {
    console.error('[v0] Compliance status error:', error)
    return Response.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch compliance status' },
      { status: 500 }
    )
  }
}
