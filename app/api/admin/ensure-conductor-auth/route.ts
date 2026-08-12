import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function POST() {
  return NextResponse.json(
    {
      error: 'Gone',
      message: 'Legacy credential bootstrap endpoints are disabled in ChileFlota. Use a verified, auditable provisioning workflow.',
    },
    { status: 410 },
  )
}

export async function GET() {
  return NextResponse.json(
    {
      error: 'Gone',
      message: 'Legacy credential bootstrap endpoints are disabled in ChileFlota. Use a verified, auditable provisioning workflow.',
    },
    { status: 410 },
  )
}
