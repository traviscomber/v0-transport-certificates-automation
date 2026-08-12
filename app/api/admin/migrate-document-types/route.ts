import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

function gone() {
  return NextResponse.json(
    {
      error: 'Gone',
      message: 'Runtime migration endpoints are disabled in ChileFlota. Use versioned Supabase migrations instead.',
    },
    { status: 410 },
  )
}

export async function GET() {
  return gone()
}

export async function POST() {
  return gone()
}
