import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // Handle cookies in API context
          }
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const format = searchParams.get('format') || 'csv'
  const companyId = searchParams.get('company_id')
  const anomalyIds = searchParams.getAll('ids')

  let query = supabase
    .from('anomalies_with_document_details')
    .select('*')

  if (companyId) {
    query = query.eq('company_id', companyId)
  }

  if (anomalyIds.length > 0) {
    query = query.in('id', anomalyIds)
  }

  const { data: anomalies, error } = await query

  if (error) {
    console.error('[v0] Export error:', error)
    return NextResponse.json({ error: 'Failed to export anomalies' }, { status: 500 })
  }

  if (format === 'json') {
    return NextResponse.json(anomalies)
  }

  // CSV format
  const headers = [
    'ID',
    'Tipo de Anomalía',
    'Severidad',
    'Tipo de Documento',
    'Conductor',
    'RUT',
    'Empresa',
    'Detectado',
    'Estado',
    'Notas',
  ]

  const rows = (anomalies || []).map(a => [
    a.id,
    a.anomaly_type,
    a.severity,
    a.document_type || '',
    a.driver_name || '',
    a.driver_rut || '',
    a.company_name || '',
    new Date(a.detected_at).toISOString(),
    a.action_taken || 'pending',
    a.action_notes || '',
  ])

  const csv = [
    headers.join(','),
    ...rows.map(row =>
      row
        .map(cell => {
          if (typeof cell === 'string' && (cell.includes(',') || cell.includes('"'))) {
            return `"${cell.replace(/"/g, '""')}"` 
          }
          return cell
        })
        .join(',')
    ),
  ].join('\n')

  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv;charset=utf-8',
      'Content-Disposition': 'attachment; filename=anomalias.csv',
    },
  })
}
