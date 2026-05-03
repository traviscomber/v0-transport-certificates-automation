export const dynamic = 'force-dynamic'

import bcryptjs from 'bcryptjs'
import { NextResponse } from 'next/server'

const password = 'labbe2024'

export async function GET() {
  try {
    console.log('[v0] Generating bcrypt hashes...')
    
    // Generate hash with bcryptjs (works server-side)
    const hash = await bcryptjs.hash(password, 10)
    
    console.log('[v0] Generated hash:', hash)
    console.log('[v0] Hash length:', hash.length)
    
    // Verify the hash works
    const isValid = await bcryptjs.compare(password, hash)
    console.log('[v0] Hash verification result:', isValid)
    
    if (hash.length !== 60) {
      console.warn('[v0] WARNING: Hash length is', hash.length, 'but should be 60')
    }

    // Create SQL with escaped hash
    const sqlUpdateAll = `UPDATE public.executive_staff SET password_hash = '${hash}';`
    const sqlVerify = `SELECT rut, full_name, LENGTH(password_hash) as hash_length FROM public.executive_staff ORDER BY full_name;`

    return NextResponse.json({
      password,
      hash,
      hash_length: hash.length,
      hash_valid: isValid,
      sql_update: sqlUpdateAll,
      sql_verify: sqlVerify,
      instructions: [
        '1. Copy the SQL from sql_update field',
        '2. Paste into Supabase SQL Editor',
        '3. Run the query',
        '4. Then run the sql_verify query to confirm all hashes are 60 characters',
        '5. Try logging in with RUT: 14156425-1 and password: labbe2024'
      ]
    })
  } catch (error) {
    console.error('[v0] Hash generation error:', error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Failed to generate hash',
      },
      { status: 500 }
    )
  }
}
