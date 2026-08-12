import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function DELETE() {
  return NextResponse.json(
    {
      error: 'Gone',
      message: 'Direct document deletion is disabled. Use the controlled document lifecycle instead.',
    },
    { status: 410 },
  )
}
