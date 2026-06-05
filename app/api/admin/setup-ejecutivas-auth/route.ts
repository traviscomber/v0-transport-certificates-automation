import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export const dynamic = 'force-dynamic'

/**
 * Creates Supabase Auth users for the 4 real ejecutivas
 * so they can login at /auth/login with email + password.
 * 
 * Passwords follow the pattern: labbe + last 4 digits of RUT (without verifier)
 * Example: RUT 10574005-0 -> password: labbe4005
 */
const EJECUTIVAS_AUTH = [
  {
    email: 'olga.carrasco@labbe.cl',
    full_name: 'Olga Lydia Carrasco Olivares',
    rut: '10574005-0',
    password: 'labbe4005',
  },
  {
    email: 'carolina.sepulveda@labbe.cl',
    full_name: 'Carolina Pilar Sepulveda Contreras',
    rut: '15464094-0',
    password: 'labbe4094',
  },
  {
    email: 'daniela.silva@labbe.cl',
    full_name: 'Daniela Constanza Silva Rojas',
    rut: '17768246-2',
    password: 'labbe8246',
  },
  {
    email: 'jayala@labbe.cl',
    full_name: 'Javiera Ayala Rodriguez',
    rut: '18450987-1',
    password: 'labbe0987',
  },
]

export async function POST() {
  try {
    const supabase = createAdminClient()
    const results: any[] = []

    for (const exec of EJECUTIVAS_AUTH) {
      // Check if user already exists in Supabase Auth
      const { data: existingUsers } = await supabase.auth.admin.listUsers()
      const existing = existingUsers?.users?.find(
        u => u.email?.toLowerCase() === exec.email.toLowerCase()
      )

      if (existing) {
        // User exists - update password to make sure it's correct
        const { error: updateError } = await supabase.auth.admin.updateUserById(
          existing.id,
          {
            password: exec.password,
            user_metadata: {
              full_name: exec.full_name,
              role: 'ejecutiva',
              rut: exec.rut,
            },
            email_confirm: true,
          }
        )

        results.push({
          email: exec.email,
          full_name: exec.full_name,
          password: exec.password,
          status: updateError ? 'update_error' : 'updated',
          error: updateError?.message,
        })
        continue
      }

      // Create new Supabase Auth user
      const { data, error } = await supabase.auth.admin.createUser({
        email: exec.email,
        password: exec.password,
        email_confirm: true,
        user_metadata: {
          full_name: exec.full_name,
          role: 'ejecutiva',
          rut: exec.rut,
        },
      })

      results.push({
        email: exec.email,
        full_name: exec.full_name,
        password: exec.password,
        status: error ? 'error' : 'created',
        error: error?.message,
        user_id: data?.user?.id,
      })
    }

    // Also create/update profiles entries for each ejecutiva
    for (const exec of EJECUTIVAS_AUTH) {
      // Get the auth user ID
      const { data: authUsers } = await supabase.auth.admin.listUsers()
      const authUser = authUsers?.users?.find(
        u => u.email?.toLowerCase() === exec.email.toLowerCase()
      )

      if (authUser) {
        // Get the executive_staff record for transportista_id
        const { data: execStaff } = await supabase
          .from('executive_staff')
          .select('id, transportista_id')
          .eq('email', exec.email)
          .single()

        // Upsert profile
        await supabase.from('profiles').upsert(
          {
            id: authUser.id,
            email: exec.email,
            full_name: exec.full_name,
            role: 'ejecutiva',
            organization_id: execStaff?.transportista_id || null,
          },
          { onConflict: 'id' }
        )
      }
    }

    const created = results.filter(r => r.status === 'created').length
    const updated = results.filter(r => r.status === 'updated').length
    const errors = results.filter(r => r.status === 'error' || r.status === 'update_error').length

    return NextResponse.json({
      success: true,
      message: `Ejecutivas auth: ${created} created, ${updated} updated, ${errors} errors`,
      credentials: results.map(r => ({
        email: r.email,
        password: r.password,
        full_name: r.full_name,
        status: r.status,
        error: r.error,
      })),
    })
  } catch (error) {
    console.error('[v0] Error setting up ejecutivas auth:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Error setting up auth' },
      { status: 500 }
    )
  }
}
