import bcrypt from 'bcryptjs'
import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { serverSessionCookie, signServerActor, type ServerActor } from '@/lib/auth/server-actor'

function maskEmail(email?: string | null) {
  if (!email) return 'unknown'
  const [local, domain] = email.split('@')
  if (!domain) return 'unknown'
  return `${local.slice(0, 2)}***@${domain}`
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => null)
    const email = String(body?.email || '').trim().toLowerCase()
    const password = String(body?.password || '')

    if (!email || !password) {
      return NextResponse.json({ error: 'Email y contraseña son requeridos' }, { status: 400 })
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    if (!supabaseUrl || !anonKey || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 })
    }

    const admin = createAdminClient()
    let actor: ServerActor | null = null
    let fullName = ''

    // Primary path: Supabase Auth user + server-side profile role.
    const authClient = createClient(supabaseUrl, anonKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    })
    const { data: authData, error: authError } = await authClient.auth.signInWithPassword({ email, password })

    if (!authError && authData.user) {
      const { data: profile } = await admin
        .from('profiles')
        .select('id, email, full_name, role, is_active')
        .eq('id', authData.user.id)
        .maybeSingle()

      if (profile && profile.is_active !== false) {
        actor = {
          id: profile.id,
          email: (profile.email || email).toLowerCase(),
          role: profile.role || 'user',
          organizationId: null,
          source: 'profile',
        }
        fullName = profile.full_name || email
      }
    }

    // Compatibility path for executive_staff until all staff use Supabase Auth.
    if (!actor) {
      const { data: executive } = await admin
        .from('executive_staff')
        .select('id, email, full_name, password_hash, transportista_id, is_active')
        .eq('email', email)
        .eq('is_active', true)
        .maybeSingle()

      if (executive?.password_hash && await bcrypt.compare(password, executive.password_hash)) {
        actor = {
          id: executive.id,
          email: executive.email.toLowerCase(),
          role: 'ejecutiva',
          organizationId: executive.transportista_id || null,
          source: 'executive_staff',
        }
        fullName = executive.full_name || email
      }
    }

    if (!actor) {
      console.warn('[auth] Rejected login for', maskEmail(email))
      return NextResponse.json({ error: 'Email o contraseña incorrectos' }, { status: 401 })
    }

    const token = signServerActor(actor)
    const response = NextResponse.json({
      success: true,
      user: {
        email: actor.email,
        full_name: fullName,
        role: actor.role,
        organization_id: actor.organizationId || '',
      },
    })

    response.cookies.set(serverSessionCookie(token))

    // Temporary compatibility cookies for existing UI only. Authorization must ignore them.
    const legacyCookie = {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax' as const,
      maxAge: 60 * 60 * 8,
      path: '/',
    }
    response.cookies.set('user_email', actor.email, legacyCookie)
    response.cookies.set('user_name', fullName || actor.email, legacyCookie)
    response.cookies.set('user_role', String(actor.role), legacyCookie)
    response.cookies.set('user_organization_id', actor.organizationId || '', legacyCookie)

    return response
  } catch (error) {
    console.error('[auth] Staff login failed:', error)
    return NextResponse.json({ error: 'Error al iniciar sesión' }, { status: 500 })
  }
}
