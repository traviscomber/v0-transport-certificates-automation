import { createHash, randomUUID } from 'crypto'
import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import {
  extractPlateCandidates,
  isVehicleRelatedDocument,
  type PlateCandidate,
} from '@/lib/fleet/plate-extractor'

export const dynamic = 'force-dynamic'
export const revalidate = 0
export const maxDuration = 60

const JOB_NAME = 'vehicle-fleet-recovery'
const BATCH_SIZE = 20
const LEASE_SECONDS = 55

type DocumentRow = {
  id: string
  subcontractor_id: string
  document_type_id: string
  file_name: string | null
  ai_extracted_text: string | null
  ai_analyzed_at: string | null
  updated_at: string | null
}

type PrtRow = {
  id: number
  plate_normalized: string
  record_type: string
  inspection_date: string | null
  expiration_date: string | null
  result_code: string | null
  result_label: string | null
  station_code: string | null
  station_name: string | null
  region_code: string | null
  vehicle_class: string | null
  certificate_number: string | null
  source_period: string
  raw_payload: Record<string, unknown>
}

function isAuthorizedCron(request: NextRequest): boolean {
  const authorization = request.headers.get('authorization')
  const configuredSecret = process.env.CRON_SECRET
  const hasValidSecret = Boolean(
    configuredSecret && authorization === `Bearer ${configuredSecret}`,
  )
  const isVercelCron = request.headers.get('user-agent') === 'vercel-cron/1.0'
  return hasValidSecret || isVercelCron
}

function sourceSignature(document: DocumentRow): string {
  return createHash('sha256')
    .update([
      document.file_name ?? '',
      document.ai_extracted_text ?? '',
      document.ai_analyzed_at ?? '',
      document.updated_at ?? '',
    ].join('|'))
    .digest('hex')
}

function nullableText(value: unknown): string | null {
  if (typeof value !== 'string') return null
  const normalized = value.trim()
  return normalized && normalized !== '0' ? normalized : null
}

function nullableYear(value: unknown): number | null {
  const parsed = Number.parseInt(String(value ?? ''), 10)
  return Number.isInteger(parsed) && parsed >= 1900 && parsed <= 2100 ? parsed : null
}

function newestPrtByPlate(rows: PrtRow[]): Map<string, PrtRow> {
  const records = new Map<string, PrtRow>()
  for (const row of rows) {
    if (!records.has(row.plate_normalized)) records.set(row.plate_normalized, row)
  }
  return records
}

async function queueForExistingOcr(supabase: ReturnType<typeof createAdminClient>, documentId: string) {
  const { error } = await supabase
    .from('document_text_extractions')
    .upsert({
      document_id: documentId,
      status: 'ocr_required',
      error_message: null,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'document_id' })

  if (error) throw error
}

async function saveFact(input: {
  supabase: ReturnType<typeof createAdminClient>
  document: DocumentRow
  candidate: PlateCandidate
  prt: PrtRow | null
  vehicleId: string | null
}) {
  const { error } = await input.supabase
    .from('vehicle_document_facts')
    .upsert({
      document_id: input.document.id,
      transportista_id: input.document.subcontractor_id,
      vehicle_id: input.vehicleId,
      plate_normalized: input.candidate.plate,
      extraction_source: input.candidate.source,
      confidence: input.candidate.confidence,
      prt_matched: Boolean(input.prt),
      prt_record_id: input.prt?.id ?? null,
      prt_snapshot: input.prt ?? {},
      context: {
        fileName: input.document.file_name,
        aiAnalyzedAt: input.document.ai_analyzed_at,
      },
      updated_at: new Date().toISOString(),
    }, { onConflict: 'document_id,plate_normalized' })

  if (error) throw error
}

