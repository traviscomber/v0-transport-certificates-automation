import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET() {
  return NextResponse.json(
    {
      error: 'Endpoint disabled',
      message: 'Bulk user sync with embedded passwords is disabled in production-safe builds.',
    },
    { status: 410 }
  )
}
