import type {
  VerificationEvidence,
  VerificationRequest,
  VerificationResult,
  VerificationSourceAdapter,
} from '../types'

const LANDING_URL = 'https://www2.sii.cl/stc/noauthz'
const CAPTCHA_KEY_URL = 'https://www2.sii.cl/app/stc/recurso/v1/recaptcha/key'
const QUERY_URL = 'https://www2.sii.cl/app/stc/recurso/v1/consulta/getConsultaData/'
const RECAPTCHA_ACTION = 'consultaSTC'
const REQUEST_TIMEOUT_MS = 12_000

type JsonRecord = Record<string, unknown>

type CaptchaConfiguration = {
  enabled: boolean
  siteKeyPresent: boolean
}

type SiiSession = {
  cookie: string
  landingStatus: number
}

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

function isRecord(value: unknown): value is JsonRecord {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value)
}

function firstString(...values: unknown[]): string | null {
  for (const value of values) {
    if (typeof value === 'string' && value.trim()) return value.trim()
    if (typeof value === 'number' || typeof value === 'boolean') return String(value)
  }
  return null
}

function toBoolean(value: unknown): boolean | null {
  if (typeof value === 'boolean') return value
  if (typeof value === 'number') return value !== 0
  if (typeof value !== 'string') return null

  const normalized = value.trim().toLowerCase()
  if (['true', '1', 'si', 'sí', 's'].includes(normalized)) return true
  if (['false', '0', 'no', 'n'].includes(normalized)) return false
  return null
}

function extractCookies(response: Response): string {
  const headers = response.headers as Headers & { getSetCookie?: () => string[] }
  const values = typeof headers.getSetCookie === 'function'
    ? headers.getSetCookie()
    : [response.headers.get('set-cookie') || '']

  return values
    .filter(Boolean)
    .map((value) => value.split(';')[0])
    .filter(Boolean)
    .join('; ')
}

function mergeCookies(...cookies: string[]): string {
  const entries = new Map<string, string>()
  for (const cookieHeader of cookies) {
    for (const item of cookieHeader.split(';')) {
      const trimmed = item.trim()
      if (!trimmed) continue
      const separator = trimmed.indexOf('=')
      if (separator < 1) continue
      entries.set(trimmed.slice(0, separator), trimmed.slice(separator + 1))
    }
  }
  return [...entries.entries()].map(([key, value]) => `${key}=${value}`).join('; ')
}

async function fetchWithTimeout(url: string, init?: RequestInit): Promise<Response> {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)

  try {
    return await fetch(url, {
      ...init,
      signal: controller.signal,
      cache: 'no-store',
      redirect: 'follow',
      headers: {
        Accept: 'application/json,text/html;q=0.9,*/*;q=0.8',
        'Accept-Language': 'es-CL,es;q=0.9',
        'User-Agent': 'Mozilla/5.0 (compatible; LABBE-SII-Canary/2.0)',
        ...(init?.headers ?? {}),
      },
    })
  } finally {
    clearTimeout(timeout)
  }
}

async function readJson(response: Response): Promise<unknown> {
  const body = await response.text()
  if (!body.trim()) return null
  try {
    return JSON.parse(body) as unknown
  } catch {
    throw new Error(`SII returned non-JSON content from ${response.url || 'unknown endpoint'}`)
  }
}

async function createSession(): Promise<SiiSession> {
  const response = await fetchWithTimeout(LANDING_URL)
  if (!response.ok) throw new Error(`SII landing page returned HTTP ${response.status}`)
  await response.arrayBuffer()
  return {
    cookie: extractCookies(response),
    landingStatus: response.status,
  }
}

async function loadCaptchaConfiguration(session: SiiSession): Promise<{ config: CaptchaConfiguration; cookie: string }> {
  const response = await fetchWithTimeout(CAPTCHA_KEY_URL, {
    headers: {
      Referer: LANDING_URL,
      Origin: new URL(LANDING_URL).origin,
      ...(session.cookie ? { Cookie: session.cookie } : {}),
    },
  })

  if (!response.ok) throw new Error(`SII reCAPTCHA configuration returned HTTP ${response.status}`)
  const payload = await readJson(response)
  if (!isRecord(payload)) throw new Error('SII reCAPTCHA configuration has an unexpected structure')

  const enabled = toBoolean(payload.enable) ?? true
  const siteKeyPresent = Boolean(firstString(payload.key))

  return {
    config: { enabled, siteKeyPresent },
    cookie: mergeCookies(session.cookie, extractCookies(response)),
  }
}

function safeSignals(payload: JsonRecord) {
  return {
    tieneInicio: toBoolean(payload.tieneInicio),
    inicioActividades: firstString(payload.inicioActividades),
    fechaInicioActividades: firstString(payload.fechaInicioActividades),
    cumpleObligacionTributaria: firstString(payload.cumpleObligacionTributaria),
    tieneGirosNegocio: toBoolean(payload.tieneGirosNegocio),
    tienePrimeraCategoria: toBoolean(payload.tienePrimeraCategoria),
    tieneOFE: toBoolean(payload.tieneOFE),
    tienePOFE: toBoolean(payload.tienePOFE),
    tieneININ: toBoolean(payload.tieneININ),
    tieneAPME: toBoolean(payload.tieneAPME),
    tieneEMTP: toBoolean(payload.tieneEMTP),
  }
}

