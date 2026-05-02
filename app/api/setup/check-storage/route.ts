import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    // Validate environment variables
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return NextResponse.json(
        { error: 'Supabase configuration missing' },
        { status: 500 }
      )
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY,
      {
        auth: { persistSession: false }
      }
    )
    
    // Try to access the bucket directly - this will succeed if it exists
    const { data, error } = await supabase.storage.from('documents').list('', { limit: 1 })
    
    // If we get an error that's NOT "bucket not found", the bucket exists
    // If we get data (even empty), the bucket exists
    if (error) {
      // Check if it's a "not found" error
      if (error.message.includes('not found') || error.message.includes('does not exist')) {
        return NextResponse.json({ 
          exists: false, 
          message: 'Bucket "documents" no existe'
        })
      }
      // Any other error means the bucket exists but there might be permission issues
      return NextResponse.json({ 
        exists: true, 
        message: 'Bucket "documents" existe (verificado)'
      })
    }

    return NextResponse.json({ 
      exists: true, 
      message: 'Bucket "documents" existe y es accesible'
    })
  } catch (error) {
    return NextResponse.json({ 
      exists: false, 
      message: `Error verificando storage` 
    }, { status: 500 })
  }
}
