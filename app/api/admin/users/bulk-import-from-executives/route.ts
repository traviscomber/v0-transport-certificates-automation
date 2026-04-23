export const dynamic = 'force-dynamic'

import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { randomUUID } from 'crypto'

interface BulkUser {
  full_name: string
  email: string
  phone: string
  rut: string
  role: 'admin' | 'dispatcher' | 'driver' | 'mandante' | 'transportista'
  is_active?: boolean
  id?: string  // Optional: user ID from auth.users if pre-created
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
      const fullName = exec.full_name || exec.nombre_completo || 'Unknown'
      
      // Generate email: first letter of first name + last name in lowercase @labbe.cl
      // e.g., "Olga Lydia Carrasco Olivares" -> "ocarrasco@labbe.cl"
      let email = ''
      if (fullName !== 'Unknown') {
        const nameParts = fullName.trim().split(/\s+/)
        if (nameParts.length >= 2) {
          const firstName = nameParts[0].toLowerCase()
          const lastName = nameParts[nameParts.length - 1].toLowerCase()
          // Remove accents from lastName if present
          const lastNameClean = lastName
            .replace(/á/g, 'a')
            .replace(/é/g, 'e')
            .replace(/í/g, 'i')
            .replace(/ó/g, 'o')
            .replace(/ú/g, 'u')
            .replace(/ñ/g, 'n')
          email = `${firstName.charAt(0)}${lastNameClean}@labbe.cl`
        }
      }
      
      // Fallback if email couldn't be generated
      if (!email) {
        email = exec.email_auth || exec.email || ''
        email = email.replace('@transporteslabbe.cl', '@labbe.cl')
      }
      
      console.log('[v0] Processing executive:', {
        full_name: fullName,
        generated_email: email,
      })
      
      return {
        full_name: fullName,
        email: email,
        phone: exec.phone || exec.telefono || '',
        rut: exec.rut || '',
        role: 'admin',
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
    const { users, company_id } = body as { users: BulkUser[], company_id?: string }

    if (!Array.isArray(users) || users.length === 0) {
      console.error('[v0] Invalid users array received')
      return NextResponse.json({ error: 'Invalid users array' }, { status: 400 })
    }

    console.log('[v0] Processing', users.length, 'users for bulk import')
    console.log('[v0] Using company_id from request:', company_id)

    const adminClient = createAdminClient()
    const result: ImportResult = { created: 0, errors: [] }

    // Use company_id from request, or fall back to looking it up
    let companyId = company_id
    
    if (!companyId) {
      console.log('[v0] No company_id provided, fetching Transportes Labbe company ID')
      const { data: companies, error: companyError } = await adminClient
        .from('organizations')
        .select('id')
        .eq('name', 'Transportes Labbe')
        .single()

      if (companyError || !companies) {
        console.warn('[v0] Could not find Transportes Labbe company, using null for company_id')
      }

      companyId = companies?.id || null
    }
    
    console.log('[v0] Final company_id to use:', companyId)

    for (const userData of users) {
      try {
        // Validate required fields
        if (!userData.full_name || !userData.email) {
          throw new Error('Missing required fields: full_name and email')
        }

        const email = userData.email.toLowerCase().trim()
        console.log('[v0] Processing user:', email)

        // Use provided ID if available (from pre-created auth users), otherwise use UUID
        const userId = userData.id || randomUUID()
        console.log('[v0] Using user ID:', userId, '- from auth:', !!userData.id)

        // Insert into profiles table with the user ID
        console.log('[v0] Inserting into profiles table for', email)
        
        // Build insert object
        const insertData: any = {
          id: userId,
          email: email,
          full_name: userData.full_name,
          role: 'admin',
          phone: userData.phone || '',
          rut: userData.rut || '',
          is_active: userData.is_active !== false,
        }
        
        // Try with organization_id first if companyId exists
        if (companyId) {
          insertData.organization_id = companyId
          console.log('[v0] Including organization_id:', companyId)
        }
        
        let profileError: any = null
        let newProfile: any = null
        
        // Try the insert
        const insertResult = await adminClient
          .from('profiles')
          .insert(insertData)
          .select()
          .single()
        
        profileError = insertResult.error
        newProfile = insertResult.data
        
        // If error is about organization_id column not existing, try without it
        if (profileError && profileError.message && profileError.message.includes('organization_id')) {
          console.log('[v0] organization_id column not found, retrying without it')
          delete insertData.organization_id
          
          const retryResult = await adminClient
            .from('profiles')
            .insert(insertData)
            .select()
            .single()
          
          profileError = retryResult.error
          newProfile = retryResult.data
        }

        if (profileError) {
          console.error('[v0] Profile insert error for', email, ':', {
            code: profileError.code,
            message: profileError.message,
            details: (profileError as any).details,
            hint: (profileError as any).hint,
          })
          result.errors.push({
            email: email,
            error: `${profileError.code}: ${profileError.message}`
          })
          continue
        }

        console.log('[v0] Profile created successfully for', email, 'with ID:', newProfile?.id)
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
