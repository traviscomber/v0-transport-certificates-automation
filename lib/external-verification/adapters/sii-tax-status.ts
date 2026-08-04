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

  if (hasAny(text, [/captcha/i, /recaptcha/i, /robot/i, /access denied/i])) {
    return { code: 'SII_CAPTCHA_OR_BOT_BLOCK', message: 'SII presentó CAPTCHA o bloqueo automatizado.' }
  }

  if (hasAny(text, [/ha ocurrido un error de comunicación/i, /intentar nuevamente/i])) {
    return { code: 'SII_UPSTREAM_ERROR', message: 'SII informó un error de comunicación.' }
  }

  return null
}

function extractAfterLabel(text: string, labels: string[]): string | null {
  for (const label of labels) {
    const pattern = new RegExp(`${label}\\s*:?\\s*([^|;]{2,160})`, 'i')
    const match = text.match(pattern)
    if (match?.[1]) return match[1].trim()
  }
  return null
}

function parseResponse(body: string, rut: string, sourceUrl: string): VerificationResult {
  const text = cleanText(body)
  const now = new Date().toISOString()

  if (!text) {
    return {
      status: 'failed',
      errorCode: 'SII_EMPTY_RESPONSE',
      errorMessage: 'SII devolvió una respuesta vacía.',
    }
  }

  const blocked = detectBlocking(text, 200)
  if (blocked) {
    return {
      status: 'blocked',
      errorCode: blocked.code,
      errorMessage: blocked.message,
      evidence: [{ label: 'Fuente', value: 'SII', sourceUrl, retrievedAt: now }],
    }
  }

  if (hasAny(text, [/rut no válido/i, /rut invalido/i, /no se encuentra registrado/i, /no existe contribuyente/i])) {
    return {
      status: 'not_found',
      normalizedResult: { rut, exists: false },
      confidence: 0.95,
      evidence: [{ label: 'Consulta SII', value: text.slice(0, 500), sourceUrl, retrievedAt: now }],
    }
  }

  const razonSocial = extractAfterLabel(text, ['Nombre o Razón Social', 'Razón Social', 'Nombre'])
  const inicioActividades = extractAfterLabel(text, ['Fecha de Inicio de Actividades', 'Inicio de Actividades'])
  const hasTaxContent = hasAny(text, [
    /inicio de actividades/i,
    /actividades económicas/i,
    /documentos tributarios/i,
    /situación tributaria/i,
  ])

  if (!hasTaxContent || !razonSocial) {
    return {
      status: 'failed',
      errorCode: 'SII_UNEXPECTED_RESPONSE',
      errorMessage: 'La estructura recibida no coincide con una respuesta tributaria reconocible.',
      normalizedResult: {
        rut,
        responsePreview: text.slice(0, 700),
      },
      evidence: [{ label: 'Respuesta no reconocida', value: text.slice(0, 700), sourceUrl, retrievedAt: now }],
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
      sourceDisclaimer: 'La consulta SII es parcial y no constituye certificación tributaria.',
    },
    confidence: 0.82,
    evidence: [
      { label: 'Razón social', value: razonSocial, sourceUrl, retrievedAt: now },
      ...(inicioActividades
        ? [{ label: 'Inicio de actividades', value: inicioActividades, sourceUrl, retrievedAt: now }]
        : []),
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
      headers: {
        Accept: 'text/html,application/json;q=0.9,*/*;q=0.8',
        'Accept-Language': 'es-CL,es;q=0.9',
        'User-Agent': 'LABBE-External-Verification-Lab/1.0 (+controlled-canary)',
        ...(init?.headers ?? {}),
      },
    })
  } finally {
    clearTimeout(timeout)
  }
}

async function executeSiiQuery(rut: string) {
  const landingUrl = process.env.SII_TAX_STATUS_LANDING_URL || DEFAULT_LANDING_URL
  const queryUrl = process.env.SII_TAX_STATUS_QUERY_URL || DEFAULT_QUERY_URL

  const landingResponse = await fetchWithTimeout(landingUrl)
  const landingBody = await landingResponse.text()
  const landingText = cleanText(landingBody)
  const landingBlock = detectBlocking(landingText, landingResponse.status)

  if (!landingResponse.ok || landingBlock) {
    return {
      response: landingResponse,
      body: landingBody,
      sourceUrl: landingUrl,
      blocked: landingBlock,
    }
  }

  const response = await fetchWithTimeout(queryUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Referer: landingUrl,
      Origin: new URL(landingUrl).origin,
    },
    body: JSON.stringify({ rut }),
  })

  const body = await response.text()
  const blocked = detectBlocking(cleanText(body), response.status)
  return { response, body, sourceUrl: queryUrl, blocked }
}

export class SiiTaxStatusAdapter implements VerificationSourceAdapter {
  readonly code = 'sii_tax_status' as const

  async verify(input: VerificationRequest): Promise<VerificationResult> {
    if (process.env.SII_TAX_STATUS_CANARY_ENABLED !== 'true') {
      return {
        status: 'skipped',
        errorCode: 'SII_CANARY_DISABLED',
        errorMessage: 'El conector SII existe, pero su canario sigue desactivado.',
      }
    }

    const rawRut = input.payload.rut
    if (typeof rawRut !== 'string') {
      return {
        status: 'failed',
        errorCode: 'SII_RUT_REQUIRED',
        errorMessage: 'La consulta SII requiere payload.rut.',
      }
    }

    const rut = normalizeRut(rawRut)
    if (!isValidRut(rut)) {
      return {
        status: 'failed',
        errorCode: 'SII_INVALID_RUT',
        errorMessage: 'El RUT no supera la validación de dígito verificador.',
      }
    }

    try {
      const { response, body, sourceUrl, blocked } = await executeSiiQuery(rut)

      if (blocked) {
        return {
          status: 'blocked',
          errorCode: blocked.code,
          errorMessage: blocked.message,
          httpStatus: response.status,
          evidence: [{ label: 'Fuente', value: 'SII', sourceUrl, retrievedAt: new Date().toISOString() }],
        }
      }

      if (!response.ok) {
        return {
          status: 'failed',
          errorCode: 'SII_HTTP_ERROR',
          errorMessage: `SII respondió HTTP ${response.status}.`,
          httpStatus: response.status,
        }
      }

      return parseResponse(body, rut, sourceUrl)
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        return {
          status: 'failed',
          errorCode: 'SII_TIMEOUT',
          errorMessage: `SII no respondió dentro de ${REQUEST_TIMEOUT_MS} ms.`,
        }
      }

      return {
        status: 'failed',
        errorCode: 'SII_NETWORK_ERROR',
        errorMessage: error instanceof Error ? error.message : 'Error de red desconocido.',
      }
    }
  }
}
