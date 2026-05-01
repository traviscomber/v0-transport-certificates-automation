import { createAdminClient } from '@/lib/supabase/admin'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'
export const revalidate = 0

// The 6 real Labbe executives — their core data
const EJECUTIVAS_LABBE = [
  { rut: '10574005-0', nombre: 'Olga Carrasco' },
  { rut: '15464094-0', nombre: 'Carolina Sepúlveda' },
  { rut: '17768246-2', nombre: 'Daniela Silva' },
  { rut: '9888992-2',  nombre: 'Cecilia Farias' },
  { rut: '20114106-0', nombre: 'Diego González' },
  { rut: '18717311-6', nombre: 'Katherinne Canales' },
]

export async function GET() {
  try {
    const adminClient = await createAdminClient()

    // Get all ejecutivas from profiles table with their email addresses
    const { data: profiles, error: profilesError } = await adminClient
      .from('profiles')
      .select('id, rut, email, full_name')
      .eq('role', 'ejecutiva')

    if (profilesError) {
      console.error('[v0] Error fetching ejecutivas from DB:', profilesError)
      return NextResponse.json({ error: profilesError.message }, { status: 500 })
    }

    // Merge DB data with hardcoded ejecutivas info
    const ejecutivasWithEmail = EJECUTIVAS_LABBE.map(exec => {
      const profile = profiles?.find(p => p.rut === exec.rut)
      return {
        id: profile?.id,
        rut: exec.rut,
        nombre: exec.nombre,
        email: profile?.email || `${exec.nombre.toLowerCase().replace(/\s+/g, '.')}@labbe.cl`,
        full_name: profile?.full_name || exec.nombre,
      }
    }).filter(e => e.email)

    console.log('[v0] Fetched', ejecutivasWithEmail.length, 'ejecutivas with email')

    return NextResponse.json(
      { success: true, ejecutivas: ejecutivasWithEmail },
      { headers: { 'Cache-Control': 'no-cache, no-store, must-revalidate' } }
    )
  } catch (error) {
    console.error('[v0] Unexpected error in executives endpoint:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
