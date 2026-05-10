import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { cookies } from 'next/headers'

export async function POST(request: NextRequest) {
  try {
    const { email, rut, password } = await request.json()

    if (!email || !rut || !password) {
      return NextResponse.json(
        { error: 'Email, RUT y contraseña son requeridos' },
        { status: 400 }
      )
    }

    // Only allow @labbe.cl emails
    if (!email.toLowerCase().endsWith('@labbe.cl')) {
      return NextResponse.json(
        { error: 'Solo usuarios @labbe.cl pueden acceder' },
        { status: 401 }
      )
    }

    const supabase = await createClient()

    // Query executive_staff table for matching executive
    const { data: executive, error: queryError } = await supabase
      .from('executive_staff')
      .select('id, full_name, email_auth, password_hash, login_enabled, rut')
      .eq('email_auth', email)
      .eq('rut', rut)
      .eq('login_enabled', true)
      .single()

    if (queryError || !executive) {
      return NextResponse.json(
        { error: 'Email, RUT o contraseña incorrectos' },
        { status: 401 }
      )
    }

    // Verify password (simple hash comparison - in production use bcrypt)
    const hashedPassword = crypto.createHash('sha256').update(password).digest('hex')
    if (hashedPassword !== executive.password_hash) {
      return NextResponse.json(
        { error: 'Email, RUT o contraseña incorrectos' },
        { status: 401 }
      )
    }

    // Update last login time
    await supabase
      .from('executive_staff')
      .update({ last_login: new Date().toISOString() })
      .eq('id', executive.id)

    // Create session object
    const session = {
      id: executive.id,
      email: executive.email_auth,
      full_name: executive.full_name,
      rut: executive.rut,
      role: 'ejecutiva',
      created_at: new Date().toISOString(),
    }

    // Set cookies for verifyAuth middleware
    const cookieStore = await cookies()
    
    // Set httpOnly cookies for security
    cookieStore.set('user_email', email, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    })

    cookieStore.set('user_role', session.role, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    })

    cookieStore.set('user_id', executive.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    })

    console.log('[v0] Executive login successful and cookies set for:', email)

    return NextResponse.json(
      {
        success: true,
        message: 'Autenticación exitosa',
        session,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('[v0] Executive login error:', error)
    return NextResponse.json(
      { error: 'Error en el servidor' },
      { status: 500 }
    )
  }
}
