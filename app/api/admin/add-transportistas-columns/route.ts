import { NextResponse } from 'next/server'

export async function POST() {
  return NextResponse.json(
    {
      error: 'Endpoint retired',
      message: 'Schema changes must be applied through versioned database migrations, not runtime admin routes.',
    },
    { status: 410 },
  )
}
