import { NextResponse } from 'next/server'

export async function POST() {
  return NextResponse.json(
    {
      error: 'Endpoint disabled',
      message: 'Bulk user creation from team data is disabled in production-safe builds.',
    },
    { status: 410 }
  )
}

export async function GET() {
  return NextResponse.json(
    {
      error: 'Endpoint disabled',
      message: 'This legacy setup endpoint is disabled.',
    },
    { status: 410 }
  )
}
