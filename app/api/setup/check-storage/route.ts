import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

export async function GET() {
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    
    // Check bucket using direct SQL query (more reliable)
    const { data, error } = await supabase
      .from('buckets')
      .select('id, name')
      .eq('id', 'documents')
      .schema('storage')
      .maybeSingle()

    if (error) {
      // Fallback: try listBuckets API
      const { data: buckets, error: listError } = await supabase.storage.listBuckets()
      
      if (listError) {
        return NextResponse.json({ 
          exists: false, 
          message: `Error al verificar storage: ${listError.message}` 
        })
      }
      
      const documentsBucket = buckets?.find(b => b.name === 'documents')
      return NextResponse.json({ 
        exists: !!documentsBucket, 
        message: documentsBucket ? 'Bucket "documents" existe' : 'Bucket "documents" no existe'
      })
    }

    return NextResponse.json({ 
      exists: !!data, 
      message: data ? 'Bucket "documents" existe' : 'Bucket "documents" no existe'
    })
  } catch (error) {
    return NextResponse.json({ 
      exists: false, 
      message: `Error: ${error}` 
    }, { status: 500 })
  }
}
