import { NextResponse } from 'next/server'

export async function POST() {
  return NextResponse.json(
    {
      error: 'Gone',
      message: 'Runtime schema mutation endpoints are disabled. Use a versioned Supabase migration instead.',
    },
    { status: 410 },
  )
}
