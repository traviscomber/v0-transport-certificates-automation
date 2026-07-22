import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function POST() {
  return NextResponse.json(
    {
      error: 'Endpoint disabled',
      message: 'Production Labbe seed data must not be loaded from public API routes.',
    },
    { status: 410 }
  )
}
