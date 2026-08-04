import { createHash } from 'node:crypto'
import type {
  VerificationEvidence,
  VerificationRequest,
  VerificationResult,
  VerificationSourceAdapter,
} from '../types'

const DEFAULT_LANDING_URL = 'https://www2.sii.cl/stc/noauthz'
const DEFAULT_QUERY_URL = 'https://www2.sii.cl/stc/noauthz/consulta'
const REQUEST_TIMEOUT_MS = 12_000
const MAX_ATTEMPTS = 6

type BlockingResult = { code: string; message: string } | null

type AttemptDiagnostic = {
  name: string
  method: 'GET' | 'POST'
  status: number
  contentType: string | null
  finalUrl: string
  bodyLength: number
  bodySha256: string
  title: string | null
  markers: ReturnType<typeof responseMarkers>
}

type QueryResult = {
  response: Response
  body: string
  sourceUrl: string
  blocked: BlockingResult
  attempts: AttemptDiagnostic[]
  landing: ReturnType<typeof safeDiagnostics>
  form: ReturnType<typeof discoverForm>
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

function decodeHtml(value: string): string {
  return value
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/&#x2F;/gi, '/')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
}

function cleanText(value: string): string {
  return decodeHtml(value)
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function hasAny(text: string, patterns: RegExp[]): boolean {
  return patterns.some((pattern) => pattern.test(text))
}

function detectBlocking(text: string, status: number): BlockingResult {
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
    const escaped = label.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    const match = text.match(new RegExp(`${escaped}\\s*:?\\s*([^|;]{2,180})`, 'i'))
    if (match?.[1]) return match[1].trim()
  }
  return null
}

function extractTitle(body: string): string | null {
  const match = body.match(/<title[^>]*>([\s\S]*?)<\/title>/i)
  return match?.[1] ? cleanText(match[1]).slice(0, 160) : null
}

function responseMarkers(body: string) {
  const text = cleanText(body)
  return {
    hasTaxStatus: /situación tributaria/i.test(text),
    hasActivities: /actividades económicas/i.test(text),
    hasInicioActividades: /inicio de actividades/i.test(text),
    hasCompanyName: /razón social|nombre o razón social/i.test(text),
    hasCommunicationError: /error de comunicación/i.test(text),
    hasLogin: /iniciar sesión|clave tributaria/i.test(text),
    hasCaptcha: /captcha|recaptcha/i.test(text),
    isLandingShell: /^consultar situación tributaria de terceros$/i.test(text),
    looksLikeJson: /^\s*[\[{]/.test(body),
  }
}

function safeDiagnostics(response: Response, body: string) {
  return {
    contentType: response.headers.get('content-type'),
    finalUrl: response.url,
    bodyLength: body.length,
    textLength: cleanText(body).length,
    title: extractTitle(body),
    bodySha256: createHash('sha256').update(body).digest('hex'),
    markers: responseMarkers(body),
  }
}

function firstString(...values: unknown[]): string | null {
  for (const value of values) {
    if (typeof value === 'string' && value.trim()) return value.trim()
    if (typeof value === 'number' || typeof value === 'boolean') return String(value)
  }
  return null
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
      const scalar = firstString(item)
      if (scalar) return scalar
    }
  }
  for (const item of Object.values(record)) {
    const found = findJsonValue(item, keys)
    if (found) return found
  }
  return null
}

function parseAttributes(tag: string): Record<string, string> {
  const attributes: Record<string, string> = {}
  const pattern = /([\w:-]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+)))?/g
  for (const match of tag.matchAll(pattern)) {
    const key = match[1]?.toLowerCase()
    if (!key || key === 'input' || key === 'form') continue
    attributes[key] = decodeHtml(match[2] ?? match[3] ?? match[4] ?? '')
  }
  return attributes
}

function discoverForm(body: string, landingUrl: string) {
  const forms = [...body.matchAll(/<form\b([^>]*)>([\s\S]*?)<\/form>/gi)]
  for (const formMatch of forms) {
    const formAttributes = parseAttributes(formMatch[1] ?? '')
    const inner = formMatch[2] ?? ''
    const inputs = [...inner.matchAll(/<input\b([^>]*)>/gi)].map((match) => parseAttributes(match[1] ?? ''))
    const inputNames = inputs.map((input) => input.name).filter((name): name is string => Boolean(name))
    const rutLike = inputNames.some((name) => /rut|contribuyente/i.test(name)) || /12\.345\.678-9/i.test(inner)
    if (!rutLike) continue

    const hiddenFields: Record<string, string> = {}
    for (const input of inputs) {
      if (input.name && input.type?.toLowerCase() === 'hidden') hiddenFields[input.name] = input.value ?? ''
    }

    let action = formAttributes.action || landingUrl
    try {
      action = new URL(action, landingUrl).toString()
    } catch {
      action = landingUrl
    }

    return {
      action,
      method: formAttributes.method?.toUpperCase() === 'GET' ? 'GET' as const : 'POST' as const,
      inputNames: inputNames.slice(0, 20),
      hiddenFields,
    }
  }
  return null
}

