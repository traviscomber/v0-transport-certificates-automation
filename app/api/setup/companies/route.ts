import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

export async function POST() {
  try {
    // Use service role key for admin operations
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Execute raw SQL to create companies table
    const { data, error } = await supabase.rpc('exec', {
      sql: `
        CREATE TABLE IF NOT EXISTS public.companies (
          id TEXT PRIMARY KEY,
          rut TEXT UNIQUE NOT NULL,
          name TEXT NOT NULL,
          representative TEXT,
          email TEXT,
          phone TEXT,
          address TEXT,
          region TEXT,
          password_hash TEXT NOT NULL,
          is_labbe_admin BOOLEAN DEFAULT false,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        
        CREATE INDEX IF NOT EXISTS idx_companies_rut ON public.companies(rut);
        CREATE INDEX IF NOT EXISTS idx_companies_email ON public.companies(email);
        CREATE INDEX IF NOT EXISTS idx_companies_labbe_admin ON public.companies(is_labbe_admin);
      `
    })

    if (error) throw error

    return Response.json({ 
      success: true, 
      message: 'Companies table created successfully'
    })
  } catch (err) {
    console.error('[v0] Setup error:', err)
    return Response.json(
      { error: err instanceof Error ? err.message : 'Setup failed' },
      { status: 500 }
    )
  }
}
