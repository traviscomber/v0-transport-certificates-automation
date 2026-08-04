import { createHash } from 'node:crypto'
import type {
  VerificationRequest,
  VerificationResult,
  VerificationSourceAdapter,
} from '../types'

const DEFAULT_LANDING_URL = 'https://www2.sii.cl/stc/noauthz'
const DEFAULT_QUERY_URL = 'https://www2.sii.cl/stc/noauthz/consulta'
const REQUEST_TIMEOUT_MS = 12_000

function normalizeRut(raw: string): string {
  return raw.replace(/\./g, '').replace(/\s+/g, '').toUpperCase()
}

function isValidRut(rut: string): boolean {
  if (!/^\d{1,8}-[0-9K]$/.test(rut)) return false
  const [body, verifier] = rut.split('-')
  let sum = 0
  let multiplier = 2
  for (let index = body.length - 1; index >= 0; index -= 1) {
    sum += Number(body[index]) * multiplier
    multiplier = multiplier === 7 ? 2 : multiplier + 1
  }
  const remainder = 11 - (sum % 11)
  const expected = remainder === 11 ? '0' : remainder === 10 ? 'K' : String(remainder)
  return verifier === expected
}

function cleanText(value: string): string {
  return value
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&#x2F;/gi, '/')
    .replace(/\s+/g, ' ')
    .trim()
}

function hasAny(text: string, patterns: RegExp[]): boolean {
  return patterns.some((pattern) => pattern.test(text))
}

function detectBlocking(text: string, status: number) {
  if (status === 403) return { code: 'SII_FORBIDDEN', message: 'SII respondió 403.' }
  if (status === 429) return { code: 'SII_RATE_LIMITED', message: 'SII respondió 429.' }
  if (hasAny(text, [/captcha/i, /recaptcha/i, /robot/i, /access denied/i, /cloudflare/i])) {
    return { code: 'SII_CAPTCHA_OR_BOT_BLOCK', message: 'SII presentó CAPTCHA o bloqueo automatizado.' }
  }
  if (hasAny(text, [/ha ocurrido un error de comunicación/i, /intentar nuevamente/i])) {
    return { code: 'SII_UPSTREAM_ERROR', message: 'SII informó un error de comunicación.' }
  }
  return null
}

function extractAfterLabel(text: string, labels: string[]): string | null {
  for (const label of labels) {
    const pattern = new RegExp(`${label}\\s*:?\\s*([^|;]{2,180})`, 'i')
    const match = text.match(pattern)
    if (match?.[1]) return match[1].trim()
  }
  return null
}

function extractTitle(body: string): string | null {
  const match = body.match(/<title[^>]*>([\s\S]*?)<\/title>/i)
  return match?.[1] ? cleanText(match[1]).slice(0, 160) : null
}

