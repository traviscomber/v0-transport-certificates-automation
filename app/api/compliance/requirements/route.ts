import { createClient } from '@supabase/supabase-js'

/**
 * GET /api/compliance/requirements
 * Fetch all document requirements
 */
export const dynamic = 'force-dynamic'

export async function GET(
  request: Request,
) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !serviceRoleKey) {
      return Response.json(
        { error: 'Server configuration missing: SUPABASE_URL or SERVICE_ROLE_KEY' },
        { status: 500 }
      )
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey)

    const url = new URL(request.url)
    const category = url.searchParams.get('category') || undefined
    const applicableTo = url.searchParams.get('applicable_to') || undefined

    let query = supabase
      .from('document_requirements')
      .select('*')
      .eq('is_active', true)

    if (category) {
      query = query.eq('category', category)
    }

    if (applicableTo === 'conductor') {
      query = query.eq('applicable_to_conductor', true)
    } else if (applicableTo === 'transportista') {
      query = query.eq('applicable_to_transportista', true)
    } else if (applicableTo === 'vehicle') {
      query = query.eq('applicable_to_vehicle', true)
    }

    const { data: requirements, error } = await query.order('code', { ascending: true })

    if (error) throw error

    return Response.json({
      success: true,
      count: requirements?.length || 0,
      requirements: requirements || [],
    })
  } catch (error) {
    console.error('[v0] Error fetching requirements:', error)
    return Response.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch requirements' },
      { status: 500 }
    )
  }
}
