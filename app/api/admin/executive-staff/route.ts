import { createClient } from '@supabase/supabase-js'
import { requireServerActor } from '@/lib/auth/server-actor'
import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET() {
  try {
    const auth = await requireServerActor(['admin'])
    if (!auth.actor) {
      return NextResponse.json({ error: auth.error }, { status: auth.status })
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json({ error: 'Missing Supabase credentials' }, { status: 500 })
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    const { data, error } = await supabase
      .from('executive_staff')
      .select('id, email, full_name, rut, cargo')
      .eq('is_active', true)
      .order('full_name', { ascending: true })

    if (error) {
      console.error('[v0] Error fetching executives:', error)
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    const executives = (data || [])
      .filter(e => e.email?.endsWith('@labbe.cl'))
      .map(e => ({
        id: e.id,
        email: e.email,
        nombre: e.full_name,
        apellido: '',
      }))

    console.log('[v0] Verified admin fetched Labbe executives:', auth.actor.id, executives.length)
    return NextResponse.json({ executives })
  } catch (error) {
    console.error('[v0] Error fetching executives:', error)
    return NextResponse.json({ error: 'Failed to fetch executives' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const auth = await requireServerActor(['admin'])
  if (!auth.actor) {
    return NextResponse.json({ error: auth.error }, { status: auth.status })
  }

  return NextResponse.json(
    {
      error: 'Endpoint disabled',
      message: 'Executive staff creation with placeholder credentials is disabled in production-safe builds.',
    },
    { status: 410 }
  )
}
