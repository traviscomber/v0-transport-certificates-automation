import { createClient } from '@supabase/supabase-js'

/**
 * GET /api/compliance/requirements
 * Fetch all document requirements
 */
export async function GET(request: Request) {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const applicableTo = searchParams.get('applicable_to') // 'conductor', 'transportista', 'vehicle'

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
