import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export const dynamic = 'force-dynamic'

/**
 * GET /api/alerts
 * 
 * Obtiene todas las alertas con opciones de filtrado
 * 
 * Query Parameters:
 * - alert_type: Filtrar por tipo (DOCUMENT_REJECTED, DOCUMENT_EXPIRATION, etc)
 * - priority: Filtrar por prioridad (critical, high, medium, low)
 * - is_read: Filtrar alertas leídas (true/false)
 * - limit: Número máximo (default: 100)
 * - offset: Para paginación (default: 0)
 * - sort: Ordenar por campo (default: created_at.desc)
 */
export async function GET(request: Request) {
  try {
    const supabase = await createClient()

    // Optional auth check - if user exists, they're authenticated, otherwise allow read-only access
    const { data: { user } } = await supabase.auth.getUser()

    const url = new URL(request.url)
    const alert_type = url.searchParams.get('alert_type')
    const priority = url.searchParams.get('priority')
    const is_read = url.searchParams.get('is_read')
    const limit = parseInt(url.searchParams.get('limit') || '100')
    const offset = parseInt(url.searchParams.get('offset') || '0')
    const sort = url.searchParams.get('sort') || 'created_at.desc'

    let query = supabase
      .from('alerts_log')
      .select('*', { count: 'exact' })

    if (alert_type) query = query.eq('alert_type', alert_type)
    if (priority) query = query.eq('priority', priority)
    if (is_read !== null) query = query.eq('is_read', is_read === 'true')

    // Parse sort parameter (format: "field.direction")
    const [sortField, sortDir] = sort.split('.')
    query = query.order(sortField || 'created_at', { ascending: sortDir === 'asc' })

    const { data: alerts, error, count } = await query
      .range(offset, offset + limit - 1)

    if (error) throw error

    return NextResponse.json({ 
      alerts: alerts,
      total: count,
      limit,
      offset,
      hasMore: (offset + limit) < (count || 0)
    })
  } catch (error: any) {
    console.error('[ALERTS API] GET error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

/**
 * POST /api/alerts
 * 
 * Crea una nueva alerta global
 * 
 * Body:
 * {
 *   alert_type: string (DOCUMENT_REJECTED, DOCUMENT_EXPIRATION, etc),
 *   title: string,
 *   description: string,
 *   priority: string (critical, high, medium, low),
 *   entity_type?: string (document, conductor, etc),
 *   entity_id?: string,
 *   entity_name?: string,
 *   action_url?: string
 * }
 */
export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    const body = await request.json()
    const { alert_type, title, description, priority, entity_type, entity_id, entity_name, action_url } = body

    // Validar campos requeridos
    if (!alert_type || !title) {
      return NextResponse.json(
        { error: "alert_type y title son requeridos" },
        { status: 400 }
      )
    }

    const { data: alert, error } = await supabase
      .from('alerts_log')
      .insert({
        alert_type,
        title,
        description: description || null,
        priority: priority || 'medium',
        entity_type: entity_type || null,
        entity_id: entity_id || null,
        entity_name: entity_name || null,
        action_url: action_url || null,
        is_read: false,
        is_resolved: false
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ data: alert }, { status: 201 })
  } catch (error: any) {
    console.error('[ALERTS API] POST error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

/**
 * PATCH /api/alerts
 * 
 * Actualiza múltiples alertas (marcar como leídas, resueltas, etc)
 * 
 * Body:
 * {
 *   ids: string[], // IDs de alertas a actualizar
 *   is_read?: boolean, // Marcar como leída
 *   is_resolved?: boolean // Marcar como resuelta
 * }
 */
export async function PATCH(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    const body = await request.json()
    const { ids, is_read, is_resolved } = body

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json(
        { error: "ids es requerido y debe ser un array" },
        { status: 400 }
      )
    }

    // Construir objeto de actualización solo con campos que se proporcionan
    const updateData: any = {}
    if (is_read !== undefined) updateData.is_read = is_read
    if (is_resolved !== undefined) updateData.is_resolved = is_resolved
    updateData.updated_at = new Date().toISOString()

    const { data: updated, error } = await supabase
      .from('alerts_log')
      .update(updateData)
      .in('id', ids)
      .select()

    if (error) throw error

    return NextResponse.json({ 
      data: updated,
      message: `${updated.length} alertas actualizadas`
    })
  } catch (error: any) {
    console.error('[ALERTS API] PATCH error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
