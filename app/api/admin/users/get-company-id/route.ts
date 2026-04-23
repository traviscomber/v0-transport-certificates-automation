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
      
      const { data: company, error } = await adminClient
        .from('organizations')
        .select('id')
        .eq('name', 'Transportes Labbe')
        .single()

      if (error) {
        console.warn('[v0] Error fetching Labbe company:', error)
      } else if (company) {
        companyId = company.id
        console.log('[v0] Using Labbe company_id as default:', companyId)
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
