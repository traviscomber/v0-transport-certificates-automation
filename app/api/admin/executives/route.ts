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

    // Get all users with ejecutiva role
    const { data: executives, error } = await supabase
      .from('profiles')
      .select('id, email, full_name, is_active, created_at, last_sign_in_at, updated_at')
      .eq('role', 'ejecutiva')
      .order('created_at', { ascending: false })

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }

    // Map fields
    const mapped = (executives || []).map((exec: any) => ({
      id: exec.id,
      email: exec.email,
      full_name: exec.full_name,
      is_active: exec.is_active,
      created_at: exec.created_at,
      last_sign_in: exec.last_sign_in_at,
      last_activity: exec.updated_at
    }))

    return NextResponse.json(mapped)
  } catch (error) {
    console.error('Error fetching executives:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = getSupabaseClient()
    const body = await request.json()

    const { email, full_name, password } = body

    if (!email || !full_name || !password || String(password).length < 8) {
      return NextResponse.json(
        { error: 'Email, full_name, and a password of at least 8 characters are required' },
        { status: 400 }
      )
    }

    // Create auth user
    const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true
    })

    if (authError) {
      return NextResponse.json(
        { error: authError.message },
        { status: 400 }
      )
    }

    // Create profile
    const { error: profileError } = await supabase
      .from('profiles')
      .insert({
        id: authUser.user.id,
        email,
        full_name,
        role: 'ejecutiva',
        is_active: true
      })

    if (profileError) {
      return NextResponse.json(
        { error: profileError.message },
        { status: 400 }
      )
    }

    return NextResponse.json({
      id: authUser.user.id,
      email,
      full_name,
      role: 'ejecutiva'
    })
  } catch (error) {
    console.error('Error creating executive:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
