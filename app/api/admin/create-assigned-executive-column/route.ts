import { createAdminClient } from '@/lib/supabase/admin'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function POST() {
  try {
    const supabase = createAdminClient()

    // First, let's check if the column already exists by trying to select it
    const { data, error } = await supabase
      .from('transportistas')
      .select('assigned_executive_id')
      .limit(1)

    // If error contains "column", it doesn't exist, so we need to add it
    if (error?.message?.includes('column') || error?.message?.includes('does not exist')) {
      // The column doesn't exist, we need to add it via SQL
      const { error: sqlError } = await supabase.rpc('execute_sql', {
        sql: `ALTER TABLE transportistas ADD COLUMN assigned_executive_id UUID REFERENCES executive_staff(id) ON DELETE SET NULL;`,
      })

      if (sqlError) {
        // If rpc doesn't exist, try direct SQL through auth
        // This is a fallback if the rpc function doesn't exist
        return NextResponse.json({
          success: false,
          message: 'Need to add assigned_executive_id column via Supabase UI or SQL editor',
          error: 'Cannot run migrations via API',
          instruction: 'Run this SQL in Supabase SQL Editor: ALTER TABLE transportistas ADD COLUMN assigned_executive_id UUID REFERENCES executive_staff(id) ON DELETE SET NULL;',
        })
      }

      return NextResponse.json({
        success: true,
        message: 'Column assigned_executive_id added to transportistas table',
      })
    } else if (!error) {
      return NextResponse.json({
        success: true,
        message: 'Column assigned_executive_id already exists',
      })
    } else {
      return NextResponse.json({
        success: false,
        error: error.message,
      })
    }
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to check/create column' },
      { status: 500 }
    )
  }
}
