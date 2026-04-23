import { createAdminClient } from '@/lib/supabase/admin'
import { NextRequest, NextResponse } from 'next/server'
import { randomUUID } from 'crypto'

export async function POST(request: NextRequest) {
  try {
    console.log('[v0] Creating users from team data')

    const body = await request.json()
    const { users } = body

    if (!Array.isArray(users) || users.length === 0) {
      return NextResponse.json({ error: 'Invalid users array' }, { status: 400 })
    }

    const adminClient = createAdminClient()
    const created = []
    const errors = []

    // Simply insert into profiles without any complex validations
    for (const userData of users) {
      try {
        if (!userData.full_name || !userData.rut) {
          throw new Error('Missing full_name or rut')
        }

        const email = userData.email || `${userData.rut.replace(/[^0-9]/g, '')}@labbe.local`
        const rut = userData.rut.trim()
        const id = randomUUID() // Generate UUID for the profile

        console.log('[v0] Creating user:', rut, 'with ID:', id)

        // Direct insert with UUID
        const { data, error } = await adminClient
          .from('profiles')
          .insert({
            id: id,
            email: email,
            full_name: userData.full_name,
            role: 'admin',
            rut: rut,
            phone: userData.phone || '',
            is_active: true,
          })
          .select()
          .single()

        if (error) {
          console.error('[v0] Error for', rut, ':', error.message)
          errors.push({ rut, error: error.message })
        } else {
          console.log('[v0] User created:', rut)
          created.push(rut)
        }
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Unknown error'
        console.error('[v0] Error:', msg)
        errors.push({ rut: userData.rut, error: msg })
      }
    }

    console.log('[v0] Done. Created:', created.length, 'Errors:', errors.length)

    return NextResponse.json({
      success: errors.length === 0,
      created: created.length,
      errors: errors,
      message: `Created ${created.length} users${errors.length > 0 ? `, ${errors.length} errors` : ''}`
    })
  } catch (err) {
    console.error('[v0] Error:', err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Failed' },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json({ message: 'POST users array to create profiles' })
}
