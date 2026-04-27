import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
)

export async function GET() {
  try {
    // Get all profiles/users from Labbe organization
    const { data: profiles, error } = await supabase
      .from('profiles')
      .select(`
        id,
        email,
        full_name,
        rut,
        role,
        organization_id,
        created_at
      `)
      .order('created_at', { ascending: false })

    if (error) throw error

    if (!profiles || profiles.length === 0) {
      return NextResponse.json({ users: [], metrics: {} })
    }

    // Get metrics for each user
    const userMetrics: any = {}

    for (const profile of profiles) {
      // Count documents
      const { count: documentsCount } = await supabase
        .from('documents')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', profile.id)

      // Count alerts
      const { count: alertsCount } = await supabase
        .from('alerts')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', profile.id)

      // Get last activity
      const { data: lastActivity } = await supabase
        .from('audit_logs')
        .select('created_at')
        .eq('user_id', profile.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single()

      userMetrics[profile.id] = {
        documentsCount: documentsCount || 0,
        alertsCount: alertsCount || 0,
        lastActivity: lastActivity?.created_at || profile.created_at,
        accountAge: Math.floor(
          (Date.now() - new Date(profile.created_at).getTime()) / (1000 * 60 * 60 * 24)
        ),
      }
    }

    return NextResponse.json({
      users: profiles,
      metrics: userMetrics,
      totalUsers: profiles.length,
    })
  } catch (error) {
    console.error('[v0] Error fetching metrics:', error)
    return NextResponse.json(
      { error: 'Error fetching metrics' },
      { status: 500 }
    )
  }
}
