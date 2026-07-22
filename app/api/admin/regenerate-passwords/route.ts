import { NextResponse } from 'next/server'

export async function POST() {
  return NextResponse.json(
    {
      error: 'Endpoint disabled',
      message: 'Bulk password regeneration is disabled in production-safe builds.',
    },
    { status: 410 }
  )
}
