import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET() {
  return NextResponse.json(
    {
      error: 'Endpoint disabled',
      message: 'Bulk password SQL generation is disabled to avoid exposing credentials or hashes.',
    },
    { status: 410 }
  )
}
