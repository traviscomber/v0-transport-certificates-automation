import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json(
        { error: 'Missing Supabase credentials' },
        { status: 500 }
      )
    }

    // Create Javiera Ayala in profiles table
    const newExecutive = {
      email: 'jayala@labbe.cl',
      full_name: 'Javiera Ayala Rodríguez',
      role: 'executive',
      rut: '18450987-1',
      phone: '+56987654321',
      organization_id: 'labbe-transportes',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    console.log('[v0] Creating Javiera Ayala in profiles table...')

    // First check if she already exists
    const checkResponse = await fetch(
      `${supabaseUrl}/rest/v1/profiles?email=eq.jayala@labbe.cl&select=*`,
      {
        headers: {
          apikey: supabaseServiceKey,
          Authorization: `Bearer ${supabaseServiceKey}`,
        },
      }
    )

    const existingProfiles = await checkResponse.json()

    if (existingProfiles && existingProfiles.length > 0) {
      console.log('[v0] Javiera Ayala already exists in profiles')
      return NextResponse.json({
        success: true,
        message: 'Javiera Ayala already exists',
        user: existingProfiles[0],
      })
    }

    // Insert into profiles table
    const insertResponse = await fetch(
      `${supabaseUrl}/rest/v1/profiles`,
      {
        method: 'POST',
        headers: {
          apikey: supabaseServiceKey,
          Authorization: `Bearer ${supabaseServiceKey}`,
          'Content-Type': 'application/json',
          Prefer: 'return=representation',
        },
        body: JSON.stringify(newExecutive),
      }
    )

    if (!insertResponse.ok) {
      const error = await insertResponse.json()
      console.error('[v0] Error inserting Javiera:', error)
      return NextResponse.json(
        { error: error.message || 'Failed to create user' },
        { status: 400 }
      )
    }

    const result = await insertResponse.json()
    console.log('[v0] Successfully created Javiera Ayala:', result)

    return NextResponse.json({
      success: true,
      message: 'Javiera Ayala created successfully',
      user: result[0] || result,
    })
  } catch (error: any) {
    console.error('[v0] Error creating user:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
