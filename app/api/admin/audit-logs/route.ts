import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

function getSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  
  if (!url || !key) {
    throw new Error('Missing Supabase credentials')
  }
  
  return createClient(url, key)
}

export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabaseClient()
    const params = request.nextUrl.searchParams
    const userId = params.get('userId')

    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required' },
        { status: 400 }
      )
    }

    // Get audit logs for the user
    const { data: logs, error } = await supabase
      .from('audit_logs')
      .select('*')
      .eq('user_id', userId)
      .order('timestamp', { ascending: false })
      .limit(100)

    if (error) {
      // Table might not exist yet, return empty array
      if (error.code === 'PGRST116') {
        return NextResponse.json([])
      }
      
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json(logs || [])
  } catch (error) {
    console.error('Error fetching audit logs:', error)
    // Return empty array if table doesn't exist
    return NextResponse.json([])
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = getSupabaseClient()
    const body = await request.json()

    const { user_id, action, resource_type, resource_id, ip_address, user_agent } = body

    // Insert audit log
    const { error } = await supabase
      .from('audit_logs')
      .insert({
        user_id,
        action,
        resource_type,
        resource_id,
        ip_address,
        user_agent,
        timestamp: new Date().toISOString()
      })

    if (error) {
      // Table might not exist, just log and continue
      console.warn('Error inserting audit log:', error.message)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error creating audit log:', error)
    return NextResponse.json({ success: true }) // Don't fail the main operation
  }
}
