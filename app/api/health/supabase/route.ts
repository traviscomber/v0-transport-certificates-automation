import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    console.log('[v0] Supabase URL:', url?.substring(0, 30) + '...' || 'NOT SET')
    console.log('[v0] Anon Key set:', !!anonKey)

    if (!url || !anonKey) {
      return NextResponse.json(
        { error: 'Missing Supabase environment variables', url: !!url, key: !!anonKey },
        { status: 500 }
      )
    }

    const client = createClient(url, anonKey)
    
    // Test connection with a simple query
    const { data, error } = await client.auth.getSession()
    
    if (error) {
      console.log('[v0] Auth error:', error)
      return NextResponse.json({ error: 'Auth error', details: error }, { status: 500 })
    }

    return NextResponse.json({ 
      status: 'ok',
      url: url,
      hasKey: !!anonKey,
      sessionCheck: 'successful'
    })
  } catch (error) {
    console.log('[v0] Test error:', error)
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}
