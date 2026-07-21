import { NextResponse } from 'next/server'

export async function POST() {
  return NextResponse.json(
    {
      error: 'Endpoint disabled',
      message: 'One-off user creation with embedded credentials is disabled in production-safe builds.',
    },
    { status: 410 }
  )
}
