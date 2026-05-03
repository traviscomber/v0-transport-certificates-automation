import { NextRequest, NextResponse } from 'next/server'
import { allDriversData } from '@/lib/data/all-drivers'
import { allSubcontractorsData } from '@/lib/data/all-subcontractors'

interface ReportFilter {
  type: 'conductores' | 'subcontratistas' | 'all'
  status?: 'activo' | 'inactivo' | 'all'
  documentStatus?: 'pendiente' | 'aprobado' | 'rechazado' | 'all'
  searchTerm?: string
  entityId?: string
}

export async function POST(request: NextRequest) {
  try {
    const { type = 'all', status = 'all', documentStatus = 'all', searchTerm = '', entityId = '' } = await request.json()

    let data: any[] = []

    // Filtrar conductores
    if (type === 'conductores' || type === 'all') {
      let drivers = [...allDriversData]

      // Si hay entityId, filtrar por ese conductor específico
      if (entityId) {
        drivers = drivers.filter(d => d.id === entityId || d.rut === entityId)
      }

      if (status !== 'all') {
        drivers = drivers.filter(d => (d.is_active && status === 'activo') || (!d.is_active && status === 'inactivo'))
      }

      if (searchTerm) {
        drivers = drivers.filter(d => 
          d.rut.toLowerCase().includes(searchTerm.toLowerCase()) ||
          d.nombres.toLowerCase().includes(searchTerm.toLowerCase())
        )
      }

      data.push(...drivers.map(d => ({
        ...d,
        category: 'Conductor',
        documentCount: d.documentos?.length || 0
      })))
    }

    // Filtrar subcontratistas
    if (type === 'subcontratistas' || type === 'all') {
      let subcontractors = [...allSubcontractorsData]

      // Si hay entityId, filtrar por ese subcontratista específico
      if (entityId) {
        subcontractors = subcontractors.filter(s => s.id === entityId || s.rut === entityId)
      }

      if (status !== 'all') {
        subcontractors = subcontractors.filter(s => (s.is_active && status === 'activo') || (!s.is_active && status === 'inactivo'))
      }

      if (searchTerm) {
        subcontractors = subcontractors.filter(s =>
          s.rut.toLowerCase().includes(searchTerm.toLowerCase()) ||
          s.nombre_fantasia.toLowerCase().includes(searchTerm.toLowerCase())
        )
      }

      data.push(...subcontractors.map(s => ({
        ...s,
        category: 'Subcontratista',
        documentCount: 0 // TODO: fetch from DB
      })))
    }

    // Calcular estadísticas
    const stats = {
      total: data.length,
      activos: data.filter(d => d.is_active).length,
      inactivos: data.filter(d => !d.is_active).length,
      conDocumentos: data.filter(d => d.documentCount > 0).length,
      sinDocumentos: data.filter(d => d.documentCount === 0).length,
    }

    console.log('[v0] Reports data loaded:', { 
      total: stats.total, 
      categories: type,
      entityFilter: entityId ? `Filtered to entity: ${entityId}` : 'All entities'
    })

    return NextResponse.json({
      success: true,
      data,
      stats,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('[v0] Error loading report data:', error)
    return NextResponse.json(
      { error: 'Failed to load report data' },
      { status: 500 }
    )
  }
}
