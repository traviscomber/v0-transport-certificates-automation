import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function GET() {
  try {
    const cookieStore = await cookies()
    let companyId = cookieStore.get('company_id')?.value

    console.log('[v0] Company_id from cookies:', companyId)

    // If no company_id in cookies, use Labbe as default for admin imports
    if (!companyId) {
      console.log('[v0] No company_id in cookies, fetching Labbe company_id')
      const adminClient = createAdminClient()
      
      // Try to find company by name (case insensitive) - search for "company"
      const { data: companies, error } = await adminClient
        .from('organizations')
        .select('id, name')
        .ilike('name', '%company%')

      console.log('[v0] Company search results:', { count: companies?.length, error: error?.message })

      if (!error && companies && companies.length > 0) {
        companyId = companies[0].id
        console.log('[v0] Using company_id as default:', companyId, 'name:', companies[0].name)
      } else if (error) {
        console.warn('[v0] Error fetching company:', error)
      } else {
        console.warn('[v0] No company found in database')
      }
    }

    return NextResponse.json({
      company_id: companyId || null
    })
  } catch (error) {
    console.error('[v0] Error getting company_id:', error)
    return NextResponse.json(
      { error: 'Failed to get company_id' },
      { status: 500 }
    )
  }
}
