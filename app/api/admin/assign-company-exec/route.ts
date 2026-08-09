import { NextResponse } from 'next/server'

export async function POST() {
  return NextResponse.json(
    {
      error: 'Endpoint retired',
      message: 'This one-off assignment route is disabled. Use the authenticated executive assignment workflow instead.',
    },
    { status: 410 },
  )
}
