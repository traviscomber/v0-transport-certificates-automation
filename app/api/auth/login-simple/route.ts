import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    console.log('[v0] Login endpoint - parsing request')

    const body = await request.json()
    const { rut, password } = body

    if (!rut) {
      return NextResponse.json(
        { error: 'RUT requerido' },
        { status: 400 }
      )
    }

    console.log('[v0] Login attempt with RUT:', rut)

    // Password should be the RUT itself
    if (password !== rut) {
      console.log('[v0] Password mismatch - expected RUT as password')
      return NextResponse.json(
        { error: 'RUT o contraseña incorrectos' },
        { status: 401 }
      )
    }

    // Look up the user by RUT in the profiles table
    const supabase = await createClient()
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id, email, full_name, rut, role, is_active')
      .eq('rut', rut)
      .single()

    if (profileError || !profile) {
      console.log('[v0] Profile not found for RUT:', rut)
      return NextResponse.json(
        { error: 'Usuario no encontrado' },
        { status: 401 }
      )
    }

    if (!profile.is_active) {
      console.log('[v0] User is inactive:', rut)
      return NextResponse.json(
        { error: 'Usuario desactivado' },
        { status: 401 }
      )
    }

    console.log('[v0] Login successful for RUT:', rut, 'Email:', profile.email)

    // Set session cookie
    try {
      const cookieStore = await cookies()
      cookieStore.set('company_id', 'labbe', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 604800, // 7 days
        path: '/',
      })
    } catch (cookieErr) {
      console.error('[v0] Failed to set cookie:', cookieErr)
    }

    return NextResponse.json({
      success: true,
      user: {
        id: profile.id,
        email: profile.email,
        full_name: profile.full_name,
        rut: profile.rut,
        role: profile.role,
      },
      company: {
        id: 'labbe',
        name: 'Transportes Labbe',
      }
    })
  } catch (err) {
    console.error('[v0] Login error:', err)
    return NextResponse.json(
      { error: 'Error al procesar login' },
      { status: 500 }
    )
  }
}
