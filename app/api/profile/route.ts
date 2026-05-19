import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

function getSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  
  if (!url || !key) {
    throw new Error('Missing Supabase configuration')
  }
  
  return createClient(url, key)
}

export async function GET() {
  try {
    const supabase = getSupabaseClient()
    const cookieStore = await cookies()
    const session = cookieStore.get('auth_token')

    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    // Decode JWT to get user ID
    const token = session.value
    const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString())
    const userId = payload.sub

    // Get user profile
    const { data, error } = await supabase
      .from('profiles')
      .select('id, email, full_name, phone, avatar_url, role, rut')
      .eq('id', userId)
      .single()

    if (error) throw error

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error fetching profile:', error)
    return NextResponse.json(
      { error: 'Error al obtener perfil' },
      { status: 500 }
    )
  }
}

export async function PUT(request: Request) {
  try {
    const supabase = getSupabaseClient()
    const cookieStore = await cookies()
    const session = cookieStore.get('auth_token')

    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    // Decode JWT to get user ID
    const token = session.value
    const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString())
    const userId = payload.sub

    const body = await request.json()
    const { full_name, phone } = body

    // Update profile
    const { data, error } = await supabase
      .from('profiles')
      .update({
        full_name: full_name || null,
        phone: phone || null,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)
      .select('id, email, full_name, phone, avatar_url, role, rut')
      .single()

    if (error) throw error

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error updating profile:', error)
    return NextResponse.json(
      { error: 'Error al actualizar perfil' },
      { status: 500 }
    )
  }
}
