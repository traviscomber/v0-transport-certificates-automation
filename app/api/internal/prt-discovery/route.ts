import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'
export const revalidate = 0
export const maxDuration = 30

const SOURCE_URL = 'https://www.prt.cl/paginas/revisiontecnica.aspx'

function unique(values: string[]) {
  return [...new Set(values.filter(Boolean))]
}

export async function GET() {
  const response = await fetch(SOURCE_URL, {
    cache: 'no-store',
    redirect: 'follow',
    headers: {
      Accept: 'text/html,application/xhtml+xml',
      'Accept-Language': 'es-CL,es;q=0.9',
      'User-Agent': 'Mozilla/5.0 (compatible; LABBE-PRT-Discovery/1.0)',
    },
  })

  const html = await response.text()
  const forms = [...html.matchAll(/<form\b[^>]*?(?:action=["']([^"']*)["'])?[^>]*>/gi)].map((match) => match[1] || '')
  const inputs = [...html.matchAll(/<input\b[^>]*?(?:name|id)=["']([^"']+)["'][^>]*>/gi)].map((match) => match[1])
  const scripts = [...html.matchAll(/<script\b[^>]*?src=["']([^"']+)["'][^>]*>/gi)].map((match) => match[1])
  const urls = [...html.matchAll(/https?:\/\/[^"'\s<>]+/gi)].map((match) => match[0])
  const hints = html
    .split(/\r?\n/)
    .filter((line) => /patente|revision|consulta|ajax|webmethod|service/i.test(line))
    .slice(0, 80)
    .map((line) => line.trim().slice(0, 500))

  return NextResponse.json({
    sourceUrl: SOURCE_URL,
    status: response.status,
    ok: response.ok,
    contentType: response.headers.get('content-type'),
    htmlLength: html.length,
    forms: unique(forms),
    inputs: unique(inputs),
    scripts: unique(scripts),
    urls: unique(urls).slice(0, 100),
    hints,
  })
}
