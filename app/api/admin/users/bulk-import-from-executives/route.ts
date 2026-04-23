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

// GET - Fetch users from executive_staff table to prepare for import
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.log('[v0] Fetching executive_staff for bulk import preparation')

    // Use admin client to fetch from executive_staff table
    const adminClient = createAdminClient()
    const { data: executives, error } = await adminClient
      .from('executive_staff')
      .select('id, nombre_completo, rut, email, telefono, cargo, is_active')
      .eq('is_active', true)
      .order('nombre_completo', { ascending: true })

    if (error) {
      console.error('[v0] Error fetching executives:', error)
      throw error
    }

    console.log('[v0] Found', executives?.length, 'active executives')

    // Transform to BulkUser format
    const bulkUsers: BulkUser[] = (executives || []).map(exec => ({
      full_name: exec.nombre_completo,
      email: exec.email,
      phone: exec.telefono,
      rut: exec.rut,
      role: 'admin_company',
      is_active: true,
    }))

    return NextResponse.json({ 
      success: true, 
      users: bulkUsers,
      message: `Loaded ${bulkUsers.length} executives from Transportes Labbe`
    })
  } catch (error) {
    console.error('[v0] Error in GET executive_staff:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Error fetching executives' },
      { status: 500 }
    )
  }
}

// POST - Import users (accepts array of BulkUser)
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    console.log('[v0] Bulk import - Current user:', user?.id)

    if (!user) {
      console.warn('[v0] Bulk import - No authenticated user found')
    }

    const body = await request.json()
    const { users } = body as { users: BulkUser[] }

    if (!Array.isArray(users) || users.length === 0) {
      console.error('[v0] Invalid users array received')
      return NextResponse.json({ error: 'Invalid users array' }, { status: 400 })
    }

    console.log('[v0] Processing', users.length, 'users for bulk import')

    const adminClient = createAdminClient()
    const result: ImportResult = { created: 0, errors: [] }

    for (const userData of users) {
      try {
        // Validate required fields
        if (!userData.full_name || !userData.email || !userData.phone || !userData.rut) {
          throw new Error('Missing required fields: ' + JSON.stringify(userData))
        }

        console.log('[v0] Creating user:', userData.email)

        // Create auth user with temporary password
        const tempPassword = Math.random().toString(36).slice(-12)

        const { data: authUser, error: createError } = await adminClient.auth.admin.createUser({
          email: userData.email.toLowerCase().trim(),
          password: tempPassword,
          email_confirm: true,
        })

        if (createError) {
          console.error('[v0] Auth creation error for', userData.email, ':', createError)
          result.errors.push({
            email: userData.email,
            error: createError.message || 'Failed to create auth user'
          })
          continue
        }

        if (!authUser.user) {
          throw new Error('No auth user returned')
        }

        console.log('[v0] Auth user created:', authUser.user.id)

        // Create profile
        const { data: newProfile, error: profileError } = await adminClient
          .from('profiles')
          .insert({
            id: authUser.user.id,
            email: userData.email.toLowerCase().trim(),
            full_name: userData.full_name,
            role: userData.role || 'admin_company',
            phone: userData.phone,
            rut: userData.rut,
            is_active: userData.is_active !== false,
          })
          .select()
          .single()

        if (profileError) {
          console.error('[v0] Profile creation error:', profileError)
          result.errors.push({
            email: userData.email,
            error: profileError.message || 'Failed to create profile'
          })
          // Clean up auth user if profile creation fails
          await adminClient.auth.admin.deleteUser(authUser.user.id)
          continue
        }

        console.log('[v0] User created successfully:', authUser.user.id)
        result.created++
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Unknown error'
        console.error('[v0] Error processing user:', errorMsg)
        result.errors.push({
          email: userData.email,
          error: errorMsg
        })
      }
    }

    console.log('[v0] Bulk import complete:', result)

    return NextResponse.json({
      success: true,
      result,
      message: `Successfully created ${result.created} users${result.errors.length > 0 ? `, ${result.errors.length} errors` : ''}`
    })
  } catch (error) {
    console.error('[v0] Error in bulk import POST:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Error processing bulk import' },
      { status: 500 }
    )
  }
}
