import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { validateLicensePlate } from '@/lib/chilean-validators'

export const dynamic = 'force-dynamic'

type VerificationFact = {
  id: string
  prt_matched: boolean | null
  confidence: number | string | null
  updated_at: string | null
}

type CanonicalVehicle = {
  id: string
  transportista_id: string
  patente: string | null
  marca: string | null
  modelo: string | null
  ano: number | null
  tipo: string | null
  numero_chasis: string | null
  is_active: boolean | null
  transportista: {
    id: string
    razon_social: string | null
    nombre_fantasia: string | null
  } | null
  verification_facts: VerificationFact[] | null
}

function mapVehicle(vehicle: CanonicalVehicle) {
  const matchedFacts = (vehicle.verification_facts ?? []).filter((fact) => fact.prt_matched === true)
  const confidence = matchedFacts.reduce((highest, fact) => {
    const value = Number(fact.confidence ?? 0)
    return Number.isFinite(value) ? Math.max(highest, value) : highest
  }, 0)

  return {
    id: vehicle.id,
    plate: vehicle.patente,
    brand: vehicle.marca,
    model: vehicle.modelo,
    year: vehicle.ano,
    type: vehicle.tipo,
    vin: vehicle.numero_chasis,
    is_active: vehicle.is_active !== false,
    organization: vehicle.transportista
      ? {
          id: vehicle.transportista.id,
          name: vehicle.transportista.nombre_fantasia || vehicle.transportista.razon_social || 'Sin nombre',
        }
      : null,
    verification: {
      advanced: matchedFacts.length > 0,
      evidence_count: matchedFacts.length,
      confidence: matchedFacts.length > 0 ? confidence : null,
    },
  }
}

// GET canonical fleet. Advanced verification is optional and never controls validity.
export async function GET(request: Request) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    const organizationId = searchParams.get('organization_id')

    let query = supabase
      .from('vehiculos')
      .select(`
        id,
        transportista_id,
        patente,
        marca,
        modelo,
        ano,
        tipo,
        numero_chasis,
        is_active,
        transportista:transportistas!vehiculos_transportista_id_fkey(
          id,
          razon_social,
          nombre_fantasia
        ),
        verification_facts:vehicle_document_facts!vehicle_document_facts_vehicle_id_fkey(
          id,
          prt_matched,
          confidence,
          updated_at
        )
      `)
      .order('patente')

    if (organizationId) {
      query = query.eq('transportista_id', organizationId)
    }

    const { data, error } = await query
    if (error) throw error

    return NextResponse.json({
      data: ((data ?? []) as unknown as CanonicalVehicle[]).map(mapVehicle),
      success: true,
    })
  } catch (error) {
    console.error('Error fetching canonical vehicles:', error)
    return NextResponse.json({ error: 'Failed to fetch vehicles' }, { status: 500 })
  }
}

// POST remains API-compatible but writes only to the canonical vehiculos table.
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const transportistaId = body.transportista_id ?? body.organization_id
    const rawPlate = String(body.patente ?? body.plate ?? '').trim().toUpperCase()

    if (!transportistaId) {
      return NextResponse.json({ error: 'transportista_id es requerido' }, { status: 400 })
    }
    if (!rawPlate) {
      return NextResponse.json({ error: 'patente es requerida' }, { status: 400 })
    }

    const plateValidation = validateLicensePlate(rawPlate)
    if (!plateValidation.valid) {
      return NextResponse.json({ error: plateValidation.error }, { status: 400 })
    }

    const patente = rawPlate.replace(/[^A-Z0-9]/g, '')
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('vehiculos')
      .insert({
        transportista_id: transportistaId,
        patente,
        marca: body.marca ?? body.brand ?? null,
        modelo: body.modelo ?? body.model ?? null,
        ano: body.ano ?? body.year ?? null,
        tipo: body.tipo ?? body.type ?? null,
        numero_chasis: body.numero_chasis ?? body.vin ?? null,
        is_active: body.is_active ?? true,
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({
      data: {
        id: data.id,
        plate: data.patente,
        brand: data.marca,
        model: data.modelo,
        year: data.ano,
        type: data.tipo,
        vin: data.numero_chasis,
        is_active: data.is_active !== false,
        organization: null,
        verification: {
          advanced: false,
          evidence_count: 0,
          confidence: null,
        },
      },
      success: true,
    }, { status: 201 })
  } catch (error) {
    console.error('Error creating canonical vehicle:', error)
    return NextResponse.json({ error: 'Failed to create vehicle' }, { status: 500 })
  }
}
