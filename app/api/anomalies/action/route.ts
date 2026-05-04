import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getCompanyFromAuth, getUserFromAuth } from '@/lib/auth'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
  try {
    const company = await getCompanyFromAuth()
    if (!company) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await getUserFromAuth()
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 401 })
    }

    const { anomaly_id, action, notes } = await request.json()

    if (!anomaly_id || !action) {
      return NextResponse.json(
        { error: 'Missing required fields: anomaly_id, action' },
        { status: 400 }
      )
    }

    const validActions = ['approved', 'rejected', 'investigated', 'pending']
    if (!validActions.includes(action)) {
      return NextResponse.json(
        { error: `Invalid action. Must be one of: ${validActions.join(', ')}` },
        { status: 400 }
      )
    }

    // Verify the anomaly belongs to this company
    const { data: anomaly, error: anomalyError } = await supabase
      .from('anomalies_with_document_details')
      .select('id, company_id')
      .eq('id', anomaly_id)
      .single()

    if (anomalyError || !anomaly) {
      return NextResponse.json({ error: 'Anomaly not found' }, { status: 404 })
    }

    if (anomaly.company_id !== company.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    // Update the anomaly
    const { data: updated, error: updateError } = await supabase
      .from('anomaly_tracking')
      .update({
        action_taken: action,
        action_taken_by: user.id,
        action_taken_at: new Date().toISOString(),
        action_notes: notes || null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', anomaly_id)
      .select()
      .single()

    if (updateError) {
      console.error('[v0] Anomaly update error:', updateError)
      return NextResponse.json({ error: 'Failed to update anomaly' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: `Anomaly marked as ${action}`,
      anomaly: updated,
    })
  } catch (error) {
    console.error('[v0] Anomaly action API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
