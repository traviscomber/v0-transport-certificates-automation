import { NextResponse } from 'next/server'

// Store subcontractors in memory (in production, use database)
let subcontractorsData: any[] = []

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')

  if (id) {
    const sub = subcontractorsData.find(s => s.id === id)
    if (!sub) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json(sub)
  }

  return NextResponse.json(subcontractorsData)
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const newSubcontractor = {
      id: `sub_${Date.now()}`,
      ...body,
      createdAt: new Date().toISOString(),
    }
    subcontractorsData.push(newSubcontractor)
    console.log('[v0] Subcontractor created:', newSubcontractor.id)
    return NextResponse.json(newSubcontractor, { status: 201 })
  } catch (error) {
    console.error('[v0] Error creating subcontractor:', error)
    return NextResponse.json({ error: 'Failed to create' }, { status: 400 })
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json()
    const { id, ...updates } = body
    
    const index = subcontractorsData.findIndex(s => s.id === id)
    if (index === -1) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    
    subcontractorsData[index] = {
      ...subcontractorsData[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    }
    console.log('[v0] Subcontractor updated:', id)
    return NextResponse.json(subcontractorsData[index])
  } catch (error) {
    console.error('[v0] Error updating subcontractor:', error)
    return NextResponse.json({ error: 'Failed to update' }, { status: 400 })
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    
    if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 })
    
    const index = subcontractorsData.findIndex(s => s.id === id)
    if (index === -1) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    
    const deleted = subcontractorsData.splice(index, 1)[0]
    console.log('[v0] Subcontractor deleted:', id)
    return NextResponse.json(deleted)
  } catch (error) {
    console.error('[v0] Error deleting subcontractor:', error)
    return NextResponse.json({ error: 'Failed to delete' }, { status: 400 })
  }
}