async function saveScan(input: {
  supabase: ReturnType<typeof createAdminClient>
  document: DocumentRow
  signature: string
  status: 'matched' | 'no_candidate' | 'queued_ocr' | 'unmatched_prt' | 'owner_conflict' | 'failed'
  candidateCount: number
  matchedCount: number
  errorMessage?: string | null
}) {
  const { error } = await input.supabase
    .from('vehicle_document_scans')
    .upsert({
      document_id: input.document.id,
      transportista_id: input.document.subcontractor_id,
      source_signature: input.signature,
      status: input.status,
      candidate_count: input.candidateCount,
      matched_count: input.matchedCount,
      error_message: input.errorMessage ?? null,
      scanned_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }, { onConflict: 'document_id' })

  if (error) throw error
}

async function recoverVehicle(input: {
  supabase: ReturnType<typeof createAdminClient>
  document: DocumentRow
  candidate: PlateCandidate
  prt: PrtRow
}): Promise<{ vehicleId: string | null; created: boolean; updated: boolean; conflict: boolean }> {
  const { data: existing, error: existingError } = await input.supabase
    .from('vehiculos')
    .select('id, transportista_id')
    .eq('patente', input.candidate.plate)
    .maybeSingle()

  if (existingError) throw existingError

  if (existing && existing.transportista_id !== input.document.subcontractor_id) {
    return { vehicleId: existing.id, created: false, updated: false, conflict: true }
  }

  const raw = input.prt.raw_payload ?? {}
  const payload = {
    transportista_id: input.document.subcontractor_id,
    patente: input.candidate.plate,
    tipo: 'Vehículo',
    marca: nullableText(raw.MARCA),
    modelo: nullableText(raw.MODELO),
    ano: nullableYear(raw.ANO_FABRICACION),
    numero_chasis: nullableText(raw.NUM_CHASIS) ?? nullableText(raw.VIN),
    numero_motor: nullableText(raw.NUM_MOTOR),
    is_active: true,
    updated_at: new Date().toISOString(),
  }

  if (existing) {
    const { data, error } = await input.supabase
      .from('vehiculos')
      .update(payload)
      .eq('id', existing.id)
      .select('id')
      .single()
    if (error) throw error
    return { vehicleId: data.id, created: false, updated: true, conflict: false }
  }

  const { data, error } = await input.supabase
    .from('vehiculos')
    .insert(payload)
    .select('id')
    .single()
  if (error) throw error
  return { vehicleId: data.id, created: true, updated: false, conflict: false }
}

