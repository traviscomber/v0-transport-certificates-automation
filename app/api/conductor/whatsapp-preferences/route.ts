import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function POST(request: NextRequest) {
  try {
    // Get conductor_id from cookies (set by login)
    const cookieStore = await cookies()
    const conductorId = cookieStore.get('conductor_id')?.value

    if (!conductorId) {
      return NextResponse.json(
        { error: 'Unauthorized - conductor not authenticated' },
        { status: 401 }
      )
    }

    const { whatsapp_phone } = await request.json()

    if (!whatsapp_phone) {
      return NextResponse.json(
        { error: 'WhatsApp phone number required' },
        { status: 400 }
      )
    }

    // Validate phone format
    const phoneRegex = /^\+56\d{9}$/
    if (!phoneRegex.test(whatsapp_phone)) {
      return NextResponse.json(
        { error: 'Invalid phone format. Use +56XXXXXXXXX' },
        { status: 400 }
      )
    }

    // TODO: Once conductores table has whatsapp_phone and whatsapp_notifications_enabled columns,
    // uncomment the code below to persist preferences to database
    // For now, just acknowledge the save request
    
    return NextResponse.json(
      { 
        success: true,
        message: 'WhatsApp preferences acknowledged',
        phone: whatsapp_phone
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('[v0] Error in whatsapp-preferences endpoint:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    // Get conductor_id from cookies (set by login)
    const cookieStore = await cookies()
    const conductorId = cookieStore.get('conductor_id')?.value

    if (!conductorId) {
      return NextResponse.json(
        { error: 'Unauthorized - conductor not authenticated' },
        { status: 401 }
      )
    }

    // TODO: Once conductores table has whatsapp_phone and whatsapp_notifications_enabled columns,
    // fetch and return the actual preferences from the database
    // For now, return default/empty preferences
    
    return NextResponse.json(
      {
        whatsapp_phone: null,
        notifications_enabled: false
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('[v0] Error in whatsapp-preferences GET:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}
