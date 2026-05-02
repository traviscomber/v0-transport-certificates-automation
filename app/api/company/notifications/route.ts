import { createAdminClient } from '@/lib/supabase/admin'
import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'
export const revalidate = 0

// Single source of truth: read from alerts table
export async function GET(request: NextRequest) {
  try {
    const adminClient = createAdminClient()

    const { data: alerts, error } = await adminClient
      .from('alerts')
      .select('id, type, title, message, is_read, is_dismissed, action_url, metadata, created_at, priority, category')
      .eq('is_dismissed', false)
      .order('created_at', { ascending: false })
      .limit(50)

    if (error) {
      console.error('[v0] Error fetching alerts as notifications:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Map alerts fields to notification shape expected by NotificationCenter
    const notifications = (alerts || []).map((a: any) => ({
      id: a.id,
      type: a.type || 'status_change',
      title: a.title,
      message: a.message,
      read: a.is_read,           // NotificationCenter uses 'read' not 'is_read'
      is_read: a.is_read,
      created_at: a.created_at,
      related_document_id: a.metadata?.document_id || null,
      priority: a.priority,
      category: a.category,
      action_url: a.action_url,
    }))

    return NextResponse.json({ notifications }, {
      headers: { 'Cache-Control': 'no-cache, no-store, must-revalidate' }
    })
  } catch (error) {
    console.error('[v0] Error in notifications GET:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