function buildDiscoveredFormPayload(
  form: NonNullable<ReturnType<typeof discoverForm>>,
  rut: string,
  bodyRut: string,
  dv: string,
): URLSearchParams {
  const params = new URLSearchParams(form.hiddenFields)
  let assignedRut = false
  for (const name of form.inputNames) {
    if (/dv|digito|verificador/i.test(name)) {
      params.set(name, dv)
    } else if (/rut|contribuyente/i.test(name)) {
      params.set(name, /completo/i.test(name) ? rut : bodyRut)
      assignedRut = true
    }
  }
  if (!assignedRut) params.set('rut', rut)
  return params
}

function parseResponse(
  body: string,
  rut: string,
  sourceUrl: string,
  response: Response,
  context: Pick<QueryResult, 'attempts' | 'landing' | 'form'>,
): VerificationResult {
  const text = cleanText(body)
  const now = new Date().toISOString()
  const diagnostics = {
    response: safeDiagnostics(response, body),
    landing: context.landing,
    form: context.form ? { action: context.form.action, method: context.form.method, inputNames: context.form.inputNames } : null,
    attempts: context.attempts,
  }

  if (!text) {
    return {
      status: 'failed',
      errorCode: 'SII_EMPTY_RESPONSE',
      errorMessage: 'SII devolvió una respuesta vacía.',
      httpStatus: response.status,
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
    try {
      json = JSON.parse(body) as unknown
    } catch {
      json = null
    }
  }

  const razonSocial: string | null = firstString(
    json ? findJsonValue(json, ['razonSocial', 'razon_social', 'nombreRazonSocial', 'nombre']) : null,
    extractAfterLabel(text, ['Nombre o Razón Social', 'Razón Social', 'Nombre']),
  )
  const inicioActividades: string | null = firstString(
    json ? findJsonValue(json, ['fechaInicioActividades', 'inicioActividades', 'fecha_inicio_actividades']) : null,
    extractAfterLabel(text, ['Fecha de Inicio de Actividades', 'Inicio de Actividades']),
  )
  const hasTaxContent = hasAny(text, [
    /inicio de actividades/i,
    /actividades económicas/i,
    /documentos tributarios/i,
    /situación tributaria/i,
  ]) || Boolean(json && (razonSocial || inicioActividades))

  if (!hasTaxContent || razonSocial === null) {
    const shellOnly = responseMarkers(body).isLandingShell
    return {
      status: 'failed',
      errorCode: shellOnly ? 'SII_QUERY_NOT_EXECUTED' : 'SII_UNEXPECTED_RESPONSE',
      errorMessage: shellOnly
        ? 'SII devolvió la pantalla inicial sin ejecutar la consulta del RUT.'
        : 'La estructura recibida no coincide con una respuesta tributaria reconocible.',
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
  const evidence: VerificationEvidence[] = [
    { label: 'Razón social', value: razonSocial, sourceUrl, retrievedAt: now },
  ]
  if (inicioActividades !== null) {
    evidence.push({ label: 'Inicio de actividades', value: inicioActividades, sourceUrl, retrievedAt: now })
  }

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
    evidence,
  }
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
        Accept: 'text/html,application/json;q=0.9,*/*;q=0.8',
        'Accept-Language': 'es-CL,es;q=0.9',
        'User-Agent': 'Mozilla/5.0 (compatible; LABBE-Verification-Canary/1.1)',
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

function makeAttemptDiagnostic(name: string, method: 'GET' | 'POST', response: Response, body: string): AttemptDiagnostic {
  const diagnostics = safeDiagnostics(response, body)
  return {
    name,
    method,
    status: response.status,
    contentType: diagnostics.contentType,
    finalUrl: diagnostics.finalUrl,
    bodyLength: diagnostics.bodyLength,
    bodySha256: diagnostics.bodySha256,
    title: diagnostics.title,
    markers: diagnostics.markers,
  }
}

async function executeSiiQuery(rut: string): Promise<QueryResult> {
  const landingUrl = process.env.SII_TAX_STATUS_LANDING_URL || DEFAULT_LANDING_URL
  const configuredQueryUrl = process.env.SII_TAX_STATUS_QUERY_URL || DEFAULT_QUERY_URL
  const landingResponse = await fetchWithTimeout(landingUrl)
  const landingBody = await landingResponse.text()
  const landingText = cleanText(landingBody)
  const landingBlock = detectBlocking(landingText, landingResponse.status)
  const landing = safeDiagnostics(landingResponse, landingBody)
  const form = discoverForm(landingBody, landingUrl)
  const attempts: AttemptDiagnostic[] = []

  if (!landingResponse.ok || landingBlock) {
    return {
      response: landingResponse,
      body: landingBody,
      sourceUrl: landingUrl,
      blocked: landingBlock,
      attempts,
      landing,
      form,
    }
  }

  const cookie = extractCookies(landingResponse)
  const [bodyRut, dv] = rut.split('-')
  const commonHeaders: Record<string, string> = {
    Referer: landingUrl,
    Origin: new URL(landingUrl).origin,
    'X-Requested-With': 'XMLHttpRequest',
    ...(cookie ? { Cookie: cookie } : {}),
  }

  const requestAttempts: Array<{
    name: string
    method: 'GET' | 'POST'
    url: string
    headers?: Record<string, string>
    body?: string
  }> = []

  if (form) {
    const params = buildDiscoveredFormPayload(form, rut, bodyRut, dv)
    if (form.method === 'GET') {
      const url = new URL(form.action)
      params.forEach((value, key) => url.searchParams.set(key, value))
      requestAttempts.push({ name: 'discovered-form-get', method: 'GET', url: url.toString(), headers: commonHeaders })
    } else {
      requestAttempts.push({
        name: 'discovered-form-post',
        method: 'POST',
        url: form.action,
        headers: { ...commonHeaders, 'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8' },
        body: params.toString(),
      })
    }
  }

  requestAttempts.push(
    {
      name: 'json-full-rut',
      method: 'POST',
      url: configuredQueryUrl,
      headers: { ...commonHeaders, 'Content-Type': 'application/json' },
      body: JSON.stringify({ rut }),
    },
    {
      name: 'json-split-rut',
      method: 'POST',
      url: configuredQueryUrl,
      headers: { ...commonHeaders, 'Content-Type': 'application/json' },
      body: JSON.stringify({ rut: bodyRut, dv }),
    },
    {
      name: 'form-common-fields',
      method: 'POST',
      url: configuredQueryUrl,
      headers: { ...commonHeaders, 'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8' },
      body: new URLSearchParams({ rut, rutCompleto: rut, rutContribuyente: bodyRut, dv }).toString(),
    },
    {
      name: 'get-full-rut',
      method: 'GET',
      url: `${configuredQueryUrl}?rut=${encodeURIComponent(rut)}`,
      headers: commonHeaders,
    },
    {
      name: 'get-split-rut',
      method: 'GET',
      url: `${configuredQueryUrl}?rut=${encodeURIComponent(bodyRut)}&dv=${encodeURIComponent(dv)}`,
      headers: commonHeaders,
    },
  )

  let last: Omit<QueryResult, 'attempts' | 'landing' | 'form'> | null = null
  for (const attempt of requestAttempts.slice(0, MAX_ATTEMPTS)) {
    const response = await fetchWithTimeout(attempt.url, {
      method: attempt.method,
      headers: attempt.headers,
      body: attempt.body,
    })
    const body = await response.text()
    const blocked = detectBlocking(cleanText(body), response.status)
    attempts.push(makeAttemptDiagnostic(attempt.name, attempt.method, response, body))
    last = { response, body, sourceUrl: response.url || attempt.url, blocked }

    const markers = responseMarkers(body)
    if (blocked || response.status === 403 || response.status === 429) break
    if (response.ok && (markers.hasActivities || markers.hasInicioActividades || markers.hasCompanyName || markers.looksLikeJson)) break
  }

  if (!last) throw new Error('SII query produced no response')
  return { ...last, attempts, landing, form }
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
      const result = await executeSiiQuery(rut)
      if (result.blocked) {
        return {
          status: 'blocked',
          errorCode: result.blocked.code,
          errorMessage: result.blocked.message,
          httpStatus: result.response.status,
          normalizedResult: {
            rut,
            diagnostics: {
              response: safeDiagnostics(result.response, result.body),
              landing: result.landing,
              form: result.form ? { action: result.form.action, method: result.form.method, inputNames: result.form.inputNames } : null,
              attempts: result.attempts,
            },
          },
          evidence: [{ label: 'Fuente', value: 'SII', sourceUrl: result.sourceUrl, retrievedAt: new Date().toISOString() }],
        }
      }
      if (!result.response.ok) {
        return {
          status: 'failed',
          errorCode: 'SII_HTTP_ERROR',
          errorMessage: `SII respondió HTTP ${result.response.status}.`,
          httpStatus: result.response.status,
          normalizedResult: {
            rut,
            diagnostics: {
              response: safeDiagnostics(result.response, result.body),
              landing: result.landing,
              form: result.form ? { action: result.form.action, method: result.form.method, inputNames: result.form.inputNames } : null,
              attempts: result.attempts,
            },
          },
        }
      }
      return parseResponse(result.body, rut, result.sourceUrl, result.response, result)
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
