import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export const dynamic = 'force-dynamic'

/**
 * GET /api/alerts
 * 
 * Obtiene todas las alertas del usuario autenticado con opciones de filtrado
 * 
 * Query Parameters:
 * - type: Filtrar por tipo (document_upload, document_validated, etc)
 * - priority: Filtrar por prioridad (critical, high, normal, low)
 * - read: Filtrar alertas leídas (true/false)
 * - limit: Número máximo (default: 50)
 * - offset: Para paginación (default: 0)
 */
export async function GET(request: Request) {
  const supabase = await createClient()

  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const url = new URL(request.url)
    const type = url.searchParams.get('type')
    const priority = url.searchParams.get('priority')
    const read = url.searchParams.get('read')
    const limit = parseInt(url.searchParams.get('limit') || '50')
    const offset = parseInt(url.searchParams.get('offset') || '0')

    let query = supabase
      .from('alerts')
      .select('*', { count: 'exact' })
      .eq('user_id', user.id)

    if (type) query = query.eq('type', type)
    if (priority) query = query.eq('priority', priority)
    if (read !== null) query = query.eq('read', read === 'true')

    const { data: alerts, error, count } = await query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) throw error

    return NextResponse.json({ 
      data: alerts,
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
 * Crea una nueva alerta para el usuario autenticado
 * 
 * Body:
 * {
 *   title: string,
 *   message: string,
 *   type: string (document_upload, document_validated, etc),
 *   category: string (document, compliance, entity, etc),
 *   priority: string (critical, high, normal, low),
 *   action_url?: string (link a donde ir)
 * }
 */
export async function POST(request: Request) {
  const supabase = await createClient()

  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { title, message, type, category, priority, action_url, metadata } = body

    // Validar campos requeridos
    if (!title || !message) {
      return NextResponse.json(
        { error: "title y message son requeridos" },
        { status: 400 }
      )
    }

    const { data: alert, error } = await supabase
      .from('alerts')
      .insert({
        user_id: user.id,
        title,
        message,
        type: type || 'info',
        category: category || 'general',
        priority: priority || 'normal',
        action_url,
        metadata,
        read: false
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
 * Actualiza múltiples alertas (marcar como leídas, eliminar, etc)
 * 
 * Body:
 * {
 *   ids: string[], // IDs de alertas a actualizar
 *   read?: boolean, // Marcar como leída
 *   deleted?: boolean // Marcar como eliminada
 * }
 */
export async function PATCH(request: Request) {
  const supabase = await createClient()

  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { ids, read, deleted } = body

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json(
        { error: "ids es requerido y debe ser un array" },
        { status: 400 }
      )
    }

    // Construir objeto de actualización solo con campos que se proporcionan
    const updateData: any = {}
    if (read !== undefined) updateData.read = read
    if (deleted !== undefined) updateData.deleted_at = deleted ? new Date().toISOString() : null

    const { data: updated, error } = await supabase
      .from('alerts')
      .update(updateData)
      .in('id', ids)
      .eq('user_id', user.id)
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
