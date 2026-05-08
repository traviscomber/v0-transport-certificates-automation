import { createClient } from '@supabase/supabase-js'

/**
 * API endpoint: /api/compliance/alerts/acknowledge
 * Acknowledge a compliance alert
 */
export async function POST(request: Request) {
  try {
    const { alertId } = await request.json()

    if (!alertId) {
      return Response.json({ error: 'alertId is required' }, { status: 400 })
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const { error } = await supabase
      .from('compliance_alerts')
      .update({ acknowledged_at: new Date().toISOString() })
      .eq('id', alertId)

    if (error) throw error

    return Response.json({ success: true })
  } catch (error) {
    console.error('[v0] Error acknowledging alert:', error)
    return Response.json(
      { error: error instanceof Error ? error.message : 'Failed to acknowledge alert' },
      { status: 500 }
    )
  }
}
