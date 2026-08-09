import { createClient } from '@supabase/supabase-js'
import { requireServerActor } from '@/lib/auth/server-actor'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'
export const revalidate = 0

const EJECUTIVAS_LABBE = [
  { rut: '10574005-0', nombre: 'Olga Carrasco' },
  { rut: '15464094-0', nombre: 'Carolina Sepúlveda' },
  { rut: '17768246-2', nombre: 'Daniela Silva' },
  { rut: '18450987-1', nombre: 'Javiera Ayala' },
  { rut: '20114106-0', nombre: 'Diego González' },
  { rut: '18717311-6', nombre: 'Katherinne Canales' },
]

export async function GET() {
  try {
    const auth = await requireServerActor(['admin'])
    if (!auth.actor) {
      return NextResponse.json({ error: auth.error }, { status: auth.status })
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || '',
      process.env.SUPABASE_SERVICE_ROLE_KEY || ''
    )

    const { data: allProfiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, email, rut, role, created_at')
      .order('created_at', { ascending: true })
    if (profilesError) throw profilesError

    const seenRuts = new Set<string>()
    const profiles = (allProfiles || []).filter(p => {
      if (!p.rut || seenRuts.has(p.rut)) return false
      seenRuts.add(p.rut)
      return true
    })

    const [
      { count: totalConductores },
      { count: totalTransportistas },
      { count: totalDocumentos },
      { count: totalAlertas },
    ] = await Promise.all([
      supabase.from('conductores').select('id', { count: 'exact', head: true }),
      supabase.from('transportistas').select('id', { count: 'exact', head: true }),
      supabase.from('uploaded_documents').select('id', { count: 'exact', head: true }),
      supabase.from('alerts').select('id', { count: 'exact', head: true }),
    ])

    const { data: alertsRaw } = await supabase.from('alerts').select('user_id, priority, is_read')
    const alertsByUser: Record<string, { total: number; criticas: number; no_leidas: number }> = {}
    for (const a of alertsRaw || []) {
      if (!a.user_id) continue
      if (!alertsByUser[a.user_id]) alertsByUser[a.user_id] = { total: 0, criticas: 0, no_leidas: 0 }
      alertsByUser[a.user_id].total++
      if (a.priority === 'critical' || a.priority === 'high') alertsByUser[a.user_id].criticas++
      if (!a.is_read) alertsByUser[a.user_id].no_leidas++
    }

    const { data: docsRaw } = await supabase.from('uploaded_documents').select('transportista_id, validation_status, created_at')
    const docsByTransportista: Record<string, { total: number; aprobados: number; pendientes: number; vencidos: number }> = {}
    for (const d of docsRaw || []) {
      if (!d.transportista_id) continue
      if (!docsByTransportista[d.transportista_id]) docsByTransportista[d.transportista_id] = { total: 0, aprobados: 0, pendientes: 0, vencidos: 0 }
      docsByTransportista[d.transportista_id].total++
      if (d.validation_status === 'approved') docsByTransportista[d.transportista_id].aprobados++
      if (d.validation_status === 'pending') docsByTransportista[d.transportista_id].pendientes++
      if (d.validation_status === 'rejected' || d.validation_status === 'expired') docsByTransportista[d.transportista_id].vencidos++
    }

    const { data: conductoresRaw } = await supabase.from('conductores').select('transportista_id, is_active')
    const conductoresByTransportista: Record<string, { total: number; activos: number }> = {}
    for (const c of conductoresRaw || []) {
      if (!c.transportista_id) continue
      if (!conductoresByTransportista[c.transportista_id]) conductoresByTransportista[c.transportista_id] = { total: 0, activos: 0 }
      conductoresByTransportista[c.transportista_id].total++
      if (c.is_active) conductoresByTransportista[c.transportista_id].activos++
    }

    const { data: transportistasRaw } = await supabase
      .from('transportistas')
      .select('id, rut, razon_social, nombre_fantasia, is_active, created_at')
      .order('razon_social', { ascending: true })

    const transportistas = (transportistasRaw || []).map(t => ({
      id: t.id,
      rut: t.rut,
      razon_social: t.razon_social,
      nombre_fantasia: t.nombre_fantasia,
      is_active: t.is_active,
      created_at: t.created_at,
      conductores: conductoresByTransportista[t.id]?.total || 0,
      conductores_activos: conductoresByTransportista[t.id]?.activos || 0,
      documentos: docsByTransportista[t.id]?.total || 0,
      documentos_aprobados: docsByTransportista[t.id]?.aprobados || 0,
      documentos_pendientes: docsByTransportista[t.id]?.pendientes || 0,
      documentos_vencidos: docsByTransportista[t.id]?.vencidos || 0,
    }))

    const ejecutivas = EJECUTIVAS_LABBE.map(ej => {
      const profile = profiles.find(p => p.rut === ej.rut)
      const alertas = profile ? (alertsByUser[profile.id] || { total: 0, criticas: 0, no_leidas: 0 }) : { total: 0, criticas: 0, no_leidas: 0 }
      const diasEnPlataforma = profile ? Math.floor((Date.now() - new Date(profile.created_at).getTime()) / 86400000) : 0
      return {
        rut: ej.rut,
        nombre: profile?.email?.split('@')[0]?.toUpperCase() || ej.nombre,
        email: profile?.email || '',
        role: profile?.role || 'admin',
        dias_en_plataforma: diasEnPlataforma,
        created_at: profile?.created_at || null,
        alertas_total: alertas.total,
        alertas_criticas: alertas.criticas,
        alertas_no_leidas: alertas.no_leidas,
      }
    })

    const usuarios = profiles.map(p => {
      const alertas = alertsByUser[p.id] || { total: 0, criticas: 0, no_leidas: 0 }
      return {
        id: p.id,
        full_name: p.email?.split('@')[0] || 'Usuario',
        email: p.email,
        rut: p.rut,
        role: p.role,
        created_at: p.created_at,
        dias_en_plataforma: Math.floor((Date.now() - new Date(p.created_at).getTime()) / 86400000),
        alertas_total: alertas.total,
        alertas_criticas: alertas.criticas,
        alertas_no_leidas: alertas.no_leidas,
      }
    })

    console.log('[metrics API] Verified admin fetched global metrics:', auth.actor.id)
    return NextResponse.json({
      resumen: {
        total_usuarios: profiles.length,
        total_conductores: totalConductores || 0,
        total_subcontratistas: totalTransportistas || 0,
        total_documentos: totalDocumentos || 0,
        total_alertas: totalAlertas || 0,
      },
      ejecutivas,
      usuarios,
      subcontratistas: transportistas,
    })
  } catch (error) {
    console.error('[metrics API] Error:', error)
    return NextResponse.json({ error: 'Error fetching metrics' }, { status: 500 })
  }
}
