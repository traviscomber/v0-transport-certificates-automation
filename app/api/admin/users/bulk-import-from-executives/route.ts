export const dynamic = 'force-dynamic'

import { createAdminClient } from '@/lib/supabase/admin'
import { NextRequest, NextResponse } from 'next/server'
import { randomUUID } from 'crypto'

interface BulkUser {
  full_name: string
  email: string
  phone: string
  rut: string
  role: 'admin'
  is_active?: boolean
  id?: string
}

interface ImportResult {
  created: number
  errors: Array<{ email: string; error: string }>
}

// GET - Fetch users from executive_staff table to prepare for import
export async function GET(request: NextRequest) {
  try {
    console.log('[v0] GET /api/admin/users/bulk-import-from-executives - Starting')
    
    const adminClient = createAdminClient()
    
    console.log('[v0] Querying executive_staff table...')
    const { data: executives, error } = await adminClient
      .from('executive_staff')
      .select('*')
      .limit(10)

    if (error) {
      console.error('[v0] Error fetching executives:', error.message)
      return NextResponse.json(
        { 
          error: `Failed to fetch executives: ${error.message}`,
          code: error.code,
        },
        { status: 500 }
      )
    }

    console.log('[v0] Found', executives?.length, 'executives')

    if (!executives || executives.length === 0) {
      return NextResponse.json({ 
        success: true, 
        users: [],
        message: 'No executives found'
      })
    }

    // Transform to BulkUser format
    const bulkUsers: BulkUser[] = executives.map((exec: any) => {
      const fullName = exec.full_name || exec.nombre_completo || 'Unknown'
      
      // Generate email: first letter + last name @labbe.cl
      let email = ''
      if (fullName !== 'Unknown') {
        const nameParts = fullName.trim().split(/\s+/)
        if (nameParts.length >= 2) {
          const firstName = nameParts[0].toLowerCase()
          const lastName = nameParts[nameParts.length - 1].toLowerCase()
          const lastNameClean = lastName
            .replace(/á/g, 'a').replace(/é/g, 'e').replace(/í/g, 'i')
            .replace(/ó/g, 'o').replace(/ú/g, 'u').replace(/ñ/g, 'n')
          email = `${firstName.charAt(0)}${lastNameClean}@labbe.cl`
        }
      }
      
      if (!email) {
        email = exec.email_auth || exec.email || ''
      }
      
      return {
        full_name: fullName,
        email: email,
        phone: exec.phone || exec.telefono || '',
        rut: exec.rut || '',
        role: 'admin',
        is_active: exec.login_enabled !== false,
      }
    })

    return NextResponse.json({ 
      success: true, 
      users: bulkUsers,
      message: `Loaded ${bulkUsers.length} executives`
    })
  } catch (error) {
    console.error('[v0] Unexpected error in GET:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unexpected error'
    
    return NextResponse.json(
      { error: errorMessage },
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
      console.error('[v0] Invalid users array')
      return NextResponse.json({ error: 'Invalid users array' }, { status: 400 })
    }

    console.log('[v0] Importing', users.length, 'users')

    const adminClient = createAdminClient()
    const result: ImportResult = { created: 0, errors: [] }

    // Create auth users and profiles in the database
    for (const userData of users) {
      try {
        if (!userData.full_name || !userData.email || !userData.rut) {
          throw new Error('Missing required fields: full_name, email, and rut')
        }

        const email = userData.email.toLowerCase().trim()
        const rut = userData.rut.trim()
        
        // Password is just the RUT (e.g., "78.376.780-5")
        const password = rut
        
        console.log('[v0] Processing user:', email, 'with RUT:', rut)

        // Step 1: Create auth user
        console.log('[v0] Creating auth user with email:', email)
        let authUserId = randomUUID()
        
        const { data: authData, error: authError } = await adminClient.auth.admin.createUser({
          email: email,
          password: password,
          user_metadata: {
            rut: rut,
            full_name: userData.full_name,
          },
          email_confirm: true, // Auto-confirm email so they can login immediately
        })

        if (authError) {
          console.warn('[v0] Auth user creation issue:', authError.message)
          // Continue - we'll still create the profile even if auth user creation has issues
        } else if (authData?.user?.id) {
          authUserId = authData.user.id
          console.log('[v0] Auth user created with ID:', authUserId)
        }

        // Step 2: Create profile
        console.log('[v0] Creating profile for:', email, 'with auth user ID:', authUserId)
        const { data, error } = await adminClient
          .from('profiles')
          .insert({
            id: authUserId,
            email: email,
            full_name: userData.full_name,
            role: 'admin',
            phone: userData.phone || '',
            rut: rut,
            is_active: true,
            company_id: 'labbe', // Assign to Transportes Labbe company
          })
          .select()
          .single()

        if (error) {
          console.error('[v0] Error creating profile for', email, ':', error.message)
          
          // Try updating if duplicate
          if (error.message.includes('duplicate') || error.message.includes('already exists')) {
            console.log('[v0] Profile exists, updating...')
            const { error: updateError } = await adminClient
              .from('profiles')
              .update({
                full_name: userData.full_name,
                phone: userData.phone || '',
                rut: rut,
                role: 'admin',
                is_active: true,
                company_id: 'labbe',
              })
              .eq('email', email)
            
            if (!updateError) {
              result.created++
              console.log('[v0] Profile updated successfully')
              continue
            }
          }
          
          result.errors.push({
            email: email,
            error: error.message
          })
          continue
        }

        console.log('[v0] Profile created successfully for:', email)
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

    console.log('[v0] Import complete: created=' + result.created + ', errors=' + result.errors.length)

    return NextResponse.json({
      success: result.errors.length === 0,
      result: result,
      message: `Successfully created ${result.created} users${result.errors.length > 0 ? `, ${result.errors.length} errors` : ''}`
    })
  } catch (err) {
    console.error('[v0] POST error:', err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Import failed' },
      { status: 500 }
    )
  }
}
