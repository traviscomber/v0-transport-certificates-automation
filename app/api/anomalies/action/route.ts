import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { verifyAuth } from '@/lib/auth-middleware'
import { validateAnomalyActionRequest } from '@/lib/validation/schemas'

export async function POST(request: NextRequest) {
  try {
    const { user, error: authError } = await verifyAuth(request)
    
    if (authError || !user) {
      return NextResponse.json({ error: authError || 'Unauthorized' }, { status: 401 })
    }

    const supabase = await createClient()
    const body = await request.json()

    // Validate request body
    const validation = validateAnomalyActionRequest(body)
    if (!validation.valid) {
      return NextResponse.json({ 
        error: 'Invalid request', 
        details: validation.errors 
      }, { status: 400 })
    }

    const { anomaly_id, action, notes } = body

    // Update the anomaly with action
    const { error: updateError } = await supabase
      .from('anomaly_tracking')
      .update({
        action_taken: action,
        action_taken_by: user.id,
        action_taken_at: new Date().toISOString(),
        action_notes: notes || null,
      })
      .eq('id', anomaly_id)

    if (updateError) {
      console.error('[v0] Anomaly update error:', updateError)
      return NextResponse.json({ error: 'Failed to update anomaly' }, { status: 500 })
    }

    return NextResponse.json({ success: true, anomaly_id })
  } catch (error) {
    console.error('Anomaly action error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
