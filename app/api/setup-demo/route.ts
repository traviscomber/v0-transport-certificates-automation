import { NextResponse } from 'next/server'

export async function POST() {
  return NextResponse.json(
    { error: 'Demo setup is disabled in production' },
    { status: 410 }
  )
}

export async function GET() {
  return NextResponse.json(
    { error: 'Demo setup is disabled in production' },
    { status: 410 }
  )
}
