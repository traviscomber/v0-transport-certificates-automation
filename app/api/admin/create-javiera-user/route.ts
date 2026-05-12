import { createAdminClient } from '@/lib/supabase/admin'
import { NextResponse } from 'next/server'

/**
 * ADMIN ENDPOINT: Creates Javiera Ayala user in Supabase Auth
 * This should only be called once to set up the new executive user
 */
export async function POST(request: Request) {
  try {
    const adminClient = createAdminClient()

    // Create user in Supabase Auth
    const { data, error } = await adminClient.auth.admin.createUser({
      email: 'jayala@labbe.cl',
      password: 'labbe3145', // formula: 'labbe' + last 4 RUT digits (18450987-1 → 3145)
      email_confirm: true,
      user_metadata: {
        full_name: 'Javiera Ayala Rodríguez',
        rut: '18450987-1',
        cargo: 'Ejecutiva',
        phone: '+56987654321',
      },
    })

    if (error) {
      console.error('[v0] Error creating user:', error)
      return NextResponse.json(
        { error: error.message, details: error },
        { status: 400 }
      )
    }

    console.log('[v0] Created Javiera user:', data.user.id)

    return NextResponse.json({
      success: true,
      message: 'Javiera Ayala user created successfully',
      user: {
        id: data.user.id,
        email: data.user.email,
        metadata: data.user.user_metadata,
      },
    })
  } catch (error) {
    console.error('[v0] Admin endpoint error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
