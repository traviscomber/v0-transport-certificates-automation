import { NextResponse } from 'next/server'

export async function POST() {
  return NextResponse.json(
    {
      error: 'Endpoint disabled',
      message: 'Transportista migrations that rewrite production data are disabled in production-safe builds.',
    },
    { status: 410 }
  )
}
