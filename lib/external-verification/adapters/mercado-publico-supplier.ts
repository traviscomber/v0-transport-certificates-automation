import type {
  VerificationEvidence,
  VerificationRequest,
  VerificationResult,
  VerificationSourceAdapter,
} from '../types'

const API_BASE_URL = 'https://api.mercadopublico.cl'
const LOOKUP_URL = `${API_BASE_URL}/servicios/v1/Publico/Empresas/BuscarProveedor`
const OPEN_DATA_SUPPLIERS_URL = 'https://datos-abiertos.chilecompra.cl/organismos-proveedores'
const API_DOCS_URL = 'https://www.chilecompra.cl/api/'
const REQUEST_TIMEOUT_MS = 12_000
const OFFICIAL_TEST_TICKET = 'F8537A18-6766-4DEF-9E59-426B4FEE2844'

type JsonRecord = Record<string, unknown>

type SupplierRecord = {
  code: string
  name: string
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

function formatRut(raw: string): string {
  const normalized = normalizeRut(raw)
  const [body, verifier] = normalized.split('-')
  const dotted = body.replace(/\B(?=(\d{3})+(?!\d))/g, '.')
  return `${dotted}-${verifier === 'K' ? 'k' : verifier}`
}

function supplierProfileUrl(formattedRut: string): string {
  return `${OPEN_DATA_SUPPLIERS_URL}/${encodeURIComponent(formattedRut)}`
}

function isRecord(value: unknown): value is JsonRecord {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value)
}

function firstString(...values: unknown[]): string | null {
  for (const value of values) {
    if (typeof value === 'string' && value.trim()) return value.trim()
    if (typeof value === 'number') return String(value)
  }
  return null
}

function pickCaseInsensitive(record: JsonRecord, candidates: string[]): unknown {
  const wanted = new Set(candidates.map((key) => key.toLowerCase()))
  for (const [key, value] of Object.entries(record)) {
    if (wanted.has(key.toLowerCase())) return value
  }
  return undefined
}

function findSupplierRecord(value: unknown): SupplierRecord | null {
  if (Array.isArray(value)) {
    for (const item of value) {
      const found = findSupplierRecord(item)
      if (found) return found
    }
    return null
  }

  if (!isRecord(value)) return null

  const code = firstString(pickCaseInsensitive(value, ['CodigoEmpresa', 'CodigoProveedor', 'codigo_empresa']))
  const name = firstString(pickCaseInsensitive(value, ['NombreEmpresa', 'NombreProveedor', 'nombre_empresa']))
  if (code && name) return { code, name }

  for (const nested of Object.values(value)) {
    const found = findSupplierRecord(nested)
    if (found) return found
  }

  return null
}

