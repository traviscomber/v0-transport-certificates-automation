export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'

const executives = [
  { email: 'olga@labbe.cl', password: 'labbe2024' },
  { email: 'carolina@labbe.cl', password: 'labbe2024' },
  { email: 'daniela@labbe.cl', password: 'labbe2024' },
  { email: 'cecilia@labbe.cl', password: 'labbe2024' },
  { email: 'diego@labbe.cl', password: 'labbe2024' },
  { email: 'katherinne@labbe.cl', password: 'labbe2024' },
]

export async function GET() {
  try {
    console.log('[v0] Starting user sync to auth.users')
    
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Missing Supabase credentials')
    }

    const results = []

    for (const exec of executives) {
      try {
        console.log(`[v0] Syncing user: ${exec.email}`)

        // Use Supabase Admin API to create user
        const response = await fetch(`${supabaseUrl}/auth/v1/admin/users`, {
          method: 'POST',
          headers: {
            'apikey': supabaseServiceKey,
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${supabaseServiceKey}`,
          },
          body: JSON.stringify({
            email: exec.email,
            password: exec.password,
            email_confirm: true,
            user_metadata: {
              company: 'Transportes Labbe',
            },
          }),
        })

        const data = await response.json()

        if (!response.ok) {
          console.error(`[v0] Error for ${exec.email}:`, data)
          
          // If user already exists, that's ok
          if (data.error_code === 'user_already_exists' || data.message?.includes('already exists')) {
            results.push({
              email: exec.email,
              status: 'already_exists',
              message: 'User already in auth.users',
            })
          } else {
            results.push({
              email: exec.email,
              status: 'error',
              message: data.message || 'Unknown error',
            })
          }
          continue
        }

        console.log(`[v0] User synced successfully: ${exec.email}`)
        results.push({
          email: exec.email,
          status: 'success',
          user_id: data.user?.id,
        })
      } catch (err) {
        console.error(`[v0] Exception for ${exec.email}:`, err)
        results.push({
          email: exec.email,
          status: 'error',
          message: err instanceof Error ? err.message : 'Unknown error',
        })
      }
    }

    const successCount = results.filter((r) => r.status === 'success').length
    const existCount = results.filter((r) => r.status === 'already_exists').length

    return NextResponse.json({
      success: true,
      message: `Synced ${successCount} users (${existCount} already existed)`,
      results,
    })
  } catch (error) {
    console.error('[v0] Sync error:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
