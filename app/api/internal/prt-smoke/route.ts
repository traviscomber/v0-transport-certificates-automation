import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'
export const revalidate = 0
export const maxDuration = 30

const SOURCE_URL = 'https://www.prt.cl/paginas/revisiontecnica.aspx'

function extractCookies(response: Response): string {
  const headers = response.headers as Headers & { getSetCookie?: () => string[] }
  const values = typeof headers.getSetCookie === 'function'
    ? headers.getSetCookie()
    : [response.headers.get('set-cookie') || '']
  return values.filter(Boolean).map((value) => value.split(';')[0]).join('; ')
}

function hiddenValue(html: string, name: string): string {
  const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const pattern = new RegExp(`<input[^>]+name=["']${escaped}["'][^>]+value=["']([^"']*)["']`, 'i')
  return html.match(pattern)?.[1] || ''
}

function cleanText(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&#\d+;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

export async function GET() {
  const plate = 'ZZZZ99'
  const landing = await fetch(SOURCE_URL, {
    cache: 'no-store',
    redirect: 'follow',
    headers: {
      Accept: 'text/html,application/xhtml+xml',
      'Accept-Language': 'es-CL,es;q=0.9',
      'User-Agent': 'Mozilla/5.0 (compatible; LABBE-PRT-Smoke/1.0)',
    },
  })
  const landingHtml = await landing.text()
  const cookie = extractCookies(landing)

  const form = new URLSearchParams({
    __EVENTTARGET: '',
    __EVENTARGUMENT: '',
    __VIEWSTATE: hiddenValue(landingHtml, '__VIEWSTATE'),
    __VIEWSTATEGENERATOR: hiddenValue(landingHtml, '__VIEWSTATEGENERATOR'),
    __EVENTVALIDATION: hiddenValue(landingHtml, '__EVENTVALIDATION'),
    'ctl00$ContentPlaceHolder1$hddPPU': '',
    'ctl00$ContentPlaceHolder1$hddPRT': '',
    'ctl00$ContentPlaceHolder1$hddDIRPRT': '',
    'ctl00$ContentPlaceHolder1$patenteInput': plate,
    'ctl00$ContentPlaceHolder1$buscar': 'Consultar',
    'ctl00$ContentPlaceHolder1$MyAccordion_AccordionExtender_ClientState': '-1',
    'g-recaptcha-response': '',
  })

  const response = await fetch(SOURCE_URL, {
    method: 'POST',
    cache: 'no-store',
    redirect: 'follow',
    headers: {
      Accept: 'text/html,application/xhtml+xml',
      'Accept-Language': 'es-CL,es;q=0.9',
      'Content-Type': 'application/x-www-form-urlencoded',
      Referer: SOURCE_URL,
      Origin: new URL(SOURCE_URL).origin,
      'User-Agent': 'Mozilla/5.0 (compatible; LABBE-PRT-Smoke/1.0)',
      ...(cookie ? { Cookie: cookie } : {}),
    },
    body: form.toString(),
  })

  const html = await response.text()
  const text = cleanText(html)
  const relevant = text
    .split(/(?<=[.!?])\s+/)
    .filter((line) => /captcha|patente|revisi[oó]n|resultado|vigente|vencid|rechaz|aprob|error|inv[aá]lid|no se encontr/i.test(line))
    .slice(0, 30)

  return NextResponse.json({
    plate,
    landingStatus: landing.status,
    postStatus: response.status,
    finalUrl: response.url,
    hasViewState: Boolean(hiddenValue(landingHtml, '__VIEWSTATE')),
    hasEventValidation: Boolean(hiddenValue(landingHtml, '__EVENTVALIDATION')),
    cookiePresent: Boolean(cookie),
    responseLength: html.length,
    captchaPresent: /g-recaptcha|recaptcha/i.test(html),
    relevant,
    textPreview: text.slice(0, 1800),
  })
}
