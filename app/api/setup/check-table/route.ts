import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

export async function GET(request: NextRequest) {
  const table = request.nextUrl.searchParams.get('table')
  
  if (!table) {
    return NextResponse.json({ error: 'Table name required' }, { status: 400 })
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    
    // Try to select from the table
    const { data, error } = await supabase
      .from(table)
      .select('*')
      .limit(1)

    if (error) {
      // Check if it's a "relation does not exist" error
      if (error.message.includes('does not exist') || error.code === '42P01') {
        return NextResponse.json({ 
          exists: false, 
          message: `Tabla "${table}" no existe` 
        })
      }
      // Other errors (like RLS) mean the table exists
      return NextResponse.json({ 
        exists: true, 
        message: `Tabla "${table}" existe (${error.message})` 
      })
    }

    const count = data?.length || 0
    return NextResponse.json({ 
      exists: true, 
      message: `Tabla "${table}" OK (${count} registros)` 
    })
  } catch (error) {
    return NextResponse.json({ 
      exists: false, 
      message: `Error: ${error}` 
    }, { status: 500 })
  }
}
