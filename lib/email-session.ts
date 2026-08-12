export type EmailSession = {
  email: string
  fullName: string
  role: string
  organizationId: string
  exp: number
}

function base64UrlEncode(value: string | Uint8Array): string {
  const bytes = typeof value === 'string' ? new TextEncoder().encode(value) : value
  let binary = ''
  for (const byte of bytes) binary += String.fromCharCode(byte)
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '')
}

function base64UrlDecode(value: string): Uint8Array {
  const padded = value.replace(/-/g, '+').replace(/_/g, '/').padEnd(Math.ceil(value.length / 4) * 4, '=')
  const binary = atob(padded)
  return Uint8Array.from(binary, (character) => character.charCodeAt(0))
}

async function importKey(secret: string) {
  return crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign', 'verify'],
  )
}

export async function signEmailSession(
  session: Omit<EmailSession, 'exp'>,
  secret: string,
): Promise<string> {
  const payload: EmailSession = {
    ...session,
    exp: Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60,
  }
  const encodedPayload = base64UrlEncode(JSON.stringify(payload))
  const signature = await crypto.subtle.sign(
    'HMAC',
    await importKey(secret),
    new TextEncoder().encode(encodedPayload),
  )
  return `${encodedPayload}.${base64UrlEncode(new Uint8Array(signature))}`
}

export async function verifyEmailSession(
  token: string | undefined,
  secret: string | undefined,
): Promise<EmailSession | null> {
  if (!token || !secret) return null
  const [encodedPayload, encodedSignature, extra] = token.split('.')
  if (!encodedPayload || !encodedSignature || extra) return null

  try {
    const valid = await crypto.subtle.verify(
      'HMAC',
      await importKey(secret),
      base64UrlDecode(encodedSignature),
      new TextEncoder().encode(encodedPayload),
    )
    if (!valid) return null

    const payload = JSON.parse(new TextDecoder().decode(base64UrlDecode(encodedPayload))) as EmailSession
    if (
      !payload.email ||
      !payload.role ||
      !Number.isFinite(payload.exp) ||
      payload.exp <= Math.floor(Date.now() / 1000)
    ) return null

    return payload
  } catch {
    return null
  }
}
