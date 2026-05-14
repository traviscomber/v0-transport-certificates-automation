import { createAdminClient } from '@/lib/supabase/admin'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function POST() {
  try {
    const supabase = createAdminClient()

    // Delete Dandús executive
    const { error } = await supabase
      .from('executive_staff')
      .delete()
      .eq('email', 'dandus@labbe.cl')

    if (error) {
      throw error
    }

    return NextResponse.json({
      success: true,
      message: 'Dandús ejecutiva eliminada correctamente',
    })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to delete' },
      { status: 500 }
    )
  }
}
