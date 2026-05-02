import { createClient } from '@supabase/supabase-js'

export async function POST(request: Request) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !supabaseServiceKey) {
      return Response.json(
        { error: 'Missing Supabase credentials' },
        { status: 500 }
      )
    }

    const adminClient = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })

    console.log('[v0] Adding rejection_reason column to uploaded_documents...')

    // Execute raw SQL using the Postgres function
    const { data, error } = await adminClient.rpc('exec_sql', {
      sql: `
        BEGIN;
        ALTER TABLE uploaded_documents 
        ADD COLUMN IF NOT EXISTS rejection_reason TEXT NULL;
        COMMIT;
      `,
    })

    if (error) {
      console.log('[v0] RPC method failed, error:', error)
      
      // Try alternative: direct SQL via Postgres
      try {
        const response = await fetch(`${supabaseUrl}/rest/v1/`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${supabaseServiceKey}`,
            'Content-Type': 'application/json',
            'Prefer': 'return=minimal',
          },
          body: JSON.stringify({
            query: `ALTER TABLE uploaded_documents ADD COLUMN IF NOT EXISTS rejection_reason TEXT;`,
          }),
        })

        if (!response.ok) {
          throw new Error(`REST API failed: ${response.statusText}`)
        }

        console.log('[v0] Column added via REST API')
        return Response.json({
          success: true,
          message: 'rejection_reason column added successfully',
        })
      } catch (restError: any) {
        console.log('[v0] REST API also failed:', restError.message)
        
        // If both methods fail, return instructions
        return Response.json({
          success: false,
          message: 'Could not add column programmatically',
          instruction:
            'Please add the column manually in Supabase Dashboard: ALTER TABLE uploaded_documents ADD COLUMN rejection_reason TEXT NULL;',
        })
      }
    }

    console.log('[v0] Column added successfully via RPC')
    return Response.json({
      success: true,
      message: 'rejection_reason column added successfully',
      data,
    })
  } catch (err: any) {
    console.error('[v0] Error in migration endpoint:', err)
    return Response.json(
      { error: err.message || 'Unknown error occurred' },
      { status: 500 }
    )
  }
}
