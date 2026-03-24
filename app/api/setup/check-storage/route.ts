import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

export async function GET() {
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    
    // List buckets to check if 'documents' exists
    const { data: buckets, error } = await supabase.storage.listBuckets()

    if (error) {
      return NextResponse.json({ 
        exists: false, 
        message: `Error al verificar storage: ${error.message}` 
      })
    }

    const documentsBucket = buckets?.find(b => b.name === 'documents')
    
    return NextResponse.json({ 
      exists: !!documentsBucket, 
      message: documentsBucket ? 'Bucket "documents" existe' : 'Bucket "documents" no existe',
      buckets: buckets?.map(b => b.name) || []
    })
  } catch (error) {
    return NextResponse.json({ 
      exists: false, 
      message: `Error: ${error}` 
    }, { status: 500 })
  }
}
