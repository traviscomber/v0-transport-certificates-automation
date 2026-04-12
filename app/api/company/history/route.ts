import { NextResponse } from 'next/server'

// Mark this route as dynamic since it uses request.url for query parameters
export const dynamic = 'force-dynamic'

interface HistoryEvent {
  id: string
  user: string
  action: string
  entity: string
  entityType: string
  timestamp: string
  status: 'success' | 'warning' | 'error'
  details?: string
}

// Mock history data - en Fase 6 vendría de base de datos
const mockHistoryEvents: HistoryEvent[] = [
  {
    id: '1',
    user: 'Carolina Sepúlveda',
    action: 'Subió documento',
    entity: 'Transportes Andina',
    entityType: 'subcontractor',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    status: 'success',
    details: 'Certificado Ariztia'
  },
  {
    id: '2',
    user: 'Sistema',
    action: 'Validó documento',
    entity: 'AEROCAV SPA',
    entityType: 'subcontractor',
    timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    status: 'success',
    details: 'F30 - Validación automática'
  },
  {
    id: '3',
    user: 'Daniela Silva',
    action: 'Marcó como vencido',
    entity: 'Transporte Willie & Dino EIRL',
    entityType: 'subcontractor',
    timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'warning',
    details: 'Revisión técnica'
  },
  {
    id: '4',
    user: 'Sistema',
    action: 'Generó alerta',
    entity: 'Multiple',
    entityType: 'alert',
    timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000 - 8 * 60 * 60 * 1000).toISOString(),
    status: 'warning',
    details: '12 próximos vencimientos en 7 días'
  },
  {
    id: '5',
    user: 'Admin',
    action: 'Actualizó parámetro',
    entity: 'Sistema',
    entityType: 'system',
    timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'success',
    details: 'Días alerta vencimiento: 30'
  },
]

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')
    const entityType = searchParams.get('entityType')

    // Filtrar si se especifica entityType
    let filtered = mockHistoryEvents
    if (entityType) {
      filtered = filtered.filter(e => e.entityType === entityType)
    }

    // Ordenar por timestamp descendente (más reciente primero)
    const sorted = [...filtered].sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    )

    // Paginar
    const paginated = sorted.slice(offset, offset + limit)

    return NextResponse.json({
      events: paginated,
      pagination: {
        total: filtered.length,
        limit,
        offset,
        hasMore: offset + limit < filtered.length
      }
    })
  } catch (error) {
    console.error('[v0] Error fetching history:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json(
      { error: 'Failed to fetch history', details: errorMessage },
      { status: 500 }
    )
  }
}
