import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET() {
  return NextResponse.json(
    {
      error: 'Gone',
      message: 'Credential debug endpoints are disabled in ChileFlota.',
    },
    { status: 410 },
  )
}
