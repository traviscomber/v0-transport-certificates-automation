import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const cookieStore = await cookies()
    let companyId = cookieStore.get('company_id')?.value

    console.log('[v0] Company_id from cookies:', companyId)

    // If no company_id in cookies, use default for admin imports
    if (!companyId) {
      console.log('[v0] No company_id in cookies, fetching organizations')
      const adminClient = createAdminClient()
      
      // Get all organizations to see what's available
      const { data: allCompanies, error: allError } = await adminClient
        .from('organizations')
        .select('id, name')
        .limit(10)

      console.log('[v0] All organizations in database:', { 
        count: allCompanies?.length, 
        companies: allCompanies?.map((c: any) => ({ id: c.id, name: c.name })),
        error: allError?.message 
      })

      // Use the first company as default
      if (!allError && allCompanies && allCompanies.length > 0) {
        companyId = allCompanies[0].id
        console.log('[v0] Using first company as default:', companyId, 'name:', allCompanies[0].name)
      } else if (allError) {
        console.warn('[v0] Error fetching organizations:', allError)
      }
    }

    console.log('[v0] Final company_id:', companyId)
    return NextResponse.json({
      company_id: companyId || null
    })
  } catch (error) {
    console.error('[v0] Error getting company_id:', error)
    return NextResponse.json(
      { error: 'Failed to get company_id', details: String(error) },
      { status: 500 }
    )
  }
}
