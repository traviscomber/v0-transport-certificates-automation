import { createAdminClient } from '@/lib/supabase/admin'
import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

// This endpoint creates auth users using a different approach
export async function POST(request: NextRequest) {
  try {
    console.log('[v0] POST /api/admin/create-executives-auth - Creating auth users')

    const body = await request.json()
    const { executives } = body as { 
      executives: Array<{ email: string; full_name: string }>
    }

    if (!Array.isArray(executives) || executives.length === 0) {
      return NextResponse.json({ error: 'No executives provided' }, { status: 400 })
    }

    const adminClient = createAdminClient()
    const results = []

    for (const exec of executives) {
      try {
        const email = exec.email.toLowerCase().trim()
        console.log('[v0] Creating auth user for:', email)

        // Create auth user with temporary password
        const tempPassword = Math.random().toString(36).slice(-12) + 'Aa1!'

        const { data, error } = await adminClient.auth.admin.createUser({
          email: email,
          password: tempPassword,
          email_confirm: true,
          user_metadata: {
            full_name: exec.full_name,
          }
        })

        if (error) {
          console.error('[v0] Error creating auth user:', error.message)
          results.push({
            email,
            success: false,
            error: error.message,
            user_id: null
          })
        } else {
          console.log('[v0] Auth user created:', data.user?.id)
          results.push({
            email,
            success: true,
            error: null,
            user_id: data.user?.id
          })
        }
      } catch (err) {
        const errMsg = err instanceof Error ? err.message : 'Unknown error'
        console.error('[v0] Exception creating user:', errMsg)
        results.push({
          email: exec.email,
          success: false,
          error: errMsg,
          user_id: null
        })
      }
    }

    const successful = results.filter(r => r.success).length
    const failed = results.filter(r => !r.success).length

    console.log('[v0] Auth users creation complete:', { successful, failed })

    return NextResponse.json({
      success: true,
      results,
      summary: { successful, failed }
    })
  } catch (error) {
    console.error('[v0] Error in auth creation:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
