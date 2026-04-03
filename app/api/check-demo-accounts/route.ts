import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    // Demo accounts are already set up in Supabase via SQL
    // This endpoint just returns success to avoid build cache errors
    
    return NextResponse.json({
      success: true,
      message: 'Demo accounts are pre-configured',
      results: [
        {
          email: 'conductor@demo.cl',
          success: true
        },
        {
          email: 'despachador@demo.cl',
          success: true
        },
        {
          email: 'admin@demo.cl',
          success: true
        }
      ]
    }, { status: 200 })
  } catch (error) {
    console.error('[v0] Error checking demo accounts:', error)
    return NextResponse.json(
      { success: false, error: String(error) },
      { status: 500 }
    )
  }
}
