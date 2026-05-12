import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import bcrypt from 'bcryptjs'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const rut = request.nextUrl.searchParams.get('rut') || '77653071-9'
    const password = request.nextUrl.searchParams.get('password') || 'labbe3071'

    console.log('[v0] Debug comparison - RUT:', rut, 'Password:', password)

    const supabase = createAdminClient()

    // Get the hash from database
    const { data: authRecord, error } = await supabase
      .from('transportista_auth')
      .select('rut, password_hash')
      .eq('rut', rut)
      .maybeSingle()

    if (error || !authRecord) {
      return NextResponse.json({
        error: 'RUT not found',
        rut,
        found: false,
      })
    }

    console.log('[v0] Found hash for RUT:', rut)
    console.log('[v0] Hash length:', authRecord.password_hash?.length)
    console.log('[v0] Hash starts with:', authRecord.password_hash?.substring(0, 10))

    // Compare password with hash
    const isMatch = await bcrypt.compare(password, authRecord.password_hash)

    console.log('[v0] Password match result:', isMatch)

    // Also test if the hash can be compared at all
    const testPassword = 'labbe3071'
    const testHash = await bcrypt.hash(testPassword, 10)
    const testMatch = await bcrypt.compare(testPassword, testHash)

    return NextResponse.json({
      rut,
      password,
      passwordHashFromDb: authRecord.password_hash,
      passwordMatch: isMatch,
      hashLength: authRecord.password_hash?.length,
      hashPrefix: authRecord.password_hash?.substring(0, 10),
      bcryptTest: {
        testPassword: 'labbe3071',
        testHash: testHash,
        testMatch: testMatch,
      },
    })

  } catch (error) {
    console.error('[v0] Debug error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
