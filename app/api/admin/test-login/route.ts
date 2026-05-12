import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import bcrypt from 'bcryptjs'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const rut = searchParams.get('rut')
    const testPassword = searchParams.get('password')

    if (!rut || !testPassword) {
      return NextResponse.json({
        error: 'Se requieren rut y password como parámetros',
        example: '/api/admin/test-login?rut=77653071-9&password=labbe3071',
      })
    }

    const supabase = createAdminClient()

    // Get the auth record
    const { data: auth, error: authError } = await supabase
      .from('transportista_auth')
      .select('rut, password_hash')
      .eq('rut', rut)
      .single()

    if (authError || !auth) {
      return NextResponse.json({
        error: 'RUT not found in database',
        rut,
      })
    }

    // Test password match
    const passwordMatch = await bcrypt.compare(testPassword, auth.password_hash)

    return NextResponse.json({
      rut,
      password_provided: testPassword,
      hash_in_database: auth.password_hash,
      password_matches: passwordMatch,
      result: passwordMatch ? 'SUCCESS - Password is correct' : 'FAILED - Password does not match',
    })
  } catch (error) {
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Unknown error',
    })
  }
}
