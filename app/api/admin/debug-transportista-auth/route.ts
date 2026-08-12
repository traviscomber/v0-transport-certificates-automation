import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

function gone() {
  return NextResponse.json(
    {
      error: 'Gone',
      message: 'Legacy debug and test endpoints are disabled in ChileFlota.',
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

export async function PUT() {
  return gone()
}

export async function PATCH() {
  return gone()
}

export async function DELETE() {
  return gone()
}
