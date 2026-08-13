export const dynamic = 'force-dynamic'

import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { getEmailSessionSecret, verifyEmailSession } from '@/lib/email-session'

function getSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !key) throw new Error('Missing Supabase configuration')
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  })
}

async function resolveProfileIdentity() {
  const cookieStore = await cookies()

  const appSession = await verifyEmailSession(
    cookieStore.get('app_session')?.value,
    getEmailSessionSecret(),
  )

  if (appSession) {
    return {
      type: 'app_session' as const,
      email: appSession.email.toLowerCase(),
      fullName: appSession.fullName,
      role: appSession.role,
      organizationId: appSession.organizationId,
    }
  }

  // Temporary backwards-compatible fallback for users still carrying the old token.
  const legacySession = cookieStore.get('auth_token')?.value
  if (!legacySession) return null

  try {
    const parts = legacySession.split('.')
    if (parts.length < 2) return null
    const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString())
    if (!payload?.sub) return null
    return { type: 'auth_token' as const, userId: String(payload.sub) }
  } catch {
    return null
  }
}

export async function GET() {
  try {
    const supabase = getSupabaseClient()
    const identity = await resolveProfileIdentity()

    if (!identity) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    if (identity.type === 'app_session') {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, email, full_name, phone, avatar_url, role, rut')
        .eq('email', identity.email)
        .maybeSingle()

      if (error) throw error

      // Some valid portal users are represented primarily by executive_staff/conductores.
      // Return the signed identity rather than failing if there is no profile row.
      return NextResponse.json(data || {
        id: identity.email,
        email: identity.email,
        full_name: identity.fullName || identity.email,
        phone: null,
        avatar_url: null,
        role: identity.role,
        rut: null,
        organization_id: identity.organizationId || null,
      })
    }

    const { data, error } = await supabase
      .from('profiles')
      .select('id, email, full_name, phone, avatar_url, role, rut')
      .eq('id', identity.userId)
      .single()

    if (error) throw error
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error fetching profile:', error)
    return NextResponse.json({ error: 'Error al obtener perfil' }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const supabase = getSupabaseClient()
    const identity = await resolveProfileIdentity()

    if (!identity) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const body = await request.json()
    const { full_name, phone } = body

    const query = supabase
      .from('profiles')
      .update({
        full_name: full_name || null,
        phone: phone || null,
        updated_at: new Date().toISOString(),
      })

    const scopedQuery = identity.type === 'app_session'
      ? query.eq('email', identity.email)
      : query.eq('id', identity.userId)

    const { data, error } = await scopedQuery
      .select('id, email, full_name, phone, avatar_url, role, rut')
      .single()

    if (error) throw error
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error updating profile:', error)
    return NextResponse.json({ error: 'Error al actualizar perfil' }, { status: 500 })
  }
}
