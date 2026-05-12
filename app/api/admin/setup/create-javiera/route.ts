import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    // Security: Only allow if a secret key matches
    const authHeader = request.headers.get('authorization')
    if (authHeader !== 'Bearer setup-key-12345') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    )

    console.log('[v0] Creating Javiera Ayala user in Supabase Auth...')

    const { data, error } = await supabase.auth.admin.createUser({
      email: 'jayala@labbe.cl',
      password: 'labbe7321', // Standard: "labbe" + last 4 digits of RUT (18450987-1 → 7321)
      email_confirm: true,
      user_metadata: {
        full_name: 'Javiera Ayala Rodríguez',
        rut: '18450987-1',
        phone: '+56987654321',
        cargo: 'Ejecutiva',
        empresa: 'Transportes Labbe',
      },
    })

    if (error) {
      console.error('[v0] Error creating user:', error.message)
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      )
    }

    console.log('[v0] User created successfully:', data.user?.email)

    return NextResponse.json({
      success: true,
      message: 'Usuario Javiera Ayala creado exitosamente',
      user: {
        id: data.user?.id,
        email: data.user?.email,
        metadata: data.user?.user_metadata,
      },
    })
  } catch (error) {
    console.error('[v0] Error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Error creando usuario' },
      { status: 500 }
    )
  }
}
