import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const cookieStore = await cookies()
    const companyId = cookieStore.get('company_id')?.value

    console.log('[v0] Current company_id from cookies:', companyId)

    return NextResponse.json({
      company_id: companyId || null
    })
  } catch (error) {
    console.error('[v0] Error getting company_id:', error)
    return NextResponse.json(
      { error: 'Failed to get company_id' },
      { status: 500 }
    )
  }
}
