export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    
    // Check if conductor_id cookie exists (set by login)
    const conductorId = cookieStore.get('conductor_id')?.value

    if (!conductorId) {
      return NextResponse.json(
        { message: 'Unauthorized - conductor not authenticated' },
        { status: 401 }
      )
    }

    // Get documents from the conductor's data
    // For now, return empty array as documents are managed through the upload endpoint
    // In a real app, this would query a database for documents belonging to this conductor
    const mockDocuments: Record<string, unknown>[] = []

    return NextResponse.json(mockDocuments, { status: 200 })

  } catch (error) {
    console.error('Fetch documents error:', error)
    return NextResponse.json(
      { message: 'Internal server error', error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
