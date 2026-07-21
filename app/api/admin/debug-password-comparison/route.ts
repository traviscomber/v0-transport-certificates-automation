import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET() {
  return NextResponse.json(
    {
      error: 'Endpoint disabled',
      message: 'Password comparison debug endpoints are disabled in production-safe builds.',
    },
    { status: 410 }
  )
}
