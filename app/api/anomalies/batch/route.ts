import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { verifyAuth } from '@/lib/auth-middleware'

export async function POST(request: NextRequest) {
  try {
    const { user, error: authError } = await verifyAuth(request)

    if (authError || !user) {
      return NextResponse.json({ error: authError || 'Unauthorized' }, { status: 401 })
    }

    const supabase = await createClient()
    const body = await request.json()

    const { anomaly_ids, action, notes } = body

    // Validate request
    if (!Array.isArray(anomaly_ids) || anomaly_ids.length === 0) {
      return NextResponse.json({ error: 'Invalid anomaly_ids array' }, { status: 400 })
    }

    if (!action) {
      return NextResponse.json({ error: 'Action is required' }, { status: 400 })
    }

    // Batch update anomalies
    const now = new Date().toISOString()
    const { error: updateError } = await supabase
      .from('anomaly_tracking')
      .update({
        action_taken: action,
        action_taken_by: user.id,
        action_taken_at: now,
        action_notes: notes || null,
      })
      .in('id', anomaly_ids)

    if (updateError) {
      console.error('[v0] Batch update error:', updateError)
      return NextResponse.json({ error: 'Failed to update anomalies' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      updated_count: anomaly_ids.length,
      action,
      timestamp: now,
    })
  } catch (error) {
    console.error('[v0] Batch action error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
