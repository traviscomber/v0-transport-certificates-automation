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
    // Note: Don't check auth here - the page is already protected by middleware
    console.log('[v0] GET /api/admin/users/bulk-import-from-executives - Fetching executive_staff')

    // Use admin client to bypass RLS entirely
    const adminClient = createAdminClient()
    
    const { data: executives, error } = await adminClient
      .from('executive_staff')
      .select('id, full_name, rut, email_auth, phone, cargo, login_enabled')
      .order('full_name', { ascending: true })

    if (error) {
      console.error('[v0] Error fetching executives from executive_staff:', error)
      return NextResponse.json(
        { 
          error: `Failed to fetch executives: ${error.message}`,
          details: error
        },
        { status: 500 }
      )
    }

    console.log('[v0] Found', executives?.length, 'executives in executive_staff table')

    if (!executives || executives.length === 0) {
      console.log('[v0] No executives found in database')
      return NextResponse.json({ 
        success: true, 
        users: [],
        message: 'No executives found in the system'
      })
    }

    // Transform to BulkUser format
    const bulkUsers: BulkUser[] = executives.map(exec => {
      console.log('[v0] Processing executive:', exec.full_name, 'email:', exec.email_auth)
      return {
        full_name: exec.full_name,
        email: exec.email_auth,
        phone: exec.phone || '',
        rut: exec.rut || '',
        role: 'admin_company',
        is_active: exec.login_enabled !== false,
      }
    })

    console.log('[v0] Returning', bulkUsers.length, 'users in BulkUser format')

    return NextResponse.json({ 
      success: true, 
      users: bulkUsers,
      message: `Loaded ${bulkUsers.length} executives from Transportes Labbe`
    })
  } catch (error) {
    console.error('[v0] Unexpected error in GET:', error)
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Unexpected error',
        details: String(error)
      },
      { status: 500 }
    )
  }
}

// POST - Import users (accepts array of BulkUser)
export async function POST(request: NextRequest) {
  try {
    console.log('[v0] POST /api/admin/users/bulk-import-from-executives - Starting import')

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
        if (!userData.full_name || !userData.email) {
          throw new Error('Missing required fields: full_name and email')
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

        console.log('[v0] Auth user created:', authUser.user.id, 'for', userData.email)

        // Create profile
        const { data: newProfile, error: profileError } = await adminClient
          .from('profiles')
          .insert({
            id: authUser.user.id,
            email: userData.email.toLowerCase().trim(),
            full_name: userData.full_name,
            role: userData.role || 'admin_company',
            phone: userData.phone || '',
            rut: userData.rut || '',
            is_active: userData.is_active !== false,
          })
          .select()
          .single()

        if (profileError) {
          console.error('[v0] Profile creation error for', userData.email, ':', profileError)
          result.errors.push({
            email: userData.email,
            error: profileError.message || 'Failed to create profile'
          })
          // Clean up auth user if profile creation fails
          await adminClient.auth.admin.deleteUser(authUser.user.id)
          continue
        }

        console.log('[v0] Profile created successfully:', authUser.user.id)
        result.created++
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Unknown error'
        console.error('[v0] Error processing user', userData.email, ':', errorMsg)
        result.errors.push({
          email: userData.email,
          error: errorMsg
        })
      }
    }

    console.log('[v0] Bulk import complete - Created:', result.created, 'Errors:', result.errors.length)

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
