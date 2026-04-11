export const dynamic = 'force-dynamic'

import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const executives = [
  {
    email: 'olga@transporteslabbe.cl',
    full_name: 'Olga Lydia Carrasco Olivares',
    password: 'labbe2024'
  },
  {
    email: 'carolina@transporteslabbe.cl',
    full_name: 'Carolina Sepulveda',
    password: 'labbe2024'
  },
  {
    email: 'daniela@transporteslabbe.cl',
    full_name: 'Daniela Silva',
    password: 'labbe2024'
  },
  {
    email: 'cecilia@transporteslabbe.cl',
    full_name: 'Cecilia Farias',
    password: 'labbe2024'
  },
  {
    email: 'diego@transporteslabbe.cl',
    full_name: 'Diego Gonzalez',
    password: 'labbe2024'
  },
  {
    email: 'katherinne@transporteslabbe.cl',
    full_name: 'Katherinne Canales',
    password: 'labbe2024'
  }
]

export async function GET() {
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })

    const results = []

    for (const exec of executives) {
      try {
        console.log(`[v0] Creating user: ${exec.email}`)

        // Create auth user
        const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
          email: exec.email,
          password: exec.password,
          email_confirm: true,
        })

        if (authError) {
          console.error(`[v0] Auth error for ${exec.email}:`, authError)
          results.push({
            email: exec.email,
            status: 'error',
            message: authError.message,
          })
          continue
        }

        console.log(`[v0] Auth user created: ${authUser.user.id}`)

        // Create profile
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            id: authUser.user.id,
            email: exec.email,
            full_name: exec.full_name,
            role: 'executive',
            company_name: 'Transportes Labbe',
            is_active: true,
          })

        if (profileError) {
          console.error(`[v0] Profile error for ${exec.email}:`, profileError)
          results.push({
            email: exec.email,
            status: 'error',
            message: profileError.message,
          })
          continue
        }

        console.log(`[v0] Profile created for: ${exec.email}`)
        results.push({
          email: exec.email,
          name: exec.full_name,
          status: 'success',
        })
      } catch (err) {
        console.error(`[v0] Error processing ${exec.email}:`, err)
        results.push({
          email: exec.email,
          status: 'error',
          message: err instanceof Error ? err.message : 'Unknown error',
        })
      }
    }

    return NextResponse.json({
      success: true,
      message: `Created ${results.filter((r) => r.status === 'success').length} executives`,
      results,
    })
  } catch (error) {
    console.error('[v0] Seed error:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
