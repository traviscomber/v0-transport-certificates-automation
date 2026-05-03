import { createClient } from '@supabase/supabase-js'

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json()

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !supabaseServiceKey) {
      return Response.json(
        { error: 'Server configuration error' },
        { status: 500 }
      )
    }

    // Use service role key on server (more permissive)
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { persistSession: false },
    })

    console.log('[v0] Attempting login for:', email)

    // Use signInWithPassword
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      console.error('[v0] Auth error:', error.message)
      return Response.json(
        { error: error.message || 'Invalid credentials' },
        { status: 401 }
      )
    }

    if (!data.session) {
      console.error('[v0] No session returned')
      return Response.json(
        { error: 'No session returned' },
        { status: 401 }
      )
    }

    console.log('[v0] Login successful for:', email)

    // Get user profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', data.user.id)
      .single()

    return Response.json({
      token: data.session.access_token,
      user: {
        id: data.user.id,
        email: data.user.email,
        ...profile,
      },
    })
  } catch (error) {
    console.error('[v0] Login error:', error)
    return Response.json(
      { error: 'Server error' },
      { status: 500 }
    )
  }
}
