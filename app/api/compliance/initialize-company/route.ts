import { createClient } from '@supabase/supabase-js'

/**
 * API endpoint: /api/compliance/initialize-company
 * Initializes compliance tracking for a company with all required documents
 */
export async function POST(request: Request) {
  try {
    const { transportistaId } = await request.json()

    if (!transportistaId) {
      return Response.json({ error: 'transportistaId is required' }, { status: 400 })
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    console.log('[v0] Initializing compliance for company:', transportistaId)

    // Get all company document requirements
    const { data: requirements, error: reqError } = await supabase
      .from('document_requirements')
      .select('id, code, name, periodicity')
      .eq('applicable_to_transportista', true)
      .eq('is_active', true)

    if (reqError) throw reqError

    console.log(`[v0] Found ${requirements?.length || 0} document requirements for company`)

    // Check existing compliance records
    const { data: existing } = await supabase
      .from('company_document_compliance')
      .select('document_requirement_id')
      .eq('transportista_id', transportistaId)

    const existingIds = new Set(existing?.map((e) => e.document_requirement_id) || [])

    // Insert missing compliance records
    const toInsert: any[] = []
    for (const req of requirements || []) {
      if (!existingIds.has(req.id)) {
        toInsert.push({
          transportista_id: transportistaId,
          document_requirement_id: req.id,
          status: 'pending',
          submission_date: null,
          expiry_date: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
      }
    }

    if (toInsert.length > 0) {
      const { error: insertError } = await supabase
        .from('company_document_compliance')
        .insert(toInsert)

      if (insertError) throw insertError
      console.log(`[v0] Created ${toInsert.length} compliance records`)
    }

    // Calculate compliance score
    const { data: allCompliance } = await supabase
      .from('company_document_compliance')
      .select('status, expiry_date')
      .eq('transportista_id', transportistaId)

    const now = new Date()
    let completed = 0
    let expired = 0

    allCompliance?.forEach((item) => {
      if (item.status === 'approved') {
        completed++
        if (item.expiry_date && new Date(item.expiry_date) < now) {
          expired++
        }
      }
    })

    const total = allCompliance?.length || 0
    const score = total > 0 ? (completed / total) * 100 : 0
    const riskLevel = score >= 90 ? 'low' : score >= 70 ? 'medium' : 'high'

    // Store compliance score
    const { error: scoreError } = await supabase.from('compliance_scores').upsert({
      entity_type: 'company',
      entity_id: transportistaId,
      total_required_documents: total,
      completed_documents: completed,
      pending_documents: total - completed,
      expired_documents: expired,
      missing_documents: total - completed,
      compliance_score: score,
      risk_level: riskLevel,
      calculated_at: new Date().toISOString(),
    })

    if (scoreError) console.error('[v0] Error saving compliance score:', scoreError)

    return Response.json({
      success: true,
      complianceScore: {
        total: total,
        completed: completed,
        score: Math.round(score),
        riskLevel,
      },
    })
  } catch (error) {
    console.error('[v0] Compliance initialization error:', error)
    return Response.json(
      { error: error instanceof Error ? error.message : 'Compliance initialization failed' },
      { status: 500 }
    )
  }
}
