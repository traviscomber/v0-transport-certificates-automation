import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json(
    {
      error: 'Endpoint disabled',
      message: 'Login tests with query-string passwords are disabled in production-safe builds.',
    },
    { status: 410 }
  )
}