function hasPublicWarning(payload: JsonRecord): boolean {
  const obligation = firstString(payload.cumpleObligacionTributaria)?.toLowerCase() ?? ''
  const observations = [payload.observacion1, payload.observacion2]
    .map((value) => firstString(value))
    .filter((value): value is string => Boolean(value))
  const alerts = Array.isArray(payload.alertaTablas) ? payload.alertaTablas : []

  return (
    Boolean(obligation) && !['si', 'sí', 'cumple', 'true'].includes(obligation)
  ) || observations.length > 0 || alerts.length > 0 || toBoolean(payload.nocondonable) === true
}

function parseSiiResult(payload: unknown, rut: string, retrievedAt: string): VerificationResult {
  if (!isRecord(payload)) {
    return {
      status: 'failed',
      errorCode: 'SII_UNEXPECTED_JSON',
      errorMessage: 'SII devolvió una estructura JSON no reconocida.',
      normalizedResult: { rut, endpoint: QUERY_URL },
    }
  }

  if (toBoolean(payload.captchaInvalido) === true) {
    return {
      status: 'blocked',
      errorCode: 'SII_RECAPTCHA_INVALID',
      errorMessage: 'SII rechazó el token reCAPTCHA proporcionado.',
      normalizedResult: {
        rut,
        recaptchaRequired: true,
        recaptchaAction: RECAPTCHA_ACTION,
        endpoint: QUERY_URL,
      },
    }
  }

  const registered = toBoolean(payload.registrado)
  if (registered === false) {
    return {
      status: 'not_found',
      confidence: 0.98,
      normalizedResult: {
        rut,
        exists: false,
        fechaConsulta: firstString(payload.fechaConsulta),
        source: 'SII Situación Tributaria de Terceros',
      },
      evidence: [{
        label: 'Resultado SII',
        value: 'RUT no registrado',
        sourceUrl: LANDING_URL,
        retrievedAt,
      }],
    }
  }

  const razonSocial = firstString(payload.nombre)
  if (registered !== true || !razonSocial) {
    return {
      status: 'failed',
      errorCode: 'SII_INCOMPLETE_RESULT',
      errorMessage: 'SII respondió, pero no entregó una identificación tributaria completa.',
      normalizedResult: {
        rut,
        registered,
        fechaConsulta: firstString(payload.fechaConsulta),
        endpoint: QUERY_URL,
      },
    }
  }

  const warning = hasPublicWarning(payload)
  const evidence: VerificationEvidence[] = [{
    label: 'Razón social',
    value: razonSocial,
    sourceUrl: LANDING_URL,
    retrievedAt,
  }]
  const fechaInicioActividades = firstString(payload.fechaInicioActividades)
  if (fechaInicioActividades) {
    evidence.push({
      label: 'Inicio de actividades',
      value: fechaInicioActividades,
      sourceUrl: LANDING_URL,
      retrievedAt,
    })
  }

  return {
    status: warning ? 'warning' : 'success',
    confidence: 0.96,
    normalizedResult: {
      rut,
      exists: true,
      razonSocial,
      fechaConsulta: firstString(payload.fechaConsulta),
      hasPublicWarnings: warning,
      signals: safeSignals(payload),
      source: 'SII Situación Tributaria de Terceros',
      sourceDisclaimer: 'La consulta es informativa, parcial y no constituye una certificación tributaria.',
    },
    evidence,
  }
}

export class SiiTaxStatusAdapter implements VerificationSourceAdapter {
  readonly code = 'sii_tax_status' as const

  async verify(input: VerificationRequest): Promise<VerificationResult> {
    if (process.env.SII_TAX_STATUS_CANARY_ENABLED !== 'true') {
      return {
        status: 'skipped',
        errorCode: 'SII_CANARY_DISABLED',
        errorMessage: 'El conector SII está desactivado.',
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
      const session = await createSession()
      const { config, cookie } = await loadCaptchaConfiguration(session)
      const recaptchaToken = firstString(input.payload.recaptchaToken)

      if (config.enabled && !recaptchaToken) {
        return {
          status: 'blocked',
          errorCode: 'SII_RECAPTCHA_REQUIRED',
          errorMessage: 'SII exige una validación reCAPTCHA realizada por una persona antes de consultar el RUT.',
          normalizedResult: {
            rut,
            recaptchaRequired: true,
            recaptchaAction: RECAPTCHA_ACTION,
            siteKeyConfigured: config.siteKeyPresent,
            browserAssistedVerificationRequired: true,
            landingStatus: session.landingStatus,
            captchaConfigurationEndpoint: CAPTCHA_KEY_URL,
            queryEndpoint: QUERY_URL,
          },
          evidence: [{
            label: 'Control requerido',
            value: 'reCAPTCHA del SII',
            sourceUrl: LANDING_URL,
            retrievedAt: new Date().toISOString(),
          }],
        }
      }

      const [rutBody, dv] = rut.split('-')
      const response = await fetchWithTimeout(QUERY_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Referer: `${LANDING_URL}/consulta`,
          Origin: new URL(LANDING_URL).origin,
          'X-Requested-With': 'XMLHttpRequest',
          ...(cookie ? { Cookie: cookie } : {}),
        },
        body: JSON.stringify({
          rut: rutBody,
          dv,
          reAction: RECAPTCHA_ACTION,
          reToken: recaptchaToken ?? '',
        }),
      })

      if (response.status === 403 || response.status === 429) {
        return {
          status: 'blocked',
          errorCode: response.status === 429 ? 'SII_RATE_LIMITED' : 'SII_FORBIDDEN',
          errorMessage: `SII respondió HTTP ${response.status}.`,
          httpStatus: response.status,
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

      return parseSiiResult(await readJson(response), rut, new Date().toISOString())
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
        errorCode: 'SII_NETWORK_OR_PROTOCOL_ERROR',
        errorMessage: error instanceof Error ? error.message : 'Error desconocido en la consulta SII.',
      }
    }
  }
}
