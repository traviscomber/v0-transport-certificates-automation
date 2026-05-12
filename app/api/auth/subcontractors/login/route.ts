import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'transportista-secret-key'

export async function POST(request: NextRequest) {
  try {
    const { rut, password } = await request.json()

    if (!rut || !password) {
      return NextResponse.json(
        { error: 'RUT y contraseña son requeridos' },
        { status: 400 }
      )
    }

    const supabase = createAdminClient()

    // Find auth record
    const { data: authRecord, error: authError } = await supabase
      .from('transportista_auth')
      .select('id, rut, password_hash, is_active, transportista_id')
      .eq('rut', rut)
      .single()

    if (authError || !authRecord) {
      console.warn('[v0] Auth record not found for RUT:', rut)
      return NextResponse.json(
        { error: 'RUT o contraseña incorrectos' },
        { status: 401 }
      )
    }

    if (!authRecord.is_active) {
      return NextResponse.json(
        { error: 'Esta cuenta no está activa' },
        { status: 403 }
      )
    }

    // Verify password
    const passwordMatch = await bcrypt.compare(password, authRecord.password_hash)

    if (!passwordMatch) {
      console.warn('[v0] Password mismatch for RUT:', rut)
      return NextResponse.json(
        { error: 'RUT o contraseña incorrectos' },
        { status: 401 }
      )
    }

    // Get transportista details
    const { data: transportista, error: transpError } = await supabase
      .from('transportistas')
      .select('id, rut, razon_social, nombre_fantasia')
      .eq('id', authRecord.transportista_id)
      .single()

    if (transpError || !transportista) {
      console.error('[v0] Error fetching transportista:', transpError)
      return NextResponse.json(
        { error: 'Error al cargar datos de la empresa' },
        { status: 500 }
      )
    }

    // Create JWT token
    const token = jwt.sign(
      {
        rut: authRecord.rut,
        transportista_id: transportista.id,
        tipo: 'subcontratista',
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    )

    // Update last_login
    await supabase
      .from('transportista_auth')
      .update({ last_login: new Date().toISOString() })
      .eq('id', authRecord.id)

    // Create response with secure HTTP-only cookie
    const response = NextResponse.json({
      success: true,
      message: 'Login exitoso',
      transportista: {
        id: transportista.id,
        rut: transportista.rut,
        nombre: transportista.razon_social || transportista.nombre_fantasia,
      },
    })

    // Set HTTP-only cookie
    response.cookies.set({
      name: 'transportista_token',
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 86400, // 24 hours
      path: '/',
    })

    console.log('[v0] Subcontractor login successful:', rut)

    return response

  } catch (error) {
    console.error('[v0] Error in login endpoint:', error)
    return NextResponse.json(
      { error: 'Error al procesar el login' },
      { status: 500 }
    )
  }
}
