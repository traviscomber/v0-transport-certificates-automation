import jwt from 'jsonwebtoken'
import { cookies } from 'next/headers'
import { createAdminClient } from '@/lib/supabase/admin'

export type ServerActorRole = 'admin' | 'ejecutiva' | 'prevencionista' | 'transportista' | 'driver' | 'conductor' | string

type ActorSource = 'profile' | 'executive_staff'

export interface ServerActor {
  id: string
  email: string
  role: ServerActorRole
  organizationId?: string | null
  source: ActorSource
}

interface SessionPayload extends jwt.JwtPayload {
  sub: string
  email: string
  role: ServerActorRole
  organizationId?: string | null
  source: ActorSource
}

const SESSION_COOKIE = 'cf_session'

function getSessionSecret() {
  const secret = process.env.APP_SESSION_SECRET
  if (!secret) throw new Error('Missing APP_SESSION_SECRET')
  return secret
}

export function signServerActor(actor: ServerActor) {
  return jwt.sign(
    {
      email: actor.email,
      role: actor.role,
      organizationId: actor.organizationId || null,
      source: actor.source,
    },
    getSessionSecret(),
    {
      subject: actor.id,
      expiresIn: '8h',
      issuer: 'chileflota',
      audience: 'chileflota-web',
    },
  )
}

async function readSignedActor(): Promise<ServerActor | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get(SESSION_COOKIE)?.value
  if (!token) return null

  try {
    const payload = jwt.verify(token, getSessionSecret(), {
      issuer: 'chileflota',
      audience: 'chileflota-web',
    }) as SessionPayload

    if (!payload.sub || !payload.email || !payload.role || !payload.source) return null

    return {
      id: payload.sub,
      email: payload.email,
      role: payload.role,
      organizationId: payload.organizationId || null,
      source: payload.source,
    }
  } catch {
    return null
  }
}

export async function requireServerActor(allowedRoles?: ServerActorRole[]) {
  const actor = await readSignedActor()
  if (!actor) return { actor: null, status: 401 as const, error: 'Unauthorized' }

  const admin = createAdminClient()

  if (actor.source === 'profile') {
    const { data } = await admin
      .from('profiles')
      .select('id, email, role, is_active')
      .eq('id', actor.id)
      .maybeSingle()

    if (!data || data.is_active === false || data.email?.toLowerCase() !== actor.email.toLowerCase()) {
      return { actor: null, status: 401 as const, error: 'Session no longer valid' }
    }

    actor.role = data.role || actor.role
  } else {
    const { data } = await admin
      .from('executive_staff')
      .select('id, email, transportista_id, is_active')
      .eq('id', actor.id)
      .maybeSingle()

    if (!data || data.is_active === false || data.email?.toLowerCase() !== actor.email.toLowerCase()) {
      return { actor: null, status: 401 as const, error: 'Session no longer valid' }
    }

    actor.role = 'ejecutiva'
    actor.organizationId = data.transportista_id || actor.organizationId || null
  }

  if (allowedRoles?.length && !allowedRoles.includes(actor.role)) {
    return { actor: null, status: 403 as const, error: 'Forbidden' }
  }

  return { actor, status: 200 as const, error: null }
}

export function serverSessionCookie(token: string) {
  return {
    name: SESSION_COOKIE,
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    maxAge: 60 * 60 * 8,
    path: '/',
  }
}
