import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'
export const revalidate = 0
export const maxDuration = 30

const PAGE_URL = 'https://www.prt.cl/Descargas/sites/2026/3.Marzo/marzo.html'

export async function GET() {
  const response = await fetch(PAGE_URL, {
    cache: 'no-store',
    redirect: 'follow',
    headers: {
      Accept: 'text/html,application/xhtml+xml',
      'Accept-Language': 'es-CL,es;q=0.9',
      'User-Agent': 'Mozilla/5.0 (compatible; LABBE-PRT-Downloads/1.0)',
    },
  })
  const html = await response.text()
  const base = new URL(response.url || PAGE_URL)
  const links = [...html.matchAll(/<a\b[^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi)]
    .map((match) => {
      const href = new URL(match[1], base).toString()
      const label = match[2].replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
      return { href, label }
    })
    .filter((item) => /SGPRT|RA1|RA2|RB|\.zip|\.csv|\.txt|\.xlsx?/i.test(`${item.href} ${item.label}`))

  return NextResponse.json({ pageUrl: PAGE_URL, status: response.status, links })
}
