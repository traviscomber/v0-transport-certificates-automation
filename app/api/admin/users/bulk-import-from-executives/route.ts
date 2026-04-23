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
    console.log('[v0] GET /api/admin/users/bulk-import-from-executives - Starting')
    
    // Log environment variables
    console.log('[v0] Env check:')
    console.log('[v0] - NEXT_PUBLIC_SUPABASE_URL exists:', !!process.env.NEXT_PUBLIC_SUPABASE_URL)
    console.log('[v0] - SUPABASE_SERVICE_ROLE_KEY exists:', !!process.env.SUPABASE_SERVICE_ROLE_KEY)
    console.log('[v0] - SUPABASE_SERVICE_ROLE_KEY length:', process.env.SUPABASE_SERVICE_ROLE_KEY?.length)
    console.log('[v0] - SUPABASE_URL exists:', !!process.env.SUPABASE_URL)

    // Use admin client to bypass RLS entirely
    console.log('[v0] Creating admin client...')
    const adminClient = createAdminClient()
    console.log('[v0] Admin client created successfully')
    
    console.log('[v0] Querying executive_staff table...')
    const { data: executives, error } = await adminClient
      .from('executive_staff')
      .select('*')
      .limit(10)

    console.log('[v0] Query completed')
    console.log('[v0] - Data returned:', executives?.length, 'records')
    console.log('[v0] - Error:', error ? `${error.code}: ${error.message}` : 'none')

    if (error) {
      console.error('[v0] Error details:', {
        code: error.code,
        message: error.message,
        status: (error as any).status,
      })
      return NextResponse.json(
        { 
          error: `Failed to fetch executives: ${error.message}`,
          code: error.code,
          details: String(error)
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

    // Transform to BulkUser format - use whatever fields exist
    const bulkUsers: BulkUser[] = executives.map((exec: any) => {
      console.log('[v0] Processing executive:', {
        full_name: exec.full_name,
        email: exec.email_auth || exec.email,
      })
      return {
        full_name: exec.full_name || exec.nombre_completo || 'Unknown',
        email: exec.email_auth || exec.email || '',
        phone: exec.phone || exec.telefono || '',
        rut: exec.rut || '',
        role: 'admin_company',
        is_active: exec.login_enabled !== false,
      }
    })

    console.log('[v0] Transformed to BulkUser format:', bulkUsers.length, 'users')

    return NextResponse.json({ 
      success: true, 
      users: bulkUsers,
      message: `Loaded ${bulkUsers.length} executives from Transportes Labbe`,
      debug: { 
        exec_count: executives.length,
        env_vars_available: {
          url: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
          service_key: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
        }
      }
    })
  } catch (error) {
    console.error('[v0] Unexpected error in GET:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unexpected error'
    const errorStack = error instanceof Error ? error.stack : undefined
    console.error('[v0] Error stack:', errorStack)
    
    return NextResponse.json(
      { 
        error: errorMessage,
        stack: errorStack
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
          console.error('[v0] Auth creation error for', userData.email, ':', {
            code: createError.code,
            message: createError.message,
            status: (createError as any).status,
          })
          result.errors.push({
            email: userData.email,
            error: createError.message || 'Failed to create auth user',
            code: createError.code
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
          console.error('[v0] Profile creation error for', userData.email, ':', {
            code: profileError.code,
            message: profileError.message,
            details: (profileError as any).details,
            hint: (profileError as any).hint,
          })
          result.errors.push({
            email: userData.email,
            error: profileError.message || 'Failed to create profile',
            code: profileError.code,
            details: (profileError as any).details
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
    if (result.errors.length > 0) {
      console.error('[v0] Import errors detail:', JSON.stringify(result.errors, null, 2))
    }

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
