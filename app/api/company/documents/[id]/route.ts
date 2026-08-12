import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { requireServerActor } from '@/lib/auth/server-actor'

interface RouteParams {
  params: {
    id: string
  }
}

export async function GET(_request: NextRequest, { params }: RouteParams) {
  const auth = await requireServerActor()
  if (!auth.actor) {
    return NextResponse.json({ error: auth.error }, { status: auth.status })
  }

  try {
    const adminClient = createAdminClient()

    const { data: document, error } = await adminClient
      .from('documents')
      .select('*')
      .eq('id', params.id)
      .single()

    if (error || !document) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 })
    }

    return NextResponse.json(document)
  } catch (error) {
    console.error('[company] Error getting document:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Error fetching document' },
      { status: 500 },
    )
  }
}

export async function DELETE() {
  return NextResponse.json(
    {
      error: 'Gone',
      message: 'Direct document deletion is disabled. Use the controlled document lifecycle instead.',
    },
    { status: 410 },
  )
}
