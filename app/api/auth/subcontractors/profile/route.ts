import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'transportista-secret-key'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('transportista_token')?.value

    if (!token) {
      return NextResponse.json(
        { error: 'No token provided' },
        { status: 401 }
      )
    }

    // Verify token
    let decoded: any
    try {
      decoded = jwt.verify(token, JWT_SECRET)
    } catch (error) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      )
    }

    const supabase = createAdminClient()

    // Get transportista details
    const { data: transportista, error } = await supabase
      .from('transportistas')
      .select('id, rut, razon_social, nombre_fantasia')
      .eq('id', decoded.transportista_id)
      .single()

    if (error || !transportista) {
      return NextResponse.json(
        { error: 'Transportista not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      transportista: {
        id: transportista.id,
        rut: transportista.rut,
        nombre: transportista.razon_social || transportista.nombre_fantasia,
      },
    })

  } catch (error) {
    console.error('[v0] Error in profile endpoint:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
