import { NextResponse } from 'next/server'

export async function POST() {
  return NextResponse.json(
    {
      error: 'Endpoint disabled',
      message: 'One-off setup routes with embedded credentials are disabled in production-safe builds.',
    },
    { status: 410 }
  )
}
