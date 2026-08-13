export type EmailSession = {
  email: string
  fullName: string
  role: string
  organizationId: string
  exp: number
}

function encode(value: string | Uint8Array): string {
  const bytes = typeof value === 'string' ? new TextEncoder().encode(value) : value
  let binary = ''
  for (const byte of bytes) binary += String.fromCharCode(byte)
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '')
}

function decode(value: string): ArrayBuffer {
  const padded = value.replace(/-/g, '+').replace(/_/g, '/').padEnd(Math.ceil(value.length / 4) * 4, '=')
  const bytes = Uint8Array.from(atob(padded), (character) => character.charCodeAt(0))
  return bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer
}

async function key(secret: string) {
  return crypto.subtle.importKey('raw', new TextEncoder().encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign', 'verify'])
}

export function getEmailSessionSecret(): string | undefined {
  return process.env.APP_SESSION_SECRET || process.env.SUPABASE_SERVICE_ROLE_KEY
}

export async function signEmailSession(
  session: Omit<EmailSession, 'exp'>,
  secret: string,
): Promise<string> {
  const payload = encode(JSON.stringify({
    ...session,
    exp: Math.floor(Date.now() / 1000) + 8 * 60 * 60,
  }))
  const signature = await crypto.subtle.sign('HMAC', await key(secret), new TextEncoder().encode(payload))
  return `${payload}.${encode(new Uint8Array(signature))}`
}

export async function verifyEmailSession(
  token: string | undefined,
  secret: string | undefined,
): Promise<EmailSession | null> {
  if (!token || !secret) return null
  const [payload, signature, extra] = token.split('.')
  if (!payload || !signature || extra) return null

  try {
    const valid = await crypto.subtle.verify('HMAC', await key(secret), decode(signature), new TextEncoder().encode(payload))
    if (!valid) return null
    const session = JSON.parse(new TextDecoder().decode(decode(payload))) as EmailSession
    if (!session.email || !session.role || session.exp <= Math.floor(Date.now() / 1000)) return null
    return session
  } catch {
    return null
  }
}
