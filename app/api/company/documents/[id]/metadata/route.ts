import { randomBytes } from 'crypto'
import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { requireServerActor } from '@/lib/auth/server-actor'

function generateDocumentCode(
  companyCode: string,
  driverRut: string,
  documentType: string,
): string {
  const typeMap: Record<string, string> = {
    'Licencia de Conducir': 'LIC',
    'Seguro': 'SEG',
    'Certificado': 'CERT',
    'Revisión Técnica': 'REV',
    'Antecedentes': 'ANT',
    'Permiso Especial': 'PER',
    'Documento': 'DOC',
  }

  const typeCode = typeMap[documentType] || 'DOC'
  const date = new Date().toISOString().split('T')[0].replace(/-/g, '')
  const random = randomBytes(3).toString('hex').toUpperCase()

  return `${companyCode}_${driverRut}_${typeCode}_${date}_${random}`
}

async function requireDocumentActor() {
  return requireServerActor(['admin', 'ejecutiva', 'prevencionista', 'transportista'])
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  const auth = await requireDocumentActor()
  if (!auth.actor) {
    return NextResponse.json({ error: auth.error }, { status: auth.status })
  }

  try {
    const { custom_code, expiration_date } = await request.json()
    const adminClient = createAdminClient()
    const documentId = params.id

    const { data: doc, error: getError } = await adminClient
      .from('documents')
      .select('id')
      .eq('id', documentId)
      .single()

    if (getError || !doc) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 })
    }

    const updates: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    }

    if (custom_code) updates.custom_code = custom_code

    if (expiration_date) {
      const expDate = new Date(expiration_date)
      if (Number.isNaN(expDate.getTime())) {
        return NextResponse.json({ error: 'Invalid expiration date' }, { status: 400 })
      }
      updates.expiration_date = expiration_date
    }

    const { data: updated, error: updateError } = await adminClient
      .from('documents')
      .update(updates)
      .eq('id', documentId)
      .select()
      .single()

    if (updateError) {
      return NextResponse.json({ error: 'Failed to update document' }, { status: 500 })
    }

    console.log('[company] Verified actor updated document metadata:', auth.actor.id, documentId)
    return NextResponse.json({ success: true, document: updated, message: 'Document updated successfully' })
  } catch (error) {
    console.error('[company] Error updating document metadata:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Server error' },
      { status: 500 },
    )
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  const auth = await requireDocumentActor()
  if (!auth.actor) {
    return NextResponse.json({ error: auth.error }, { status: auth.status })
  }

  try {
    const { company_code, driver_rut, document_type } = await request.json()
    const adminClient = createAdminClient()
    const documentId = params.id

    if (!company_code || !driver_rut || !document_type) {
      return NextResponse.json(
        { error: 'Missing required fields: company_code, driver_rut, document_type' },
        { status: 400 },
      )
    }

    const generatedCode = generateDocumentCode(company_code, driver_rut, document_type)
    const { data: existing } = await adminClient
      .from('documents')
      .select('id')
      .eq('custom_code', generatedCode)
      .maybeSingle()

    const code = existing ? `${generatedCode}_DUP` : generatedCode
    const { data: updated, error: updateError } = await adminClient
      .from('documents')
      .update({ custom_code: code })
      .eq('id', documentId)
      .select()
      .single()

    if (updateError) {
      return NextResponse.json({ error: 'Failed to generate code' }, { status: 500 })
    }

    console.log('[company] Verified actor generated document code:', auth.actor.id, documentId)
    return NextResponse.json({ success: true, document: updated, generated_code: code })
  } catch (error) {
    console.error('[company] Error generating document code:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Server error' },
      { status: 500 },
    )
  }
}
