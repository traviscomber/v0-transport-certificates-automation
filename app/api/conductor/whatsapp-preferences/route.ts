import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(request: NextRequest) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json(
        { error: 'Supabase configuration missing' },
        { status: 500 }
      )
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    const { whatsapp_phone } = await request.json()

    if (!whatsapp_phone) {
      return NextResponse.json(
        { error: 'WhatsApp phone number required' },
        { status: 400 }
      )
    }

    // Get auth header to identify conductor
    const authHeader = request.headers.get('authorization')
    if (!authHeader) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
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

    // Update conductor with WhatsApp phone
    const { error: updateError } = await supabase
      .from('conductores')
      .update({ 
        whatsapp_phone,
        whatsapp_notifications_enabled: true
      })
      .eq('user_id', user.id)

    if (updateError) {
      console.error('[v0] Error updating WhatsApp phone:', updateError)
      return NextResponse.json(
        { error: 'Error updating WhatsApp preferences' },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { 
        success: true,
        message: 'WhatsApp preferences saved',
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
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json(
        { error: 'Supabase configuration missing' },
        { status: 500 }
      )
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Get auth header to identify conductor
    const authHeader = request.headers.get('authorization')
    if (!authHeader) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get conductor preferences
    const { data: conductor, error: fetchError } = await supabase
      .from('conductores')
      .select('whatsapp_phone, whatsapp_notifications_enabled')
      .eq('user_id', user.id)
      .single()

    if (fetchError) {
      console.error('[v0] Error fetching WhatsApp preferences:', fetchError)
      return NextResponse.json(
        { error: 'Error fetching preferences' },
        { status: 400 }
      )
    }

    return NextResponse.json(
      {
        whatsapp_phone: conductor?.whatsapp_phone || null,
        notifications_enabled: conductor?.whatsapp_notifications_enabled || false
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
