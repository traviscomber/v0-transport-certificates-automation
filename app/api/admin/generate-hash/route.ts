import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET() {
  return NextResponse.json(
    {
      error: 'Endpoint disabled',
      message: 'Password hash generation must be performed through authenticated admin workflows, not public debug endpoints.',
    },
    { status: 410 }
  )
}
