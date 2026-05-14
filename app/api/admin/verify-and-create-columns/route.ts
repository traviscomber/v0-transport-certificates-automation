import { createAdminClient } from '@/lib/supabase/admin'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function POST() {
  try {
    const supabase = createAdminClient()

    // Check if assigned_executive_id column exists in transportistas
    const { data: transportistas, error: checkError } = await supabase
      .from('transportistas')
      .select('assigned_executive_id')
      .limit(1)

    if (checkError && checkError.message.includes('assigned_executive_id')) {
      // Column doesn't exist, try to create it
      console.log('[v0] Column assigned_executive_id not found, attempting to create...')
      
      const { data: result, error: createError } = await supabase.rpc('exec', {
        query: `
          ALTER TABLE transportistas 
          ADD COLUMN IF NOT EXISTS assigned_executive_id UUID 
          REFERENCES executive_staff(id) ON DELETE SET NULL;
        `
      })

      if (createError) {
        return NextResponse.json({
          success: false,
          status: 'Column creation failed via RPC',
          error: createError.message,
          instruction: 'Please run this SQL manually in Supabase SQL Editor: ALTER TABLE transportistas ADD COLUMN IF NOT EXISTS assigned_executive_id UUID REFERENCES executive_staff(id) ON DELETE SET NULL;'
        })
      }

      return NextResponse.json({
        success: true,
        status: 'Column created successfully',
        message: 'assigned_executive_id column added to transportistas table'
      })
    }

    if (checkError) {
      return NextResponse.json({
        success: false,
        status: 'Error checking column',
        error: checkError.message
      })
    }

    return NextResponse.json({
      success: true,
      status: 'Column already exists',
      message: 'assigned_executive_id column is present in transportistas table'
    })
  } catch (error: any) {
    console.error('[v0] Error in verify-and-create-columns:', error)
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Internal server error',
        instruction: 'Please run this SQL manually in Supabase SQL Editor: ALTER TABLE transportistas ADD COLUMN IF NOT EXISTS assigned_executive_id UUID REFERENCES executive_staff(id) ON DELETE SET NULL;'
      },
      { status: 500 }
    )
  }
}
