import { NextResponse } from 'next/server'

export async function POST() {
  return NextResponse.json(
    {
      error: 'Endpoint disabled',
      message: 'Transportista auth migrations must run through reviewed database migrations, not public admin endpoints.',
    },
    { status: 410 }
  )
}
