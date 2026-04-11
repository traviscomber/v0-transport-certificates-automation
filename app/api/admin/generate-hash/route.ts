export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import bcryptjs from 'bcryptjs'

export async function GET() {
  try {
    const password = 'labbe2024'
    console.log('[v0] Generating bcrypt hash for password:', password)
    
    const hash = await bcryptjs.hash(password, 10)
    console.log('[v0] Generated hash:', hash)
    console.log('[v0] Hash length:', hash.length)
    
    // Verify the hash works
    const isValid = await bcryptjs.compare(password, hash)
    console.log('[v0] Hash verification:', isValid)
    
    return NextResponse.json({
      success: true,
      password,
      hash,
      hash_length: hash.length,
      verification: isValid,
      message: 'Use this hash in your database'
    })
  } catch (error) {
    console.error('[v0] Error generating hash:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
