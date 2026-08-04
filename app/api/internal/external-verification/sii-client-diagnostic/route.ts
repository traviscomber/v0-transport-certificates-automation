import { createHash, timingSafeEqual } from 'node:crypto'
import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'
export const revalidate = 0

const LANDING_URL = 'https://www2.sii.cl/stc/noauthz'
const NONCE_SHA256 = 'bd798cb504f517415984734a9efbd73e151e6925e3bf803ec7fe52143307b310'
const EXPIRES_AT = 1785815536
const MAX_SCRIPTS = 12
const MAX_CANDIDATES = 100
const TIMEOUT_MS = 15_000

function safeHexEqual(left: string, right: string): boolean {
  if (!/^[a-f0-9]{64}$/i.test(left) || !/^[a-f0-9]{64}$/i.test(right)) return false
  const a = Buffer.from(left, 'hex')
  const b = Buffer.from(right, 'hex')
  return a.length === b.length && timingSafeEqual(a, b)
}

function isAuthorized(request: NextRequest): boolean {
  if (Math.floor(Date.now() / 1000) > EXPIRES_AT) return false
  const nonce = request.nextUrl.searchParams.get('nonce')
  if (!nonce) return false
  return safeHexEqual(createHash('sha256').update(nonce).digest('hex'), NONCE_SHA256)
}

async function fetchWithTimeout(url: string, init?: RequestInit): Promise<Response> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS)
  try {
    return await fetch(url, {
      ...init,
      cache: 'no-store',
      redirect: 'follow',
      signal: controller.signal,
      headers: {
        Accept: '*/*',
        'Accept-Language': 'es-CL,es;q=0.9',
        'User-Agent': 'Mozilla/5.0 (compatible; LABBE-SII-Diagnostic/1.0)',
        ...(init?.headers ?? {}),
      },
    })
  } finally {
    clearTimeout(timer)
  }
}

function extractCookies(response: Response): string {
  const headers = response.headers as Headers & { getSetCookie?: () => string[] }
  const values = typeof headers.getSetCookie === 'function'
    ? headers.getSetCookie()
    : [response.headers.get('set-cookie') || '']
  return values.filter(Boolean).map((value) => value.split(';')[0]).join('; ')
}

function extractScripts(html: string, baseUrl: string): string[] {
  const result: string[] = []
  const origin = new URL(baseUrl).origin
  const regex = /<script\b[^>]*\bsrc\s*=\s*(?:"([^"]+)"|'([^']+)'|([^\s>]+))/gi
  for (const match of html.matchAll(regex)) {
    const raw = match[1] ?? match[2] ?? match[3]
    if (!raw) continue
    try {
      const url = new URL(raw.replace(/&amp;/gi, '&'), baseUrl)
      if (url.origin !== origin || !/^https?:$/.test(url.protocol)) continue
      if (!result.includes(url.toString())) result.push(url.toString())
    } catch {
      continue
    }
  }
  return result.slice(0, MAX_SCRIPTS)
}

function normalizeCandidate(raw: string, scriptUrl: string): string | null {
  const cleaned = raw
    .replace(/\\\//g, '/')
    .replace(/\\u002F/gi, '/')
    .replace(/\\x2F/gi, '/')
    .trim()
  if (!cleaned || cleaned.length > 300 || /[{}<>\s]/.test(cleaned)) return null
  if (!/(rut|consulta|contrib|situaci|tercero|stc|api|rest|service|servicio|siac)/i.test(cleaned)) return null
  if (/\.(?:js|css|png|jpe?g|gif|svg|ico|woff2?|map)(?:\?|$)/i.test(cleaned)) return null
  try {
    const url = new URL(cleaned, scriptUrl)
    if (!/^https?:$/.test(url.protocol)) return null
    url.hash = ''
    return url.toString()
  } catch {
    return cleaned.startsWith('/') ? cleaned : null
  }
}

function inspectBundle(body: string, scriptUrl: string) {
  const candidates: string[] = []
  const snippets: string[] = []
  const stringRegex = /["'`]([^"'`\n\r]{3,300})["'`]/g
  for (const match of body.matchAll(stringRegex)) {
    const value = match[1] ?? ''
    const candidate = normalizeCandidate(value, scriptUrl)
    if (candidate && !candidates.includes(candidate)) candidates.push(candidate)
    if (/(fetch\(|axios|\.post\(|\.get\(|http|rut|consulta|contribuyente|siac)/i.test(value)) {
      const compact = value.replace(/\s+/g, ' ').slice(0, 260)
      if (compact && !snippets.includes(compact)) snippets.push(compact)
    }
    if (candidates.length >= MAX_CANDIDATES && snippets.length >= MAX_CANDIDATES) break
  }

  const surroundingSnippets: string[] = []
  const keyword = /(fetch\(|axios|\.post\(|\.get\(|rut|consulta|contribuyente|siac)/gi
  let found: RegExpExecArray | null
  while ((found = keyword.exec(body)) && surroundingSnippets.length < 40) {
    const start = Math.max(0, found.index - 160)
    const end = Math.min(body.length, found.index + 260)
    const snippet = body.slice(start, end).replace(/\s+/g, ' ')
    if (!surroundingSnippets.includes(snippet)) surroundingSnippets.push(snippet)
  }

  return {
    candidates: candidates.slice(0, MAX_CANDIDATES),
    stringSnippets: snippets.slice(0, 60),
    surroundingSnippets,
  }
}

export async function GET(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  try {
    const landingResponse = await fetchWithTimeout(LANDING_URL)
    const html = await landingResponse.text()
    const cookie = extractCookies(landingResponse)
    const scriptUrls = extractScripts(html, landingResponse.url || LANDING_URL)
    const scripts = []
    const allCandidates: string[] = []

    for (const scriptUrl of scriptUrls) {
      try {
        const response = await fetchWithTimeout(scriptUrl, {
          headers: {
            Referer: LANDING_URL,
            ...(cookie ? { Cookie: cookie } : {}),
          },
        })
        const body = await response.text()
        const inspected = inspectBundle(body, scriptUrl)
        for (const candidate of inspected.candidates) {
          if (!allCandidates.includes(candidate)) allCandidates.push(candidate)
        }
        scripts.push({
          url: scriptUrl,
          status: response.status,
          contentType: response.headers.get('content-type'),
          length: body.length,
          sha256: createHash('sha256').update(body).digest('hex'),
          ...inspected,
        })
      } catch (error) {
        scripts.push({
          url: scriptUrl,
          status: 0,
          error: error instanceof Error ? error.message : 'Unknown bundle error',
        })
      }
    }

    return NextResponse.json({
      landing: {
        status: landingResponse.status,
        url: landingResponse.url,
        contentType: landingResponse.headers.get('content-type'),
        length: html.length,
        sha256: createHash('sha256').update(html).digest('hex'),
        cookiePresent: Boolean(cookie),
        scriptUrls,
      },
      allCandidates: allCandidates.slice(0, MAX_CANDIDATES),
      scripts,
    })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown diagnostic error' },
      { status: 500 },
    )
  }
}
