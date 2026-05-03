export const dynamic = 'force-dynamic'

import { createAdminClient } from '@/lib/supabase/admin'
import { NextResponse } from 'next/server'

const executives = [
  {
    email: 'olga@transporteslabbe.cl',
    full_name: 'Olga Lydia Carrasco Olivares',
    password: 'labbe2024',
  },
  {
    email: 'carolina@transporteslabbe.cl',
    full_name: 'Carolina Sepulveda',
    password: 'labbe2024',
  },
  {
    email: 'daniela@transporteslabbe.cl',
    full_name: 'Daniela Silva',
    password: 'labbe2024',
  },
  {
    email: 'cecilia@transporteslabbe.cl',
    full_name: 'Cecilia Farias',
    password: 'labbe2024',
  },
  {
    email: 'diego@transporteslabbe.cl',
    full_name: 'Diego Gonzalez',
    password: 'labbe2024',
  },
  {
    email: 'katherinne@transporteslabbe.cl',
    full_name: 'Katherinne Canales',
    password: 'labbe2024',
  },
]

export async function GET() {
  try {
    console.log('[v0] ========== SEED LABBE USERS START ==========')

    let supabase
    try {
      supabase = createAdminClient()
    } catch (clientError) {
      console.error('[v0] Failed to create admin client:', clientError)
      return NextResponse.json(
        {
          success: false,
          error: clientError instanceof Error ? clientError.message : 'Failed to create Supabase admin client',
        },
        { status: 500 }
      )
    }

    const results = []

    for (const exec of executives) {
      try {
        console.log(`[v0] Creating user: ${exec.email}`)

        // Check if user already exists
        const { data: existingUser } = await supabase
          .from('profiles')
          .select('id')
          .eq('email', exec.email)
          .single()

        if (existingUser) {
          console.log(`[v0] User already exists: ${exec.email}`)
          results.push({
            email: exec.email,
            name: exec.full_name,
            status: 'already_exists',
          })
          continue
        }

        // Create auth user
        console.log(`[v0] Calling auth.admin.createUser for ${exec.email}`)
        const { data: authData, error: authError } = await supabase.auth.admin.createUser({
          email: exec.email,
          password: exec.password,
          email_confirm: true,
        })

        if (authError) {
          console.error(`[v0] Auth error for ${exec.email}:`, authError.code, authError.message)
          results.push({
            email: exec.email,
            status: 'error',
            message: `Auth error: ${authError.message}`,
          })
          continue
        }

        const userId = authData.user.id
        console.log(`[v0] Auth user created: ${userId}`)

        // Check if profile already exists
        const { data: existingProfile } = await supabase
          .from('profiles')
          .select('id')
          .eq('id', userId)
          .maybeSingle()

        if (existingProfile) {
          console.log(`[v0] Profile already exists for: ${exec.email}`)
          results.push({
            email: exec.email,
            name: exec.full_name,
            status: 'success',
            message: 'already_exists',
          })
          continue
        }

        // Create profile
        const { error: profileError } = await supabase.from('profiles').insert({
          id: userId,
          email: exec.email,
          full_name: exec.full_name,
          role: 'executive',
          company_name: 'Transportes Labbe',
          is_active: true,
        })

        if (profileError) {
          console.error(`[v0] Profile error for ${exec.email}:`, profileError.message)
          results.push({
            email: exec.email,
            status: 'error',
            message: `Profile error: ${profileError.message}`,
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

    const successCount = results.filter((r) => r.status === 'success').length
    const alreadyExistCount = results.filter((r) => r.status === 'already_exists').length

    console.log(`[v0] ========== SEED LABBE USERS COMPLETE ==========`)
    console.log(`[v0] Success: ${successCount}, Already exist: ${alreadyExistCount}`)

    return NextResponse.json({
      success: true,
      message: `Created ${successCount} executives (${alreadyExistCount} already existed)`,
      results,
    })
  } catch (error) {
    console.error('[v0] ========== SEED ERROR ==========')
    console.error('[v0] Seed error:', error)
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json(
      {
        success: false,
        error: message,
      },
      { status: 500 }
    )
  }
}
