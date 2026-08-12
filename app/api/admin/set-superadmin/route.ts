import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function POST() {
  return NextResponse.json(
    {
      error: 'Gone',
      message: 'Superadmin bootstrap over HTTP is disabled in ChileFlota. Use a controlled, auditable admin provisioning workflow.',
    },
    { status: 410 },
  )
}
