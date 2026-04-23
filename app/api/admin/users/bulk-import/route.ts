export const dynamic = 'force-dynamic'

import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

interface BulkUser {
  full_name: string
  email: string
  phone: string
  rut: string
  role: 'admin_company' | 'dispatcher' | 'driver'
  is_active?: boolean
}

interface ImportResult {
  created: number
  errors: Array<{ email: string; error: string }>
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.log('[v0] Bulk import started by user:', user.id)

    const body = await request.json()
    const { users } = body as { users: BulkUser[] }

    if (!Array.isArray(users) || users.length === 0) {
      return NextResponse.json({ error: 'Invalid users array' }, { status: 400 })
    }

    console.log('[v0] Processing', users.length, 'users for bulk import')

    const adminClient = createAdminClient()
    const result: ImportResult = { created: 0, errors: [] }

    for (const userData of users) {
      try {
        // Validate required fields
        if (!userData.full_name || !userData.email || !userData.phone || !userData.rut) {
          throw new Error('Missing required fields')
        }

        console.log('[v0] Creating user:', userData.email)

        // Create auth user with temporary password
        const tempPassword = Math.random().toString(36).slice(-12)

        const { data: authUser, error: createError } = await adminClient.auth.admin.createUser({
          email: userData.email.toLowerCase(),
          password: tempPassword,
          email_confirm: true,
        })

        if (createError || !authUser.user) {
          throw new Error(createError?.message || 'Failed to create auth user')
        }

        console.log('[v0] Auth user created:', authUser.user.id)

        // Create profile
        const { data: newProfile, error: profileError } = await adminClient
          .from('profiles')
          .insert({
            id: authUser.user.id,
            email: userData.email.toLowerCase(),
            full_name: userData.full_name,
            role: userData.role || 'admin_company',
            phone: userData.phone,
            rut: userData.rut,
            is_active: userData.is_active !== false,
          })
          .select()
          .single()

        if (profileError) {
          console.error('[v0] Profile creation error for', userData.email, profileError)
          // Clean up auth user if profile creation fails
          await adminClient.auth.admin.deleteUser(authUser.user.id)
          throw profileError
        }

        console.log('[v0] User created successfully:', userData.email)
        result.created++
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : 'Unknown error'
        console.error('[v0] Error creating user', userData.email, ':', errorMsg)
        result.errors.push({
          email: userData.email,
          error: errorMsg,
        })
      }
    }

    console.log('[v0] Bulk import completed:', result)

    return NextResponse.json({
      success: true,
      created: result.created,
      errors: result.errors,
      message: `${result.created} usuarios creados${result.errors.length > 0 ? `, ${result.errors.length} errores` : ''}`,
    })
  } catch (error) {
    console.error('[v0] Bulk import error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Error en importación masiva' },
      { status: 500 }
    )
  }
}
