import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const DEMO_EMAILS = ['conductor@demo.cl', 'despachador@demo.cl', 'admin@demo.cl']

export async function GET() {
  try {
    // Read env vars directly in API route context
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !serviceRoleKey) {
      console.error('[v0] Missing Supabase env vars in check-demo-accounts')
      return NextResponse.json({ 
        accountsExist: false,
        error: 'Supabase not configured' 
      }, { status: 500 })
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    })
    
    // Check if at least one demo account exists in the database
    const { data: profiles, error } = await supabase
      .from('profiles')
      .select('email')
      .in('email', DEMO_EMAILS)
      .limit(1)
    
    if (error) {
      console.error('[v0] Error checking demo accounts:', error)
      return NextResponse.json({ 
        accountsExist: false,
        error: error.message 
      }, { status: 500 })
    }
    
    const accountsExist = (profiles?.length || 0) > 0
    
    return NextResponse.json({ 
      accountsExist,
      found: profiles?.length || 0,
      total: DEMO_EMAILS.length
    })
  } catch (error: any) {
    console.error('[v0] Error in check-demo-accounts:', error)
    return NextResponse.json({ 
      accountsExist: false,
      error: error.message 
    }, { status: 500 })
  }
}
