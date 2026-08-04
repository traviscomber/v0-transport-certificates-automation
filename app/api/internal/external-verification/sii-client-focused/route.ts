import { createHash, timingSafeEqual } from 'node:crypto'
import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'
export const revalidate = 0

const BUNDLE_URL = 'https://www2.sii.cl/stc/assets/index-c4ef93c6.js'
const NONCE_SHA256 = '3d43c2f11863adcccb1c1b751d4b85a8fbe368b540cc99bef88dcf9bf01ec5ad'
const EXPIRES_AT = 1785815697
const TIMEOUT_MS = 15_000

function safeHexEqual(left: string, right: string): boolean {
  if (!/^[a-f0-9]{64}$/i.test(left) || !/^[a-f0-9]{64}$/i.test(right)) return false
  const a = Buffer.from(left, 'hex')
  const b = Buffer.from(right, 'hex')
  return a.length === b.length && timingSafeEqual(a, b)
}

function authorized(request: NextRequest): boolean {
  if (Math.floor(Date.now() / 1000) > EXPIRES_AT) return false
  const nonce = request.nextUrl.searchParams.get('nonce')
  if (!nonce) return false
  return safeHexEqual(createHash('sha256').update(nonce).digest('hex'), NONCE_SHA256)
}

async function fetchBundle(): Promise<string> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS)
  try {
    const response = await fetch(BUNDLE_URL, {
      cache: 'no-store',
      redirect: 'follow',
      signal: controller.signal,
      headers: {
        Accept: 'application/javascript,*/*;q=0.8',
        Referer: 'https://www2.sii.cl/stc/noauthz',
        'User-Agent': 'Mozilla/5.0 (compatible; LABBE-SII-Focused-Diagnostic/1.0)',
      },
    })
    if (!response.ok) throw new Error(`Bundle HTTP ${response.status}`)
    return response.text()
  } finally {
    clearTimeout(timer)
  }
}

function windows(body: string, pattern: RegExp, before = 300, after = 700, limit = 20): string[] {
  const output: string[] = []
  const flags = pattern.flags.includes('g') ? pattern.flags : `${pattern.flags}g`
  const regex = new RegExp(pattern.source, flags)
  let match: RegExpExecArray | null
  while ((match = regex.exec(body)) && output.length < limit) {
    const start = Math.max(0, match.index - before)
    const end = Math.min(body.length, match.index + match[0].length + after)
    const value = body.slice(start, end).replace(/\s+/g, ' ')
    if (!output.includes(value)) output.push(value)
    if (match[0].length === 0) regex.lastIndex += 1
  }
  return output
}

function quotedValues(body: string, keyword: RegExp, limit = 100): string[] {
  const values: string[] = []
  const regex = /["'`]([^"'`\n\r]{1,260})["'`]/g
  let match: RegExpExecArray | null
  while ((match = regex.exec(body)) && values.length < limit) {
    const value = match[1] ?? ''
    if (keyword.test(value) && !values.includes(value)) values.push(value)
    keyword.lastIndex = 0
  }
  return values
}

export async function GET(request: NextRequest) {
  if (!authorized(request)) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  try {
    const body = await fetchBundle()
    return NextResponse.json({
      bundle: {
        url: BUNDLE_URL,
        length: body.length,
        sha256: createHash('sha256').update(body).digest('hex'),
      },
      axiosPost: windows(body, /axios\.post\(/gi),
      axiosCreate: windows(body, /axios\.create\(|baseURL/gi),
      reToken: windows(body, /reToken|re_token|reAction|re_action/gi, 220, 900, 30),
      rutFields: windows(body, /rut_form|dv_form|formRUT|formDV/gi, 220, 900, 30),
      apiErrors: windows(body, /ErrorAPI|httpStatusCode|apiError/gi, 220, 900, 30),
      likelyPaths: quotedValues(body, /(api|stc|consulta|situacion|situación|contrib|tercero|rut|captcha|recaptcha|token)/i),
    })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown diagnostic error' },
      { status: 500 },
    )
  }
}
