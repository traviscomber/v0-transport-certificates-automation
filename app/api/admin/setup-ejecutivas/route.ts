import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export async function POST() {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Create Daniela user
    const { data: danielaData, error: danielaError } = await supabase.auth.admin.createUser({
      email: 'dsilva@labbe.cl',
      password: 'labbe2246',
      email_confirm: true
    })

    if (danielaError) {
      console.error('[v0] Error creating Daniela:', danielaError)
    } else {
      console.log('[v0] Created Daniela with ID:', danielaData.user.id)
    }

    // Create Olga user
    const { data: olgaData, error: olgaError } = await supabase.auth.admin.createUser({
      email: 'olga@labbe.cl',
      password: 'labbe2222',
      email_confirm: true
    })

    if (olgaError) {
      console.error('[v0] Error creating Olga:', olgaError)
    } else {
      console.log('[v0] Created Olga with ID:', olgaData.user.id)
    }

    // Now assign TRANSPORTES SAN LORENZO to Daniela
    if (danielaData?.user?.id) {
      const { error: assignError } = await supabase
        .from('transportistas')
        .update({ ejecutivo_asignado: danielaData.user.id })
        .eq('rut', '78302429-2')

      if (assignError) {
        console.error('[v0] Error assigning company:', assignError)
        return NextResponse.json(
          { error: 'Failed to assign company', details: assignError },
          { status: 500 }
        )
      }

      return NextResponse.json({
        success: true,
        message: 'Daniela and Olga created, TRANSPORTES SAN LORENZO assigned to Daniela',
        daniela_id: danielaData.user.id,
        olga_id: olgaData.user.id
      })
    }

    return NextResponse.json(
      { error: 'Failed to create users' },
      { status: 500 }
    )
  } catch (error) {
    console.error('[v0] Setup error:', error)
    return NextResponse.json(
      { error: 'Setup failed', details: String(error) },
      { status: 500 }
    )
  }
}
