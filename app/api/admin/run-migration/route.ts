import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

export async function POST(request: Request) {
  try {
    const adminClient = createClient(supabaseUrl!, supabaseServiceKey!)

    // Add rejection_reason column to uploaded_documents if it doesn't exist
    const { data, error } = await adminClient
      .from('uploaded_documents')
      .select('id')
      .limit(1)

    if (error) {
      console.error('[v0] Error checking table:', error)
      return Response.json({ error: error.message }, { status: 500 })
    }

    // Try to add the column using raw SQL through Supabase
    const migrationSQL = `
      ALTER TABLE uploaded_documents
      ADD COLUMN IF NOT EXISTS rejection_reason TEXT;
    `

    console.log('[v0] Migration SQL:', migrationSQL)

    // Supabase doesn't support arbitrary SQL execution through the JS client
    // We need to use the REST API directly
    const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${supabaseServiceKey}`,
        'apikey': supabaseServiceKey!,
      },
      body: JSON.stringify({ sql: migrationSQL })
    })

    if (!response.ok) {
      const errorData = await response.text()
      console.error('[v0] Migration failed:', errorData)
      return Response.json(
        { 
          error: 'Migration failed. rejection_reason column may already exist or database connection issue.',
          details: errorData 
        }, 
        { status: 500 }
      )
    }

    const result = await response.json()
    console.log('[v0] Migration result:', result)

    return Response.json({ 
      success: true, 
      message: 'Migration completed. rejection_reason column added to uploaded_documents table.' 
    })
  } catch (error) {
    console.error('[v0] Error:', error)
    return Response.json(
      { 
        error: error instanceof Error ? error.message : 'Unknown error',
        message: 'The rejection_reason column may already exist in the database.'
      }, 
      { status: 500 }
    )
  }
}
