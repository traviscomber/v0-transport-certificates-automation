import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function POST() {
  return NextResponse.json(
    {
      error: 'Endpoint disabled',
      message: 'Executive seeding with embedded hashes is disabled in production-safe builds.',
    },
    { status: 410 }
  )
}