export async function GET(request: NextRequest) {
  if (!isAuthorizedCron(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createAdminClient()
  const ownerToken = randomUUID()
  const { data: lockAcquired, error: lockError } = await supabase.rpc('acquire_system_job_lock', {
    p_job_name: JOB_NAME,
    p_owner_token: ownerToken,
    p_lease_seconds: LEASE_SECONDS,
  })

  if (lockError) return NextResponse.json({ error: lockError.message }, { status: 500 })
  if (!lockAcquired) return NextResponse.json({ status: 'locked', processed: 0 })

  const stats = {
    scanned: 0,
    candidates: 0,
    prtMatched: 0,
    vehiclesCreated: 0,
    vehiclesUpdated: 0,
    queuedForOcr: 0,
    ownerConflicts: 0,
    unresolved: 0,
    failed: 0,
  }

  try {
    const [{ data: documents, error: documentsError }, { data: documentTypes, error: typesError }] = await Promise.all([
      supabase
        .from('subcontractor_documents')
        .select('id, subcontractor_id, document_type_id, file_name, ai_extracted_text, ai_analyzed_at, updated_at')
        .order('updated_at', { ascending: true })
        .limit(250),
      supabase.from('subcontractor_document_types').select('id, code, nombre'),
    ])

    if (documentsError || typesError) {
      throw documentsError ?? typesError
    }

    const rows = (documents ?? []) as DocumentRow[]
    const ids = rows.map((row) => row.id)
    const { data: priorScans, error: scansError } = ids.length
      ? await supabase
          .from('vehicle_document_scans')
          .select('document_id, source_signature')
          .in('document_id', ids)
      : { data: [], error: null }

    if (scansError) throw scansError

    const signatures = new Map(
      (priorScans ?? []).map((scan) => [scan.document_id as string, scan.source_signature as string]),
    )
    const typeNames = new Map(
      (documentTypes ?? []).map((type) => [
        type.id as string,
        `${type.code ?? ''} ${type.nombre ?? ''}`.trim(),
      ]),
    )

    const pending = rows
      .filter((document) => signatures.get(document.id) !== sourceSignature(document))
      .slice(0, BATCH_SIZE)

    for (const document of pending) {
      const signature = sourceSignature(document)
      stats.scanned += 1

      try {
        const candidates = extractPlateCandidates({
          fileName: document.file_name,
          ocrText: document.ai_extracted_text,
        })
        stats.candidates += candidates.length

        if (candidates.length === 0) {
          const vehicleRelated = isVehicleRelatedDocument({
            fileName: document.file_name,
            documentType: typeNames.get(document.document_type_id),
          })

          if (vehicleRelated && !document.ai_extracted_text?.trim()) {
            await queueForExistingOcr(supabase, document.id)
            stats.queuedForOcr += 1
            await saveScan({
              supabase,
              document,
              signature,
              status: 'queued_ocr',
              candidateCount: 0,
              matchedCount: 0,
            })
          } else {
            stats.unresolved += vehicleRelated ? 1 : 0
            await saveScan({
              supabase,
              document,
              signature,
              status: 'no_candidate',
              candidateCount: 0,
              matchedCount: 0,
            })
          }
          continue
        }

        const plates = candidates.map((candidate) => candidate.plate)
        const { data: prtRows, error: prtError } = await supabase
          .from('prt_vehicle_records')
          .select('id, plate_normalized, record_type, inspection_date, expiration_date, result_code, result_label, station_code, station_name, region_code, vehicle_class, certificate_number, source_period, raw_payload')
          .in('plate_normalized', plates)
          .order('source_period', { ascending: false })
          .order('inspection_date', { ascending: false })

        if (prtError) throw prtError
        const prtByPlate = newestPrtByPlate((prtRows ?? []) as PrtRow[])
        let matchedCount = 0
        let hasConflict = false

        for (const candidate of candidates) {
          const prt = prtByPlate.get(candidate.plate) ?? null
          if (!prt) {
            await saveFact({ supabase, document, candidate, prt: null, vehicleId: null })
            continue
          }

          const recovered = await recoverVehicle({ supabase, document, candidate, prt })
          matchedCount += 1
          stats.prtMatched += 1
          stats.vehiclesCreated += recovered.created ? 1 : 0
          stats.vehiclesUpdated += recovered.updated ? 1 : 0
          stats.ownerConflicts += recovered.conflict ? 1 : 0
          hasConflict ||= recovered.conflict

          await saveFact({
            supabase,
            document,
            candidate,
            prt,
            vehicleId: recovered.vehicleId,
          })
        }

        if (matchedCount === 0) stats.unresolved += 1
        await saveScan({
          supabase,
          document,
          signature,
          status: hasConflict ? 'owner_conflict' : matchedCount > 0 ? 'matched' : 'unmatched_prt',
          candidateCount: candidates.length,
          matchedCount,
        })
      } catch (error) {
        stats.failed += 1
        const message = error instanceof Error ? error.message : 'Unknown error'
        await saveScan({
          supabase,
          document,
          signature,
          status: 'failed',
          candidateCount: 0,
          matchedCount: 0,
          errorMessage: message,
        })
      }
    }

    return NextResponse.json({
      status: 'processed',
      batchSize: BATCH_SIZE,
      remainingCandidates: Math.max(0, rows.length - pending.length),
      ...stats,
    })
  } finally {
    await supabase.rpc('release_system_job_lock', {
      p_job_name: JOB_NAME,
      p_owner_token: ownerToken,
    })
  }
}
