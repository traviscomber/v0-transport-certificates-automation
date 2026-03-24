import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

export async function GET() {
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { persistSession: false }
    })
    
    // Use storage API to list buckets
    const { data: buckets, error } = await supabase.storage.listBuckets()
    
    console.log('[v0] listBuckets result:', { buckets, error })

    if (error) {
      return NextResponse.json({ 
        exists: false, 
        message: `Error al verificar storage: ${error.message}`,
        debug: error
      })
    }

    const documentsBucket = buckets?.find(b => b.name === 'documents')
    
    console.log('[v0] documentsBucket:', documentsBucket)
    
    return NextResponse.json({ 
      exists: !!documentsBucket, 
      message: documentsBucket ? 'Bucket "documents" existe' : 'Bucket "documents" no existe',
      allBuckets: buckets?.map(b => b.name) || []
    })
  } catch (error) {
    console.log('[v0] check-storage error:', error)
    return NextResponse.json({ 
      exists: false, 
      message: `Error: ${error}` 
    }, { status: 500 })
  }
}