function findSupplierInXml(body: string): SupplierRecord | null {
  const code = body.match(/<Codigo(?:Empresa|Proveedor)[^>]*>(?:<!\[CDATA\[)?\s*([^<\]]+)/i)?.[1]?.trim()
  const name = body.match(/<Nombre(?:Empresa|Proveedor)[^>]*>(?:<!\[CDATA\[)?\s*([^<\]]+)/i)?.[1]?.trim()
  return code && name ? { code, name } : null
}

function indicatesNoResults(value: unknown, rawBody: string): boolean {
  const normalized = rawBody
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()

  if (/no (?:se )?(?:encontraron|encontro|existen) (?:resultados|proveedores|empresas)/.test(normalized)) return true

  if (isRecord(value)) {
    const quantity = pickCaseInsensitive(value, ['Cantidad', 'Total', 'count'])
    if (quantity === 0 || quantity === '0') return true
  }

  return false
}

function resolveTicket(): string | null {
  const configured = process.env.MERCADO_PUBLICO_API_TICKET?.trim()
  if (configured) return configured

  const allowOfficialTestTicket = process.env.MERCADO_PUBLICO_ALLOW_TEST_TICKET === 'true'
  const isProduction = process.env.VERCEL_ENV === 'production' || process.env.NODE_ENV === 'production'
  if (allowOfficialTestTicket && !isProduction) return OFFICIAL_TEST_TICKET

  return null
}

async function fetchWithTimeout(url: string): Promise<Response> {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)

  try {
    return await fetch(url, {
      signal: controller.signal,
      cache: 'no-store',
      redirect: 'follow',
      headers: {
        Accept: 'application/json,application/xml,text/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'es-CL,es;q=0.9',
        'User-Agent': 'ChileFlota-MercadoPublico-Adapter/1.0',
      },
    })
  } finally {
    clearTimeout(timeout)
  }
}

function evidence(label: string, value: string, sourceUrl: string): VerificationEvidence {
  return {
    label,
    value,
    sourceUrl,
    retrievedAt: new Date().toISOString(),
  }
}

export class MercadoPublicoSupplierAdapter implements VerificationSourceAdapter {
  readonly code = 'mercado_publico_supplier' as const

  async verify(input: VerificationRequest): Promise<VerificationResult> {
    const rawRut = typeof input.payload.rut === 'string' ? input.payload.rut : ''
    const rut = normalizeRut(rawRut)

    if (!isValidRut(rut)) {
      return {
        status: 'failed',
        errorCode: 'MERCADO_PUBLICO_INVALID_RUT',
        errorMessage: 'El RUT no tiene un formato o digito verificador valido.',
      }
    }

    const ticket = resolveTicket()
    if (!ticket) {
      return {
        status: 'skipped',
        errorCode: 'MERCADO_PUBLICO_TICKET_MISSING',
        errorMessage: 'Falta configurar MERCADO_PUBLICO_API_TICKET para consultar la API oficial.',
      }
    }

    const formattedRut = formatRut(rut)
    const publicProfileUrl = supplierProfileUrl(formattedRut)
    const url = new URL(LOOKUP_URL)
    url.searchParams.set('rutempresaproveedor', formattedRut)
    url.searchParams.set('ticket', ticket)

    let response: Response
    try {
      response = await fetchWithTimeout(url.toString())
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error de red desconocido'
      return {
        status: 'failed',
        errorCode: error instanceof Error && error.name === 'AbortError'
          ? 'MERCADO_PUBLICO_TIMEOUT'
          : 'MERCADO_PUBLICO_NETWORK_ERROR',
        errorMessage: message,
      }
    }

    const rawBody = await response.text()

    if (response.status === 401 || response.status === 403) {
      return {
        status: 'failed',
        httpStatus: response.status,
        errorCode: 'MERCADO_PUBLICO_AUTH_FAILED',
        errorMessage: 'La API de Mercado Publico rechazo el ticket configurado.',
      }
    }

    if (response.status === 429) {
      return {
        status: 'failed',
        httpStatus: response.status,
        errorCode: 'MERCADO_PUBLICO_RATE_LIMITED',
        errorMessage: 'Mercado Publico limito temporalmente las consultas.',
      }
    }

    if (response.status === 404) {
      return {
        status: 'not_found',
        httpStatus: response.status,
        confidence: 0.98,
        normalizedResult: {
          rut,
          formattedRut,
          registeredInMercadoPublico: false,
          publicProfileUrl,
        },
        evidence: [evidence('Ficha publica ChileCompra', formattedRut, publicProfileUrl)],
      }
    }

    if (!response.ok) {
      return {
        status: 'failed',
        httpStatus: response.status,
        errorCode: 'MERCADO_PUBLICO_HTTP_ERROR',
        errorMessage: `Mercado Publico respondio HTTP ${response.status}.`,
      }
    }

    let parsed: unknown = null
    try {
      parsed = rawBody.trim() ? JSON.parse(rawBody) as unknown : null
    } catch {
      parsed = null
    }

    const supplier = findSupplierRecord(parsed) ?? findSupplierInXml(rawBody)

    if (!supplier) {
      if (indicatesNoResults(parsed, rawBody)) {
        return {
          status: 'not_found',
          httpStatus: response.status,
          confidence: 0.95,
          normalizedResult: {
            rut,
            formattedRut,
            registeredInMercadoPublico: false,
            publicProfileUrl,
          },
          evidence: [evidence('Ficha publica ChileCompra', formattedRut, publicProfileUrl)],
        }
      }

      return {
        status: 'failed',
        httpStatus: response.status,
        errorCode: 'MERCADO_PUBLICO_UNEXPECTED_RESPONSE',
        errorMessage: 'La API respondio, pero no fue posible reconocer la estructura del proveedor.',
      }
    }

    return {
      status: 'success',
      httpStatus: response.status,
      confidence: 0.99,
      normalizedResult: {
        rut,
        formattedRut,
        registeredInMercadoPublico: true,
        providerCode: supplier.code,
        providerName: supplier.name,
        publicProfileUrl,
        capability: 'supplier_registry_presence',
        note: 'La presencia en Mercado Publico no equivale por si sola a habilidad vigente para contratar con el Estado.',
      },
      evidence: [
        evidence('Proveedor Mercado Publico', supplier.name, API_DOCS_URL),
        evidence('Codigo interno proveedor', supplier.code, API_DOCS_URL),
        evidence('Ficha publica ChileCompra', formattedRut, publicProfileUrl),
      ],
    }
  }
}
