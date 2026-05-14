import { createAdminClient } from '@/lib/supabase/admin'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function POST() {
  try {
    const supabase = createAdminClient()

    // Check if column already exists
    const { data: columns, error: colError } = await supabase
      .rpc('get_table_columns', { table_name: 'transportistas' })

    const hasColumn = columns?.some((col: any) => col.column_name === 'assigned_executive_id')

    if (hasColumn) {
      return NextResponse.json({
        success: true,
        message: 'Column already exists',
        column_status: 'exists',
      })
    }

    // Add the column using raw SQL
    const { data, error } = await supabase.rpc('exec', {
      sql: `
        ALTER TABLE transportistas 
        ADD COLUMN IF NOT EXISTS assigned_executive_id UUID 
        REFERENCES executive_staff(id) ON DELETE SET NULL;
      `,
    })

    if (error) {
      return NextResponse.json({
        success: false,
        error: error.message || 'Could not add column',
        instruction: 'Please run this SQL in Supabase SQL Editor: ALTER TABLE transportistas ADD COLUMN IF NOT EXISTS assigned_executive_id UUID REFERENCES executive_staff(id) ON DELETE SET NULL;',
      })
    }

    return NextResponse.json({
      success: true,
      message: 'Column added successfully',
      column_status: 'created',
    })
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message || 'Error adding column',
      instruction: 'Please run this SQL in Supabase SQL Editor: ALTER TABLE transportistas ADD COLUMN IF NOT EXISTS assigned_executive_id UUID REFERENCES executive_staff(id) ON DELETE SET NULL;',
    })
  }
}
