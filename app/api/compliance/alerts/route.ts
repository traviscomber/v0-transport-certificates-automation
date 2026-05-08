import { createClient } from '@supabase/supabase-js'

/**
 * API endpoint: /api/compliance/alerts
 * Get all active compliance alerts
 */
export async function GET(request: Request) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !serviceRoleKey) {
      return Response.json(
        { error: 'Server configuration missing: SUPABASE_URL or SERVICE_ROLE_KEY' },
        { status: 500 }
      )
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey)

    const { data: alerts, error } = await supabase
      .from('compliance_alerts')
      .select('*')
      .eq('status', 'active')
      .order('severity', { ascending: false })
      .order('created_at', { ascending: false })

    if (error) throw error

    return Response.json({ alerts: alerts || [] })
  } catch (error) {
    console.error('[v0] Error fetching alerts:', error)
    return Response.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch alerts' },
      { status: 500 }
    )
  }
}
