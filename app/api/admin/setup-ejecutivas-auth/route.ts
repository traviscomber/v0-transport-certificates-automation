import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function POST() {
  return NextResponse.json(
    {
      error: 'Endpoint disabled',
      message: 'Ejecutiva auth setup with embedded passwords is disabled in production-safe builds.',
    },
    { status: 410 }
  )
}