function safeDiagnostics(response: Response, body: string) {
  const text = cleanText(body)
  return {
    contentType: response.headers.get('content-type'),
    finalUrl: response.url,
    bodyLength: body.length,
    textLength: text.length,
    title: extractTitle(body),
    bodySha256: createHash('sha256').update(body).digest('hex'),
    markers: {
      hasTaxStatus: /situación tributaria/i.test(text),
      hasActivities: /actividades económicas/i.test(text),
      hasLogin: /iniciar sesión|clave tributaria/i.test(text),
      hasCaptcha: /captcha|recaptcha/i.test(text),
      looksLikeJson: /^\s*[\[{]/.test(body),
    },
  }
}

function findJsonValue(value: unknown, keys: string[]): string | null {
  if (Array.isArray(value)) {
    for (const item of value) {
      const found = findJsonValue(item, keys)
      if (found) return found
    }
    return null
  }
  if (!value || typeof value !== 'object') return null
  const record = value as Record<string, unknown>
  for (const [key, item] of Object.entries(record)) {
    if (keys.some((candidate) => key.toLowerCase() === candidate.toLowerCase())) {
      if (typeof item === 'string' || typeof item === 'number' || typeof item === 'boolean') return String(item)
    }
  }
  for (const item of Object.values(record)) {
    const found = findJsonValue(item, keys)
    if (found) return found
  }
  return null
}

function parseResponse(body: string, rut: string, sourceUrl: string, response: Response): VerificationResult {
  const text = cleanText(body)
  const now = new Date().toISOString()
  const diagnostics = safeDiagnostics(response, body)

  if (!text) {
    return {
      status: 'failed',
      errorCode: 'SII_EMPTY_RESPONSE',
      errorMessage: 'SII devolvió una respuesta vacía.',
      normalizedResult: { rut, diagnostics },
    }
  }

  const blocked = detectBlocking(text, response.status)
  if (blocked) {
    return {
      status: 'blocked',
      errorCode: blocked.code,
      errorMessage: blocked.message,
      httpStatus: response.status,
      normalizedResult: { rut, diagnostics },
      evidence: [{ label: 'Fuente', value: 'SII', sourceUrl, retrievedAt: now }],
    }
  }

  if (hasAny(text, [/rut no válido/i, /rut invalido/i, /no se encuentra registrado/i, /no existe contribuyente/i])) {
    return {
      status: 'not_found',
      normalizedResult: { rut, exists: false, diagnostics },
      confidence: 0.95,
      evidence: [{ label: 'Consulta SII', value: 'RUT no encontrado', sourceUrl, retrievedAt: now }],
    }
  }

  let json: unknown = null
  if ((response.headers.get('content-type') || '').includes('json') || /^\s*[\[{]/.test(body)) {
    try { json = JSON.parse(body) } catch { json = null }
  }

  const razonSocial =
    (json && findJsonValue(json, ['razonSocial', 'razon_social', 'nombreRazonSocial', 'nombre'])) ||
    extractAfterLabel(text, ['Nombre o Razón Social', 'Razón Social', 'Nombre'])
  const inicioActividades =
    (json && findJsonValue(json, ['fechaInicioActividades', 'inicioActividades', 'fecha_inicio_actividades'])) ||
    extractAfterLabel(text, ['Fecha de Inicio de Actividades', 'Inicio de Actividades'])
  const hasTaxContent = hasAny(text, [
    /inicio de actividades/i,
    /actividades económicas/i,
    /documentos tributarios/i,
    /situación tributaria/i,
  ]) || Boolean(json && (razonSocial || inicioActividades))

  if (!hasTaxContent || !razonSocial) {
    return {
      status: 'failed',
      errorCode: 'SII_UNEXPECTED_RESPONSE',
      errorMessage: 'La estructura recibida no coincide con una respuesta tributaria reconocible.',
      httpStatus: response.status,
      normalizedResult: { rut, diagnostics },
      evidence: [{ label: 'Diagnóstico estructural', value: JSON.stringify(diagnostics), sourceUrl, retrievedAt: now }],
    }
  }

  const warning = hasAny(text, [
    /comportamiento tributario irregular/i,
    /presenta observaciones/i,
    /situaciones que deben ser solucionadas/i,
    /inconcurrente/i,
  ])

  return {
    status: warning ? 'warning' : 'success',
    normalizedResult: {
      rut,
      exists: true,
      razonSocial,
      inicioActividades,
      hasPublicWarnings: warning,
      diagnostics,
      sourceDisclaimer: 'La consulta SII es parcial y no constituye certificación tributaria.',
    },
    confidence: 0.82,
    evidence: [
      { label: 'Razón social', value: razonSocial, sourceUrl, retrievedAt: now },
      ...(inicioActividades ? [{ label: 'Inicio de actividades', value: inicioActividades, sourceUrl, retrievedAt: now }] : []),
    ],
  }
}

async function fetchWithTimeout(url: string, init?: RequestInit) {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)
  try {
    return await fetch(url, {
      ...init,
      signal: controller.signal,
      cache: 'no-store',
      redirect: 'follow',
      headers: {
        Accept: 'text/html,application/json;q=0.9,*/*;q=0.8',
        'Accept-Language': 'es-CL,es;q=0.9',
        'User-Agent': 'Mozilla/5.0 (compatible; LABBE-Verification-Canary/1.0)',
        ...(init?.headers ?? {}),
      },
    })
  } finally {
    clearTimeout(timeout)
  }
}

function extractCookies(response: Response): string {
  const headers = response.headers as Headers & { getSetCookie?: () => string[] }
  const values = typeof headers.getSetCookie === 'function'
    ? headers.getSetCookie()
    : [response.headers.get('set-cookie') || '']
  return values.filter(Boolean).map((value) => value.split(';')[0]).join('; ')
}

async function executeSiiQuery(rut: string) {
  const landingUrl = process.env.SII_TAX_STATUS_LANDING_URL || DEFAULT_LANDING_URL
  const queryUrl = process.env.SII_TAX_STATUS_QUERY_URL || DEFAULT_QUERY_URL
  const landingResponse = await fetchWithTimeout(landingUrl)
  const landingBody = await landingResponse.text()
  const landingText = cleanText(landingBody)
  const landingBlock = detectBlocking(landingText, landingResponse.status)

  if (!landingResponse.ok || landingBlock) {
    return { response: landingResponse, body: landingBody, sourceUrl: landingUrl, blocked: landingBlock }
  }

  const cookie = extractCookies(landingResponse)
  const [bodyRut, dv] = rut.split('-')
  const attempts: Array<{ contentType: string; body: string }> = [
    { contentType: 'application/json', body: JSON.stringify({ rut }) },
    { contentType: 'application/json', body: JSON.stringify({ rut: bodyRut, dv }) },
    { contentType: 'application/x-www-form-urlencoded;charset=UTF-8', body: new URLSearchParams({ rut, rutCompleto: rut, dv }).toString() },
  ]

  let last: { response: Response; body: string; sourceUrl: string; blocked: ReturnType<typeof detectBlocking> } | null = null
  for (const attempt of attempts) {
    const response = await fetchWithTimeout(queryUrl, {
      method: 'POST',
      headers: {
        'Content-Type': attempt.contentType,
        Referer: landingUrl,
        Origin: new URL(landingUrl).origin,
        'X-Requested-With': 'XMLHttpRequest',
        ...(cookie ? { Cookie: cookie } : {}),
      },
      body: attempt.body,
    })
    const body = await response.text()
    const blocked = detectBlocking(cleanText(body), response.status)
    last = { response, body, sourceUrl: queryUrl, blocked }
    const diagnostics = safeDiagnostics(response, body)
    if (blocked || response.status === 403 || response.status === 429) return last
    if (response.ok && (diagnostics.markers.hasTaxStatus || diagnostics.markers.hasActivities || diagnostics.markers.looksLikeJson)) return last
  }

  if (!last) throw new Error('SII query produced no response')
  return last
}

export class SiiTaxStatusAdapter implements VerificationSourceAdapter {
  readonly code = 'sii_tax_status' as const

  async verify(input: VerificationRequest): Promise<VerificationResult> {
    if (process.env.SII_TAX_STATUS_CANARY_ENABLED !== 'true') {
      return { status: 'skipped', errorCode: 'SII_CANARY_DISABLED', errorMessage: 'El conector SII existe, pero su canario sigue desactivado.' }
    }

    const rawRut = input.payload.rut
    if (typeof rawRut !== 'string') {
      return { status: 'failed', errorCode: 'SII_RUT_REQUIRED', errorMessage: 'La consulta SII requiere payload.rut.' }
    }

    const rut = normalizeRut(rawRut)
    if (!isValidRut(rut)) {
      return { status: 'failed', errorCode: 'SII_INVALID_RUT', errorMessage: 'El RUT no supera la validación de dígito verificador.' }
    }

    try {
      const { response, body, sourceUrl, blocked } = await executeSiiQuery(rut)
      if (blocked) {
        return {
          status: 'blocked',
          errorCode: blocked.code,
          errorMessage: blocked.message,
          httpStatus: response.status,
          normalizedResult: { rut, diagnostics: safeDiagnostics(response, body) },
          evidence: [{ label: 'Fuente', value: 'SII', sourceUrl, retrievedAt: new Date().toISOString() }],
        }
      }
      if (!response.ok) {
        return {
          status: 'failed',
          errorCode: 'SII_HTTP_ERROR',
          errorMessage: `SII respondió HTTP ${response.status}.`,
          httpStatus: response.status,
          normalizedResult: { rut, diagnostics: safeDiagnostics(response, body) },
        }
      }
      return parseResponse(body, rut, sourceUrl, response)
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        return { status: 'failed', errorCode: 'SII_TIMEOUT', errorMessage: `SII no respondió dentro de ${REQUEST_TIMEOUT_MS} ms.` }
      }
      return {
        status: 'failed',
        errorCode: 'SII_NETWORK_ERROR',
        errorMessage: error instanceof Error ? error.message : 'Error de red desconocido.',
      }
    }
  }
}
