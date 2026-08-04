import { NextRequest, NextResponse } from 'next/server'
import { createWriteStream } from 'node:fs'
import { mkdtemp, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { Readable } from 'node:stream'
import { pipeline } from 'node:stream/promises'
import ExcelJS from 'exceljs'
import * as unzipper from 'unzipper'
import { createAdminClient } from '@/lib/supabase/admin'

export const dynamic = 'force-dynamic'
export const revalidate = 0
export const maxDuration = 300

const MAX_SOURCE_ROWS_PER_RUN = 10_000
const UPSERT_CHUNK_SIZE = 250

type RecordType = 'RA2' | 'RB'

type Batch = {
  id: string
  period: string
  record_type: RecordType
  source_url: string
  status: string
  source_cursor: number
  rows_valid: number
  rows_rejected: number
  rows_duplicates: number
}

type ImportRow = {
  batch_id: string
  plate: string
  plate_normalized: string
  record_type: RecordType
  inspection_date: string
  expiration_date: string | null
  result_code: string | null
  result_label: string | null
  station_code: string | null
  station_name: string | null
  region_code: string | null
  vehicle_class: string | null
  certificate_number: string
  source_period: string
  raw_payload: Record<string, unknown>
}

function isAuthorized(request: NextRequest): boolean {
  const secret = process.env.CRON_SECRET
  return !secret || request.headers.get('authorization') === `Bearer ${secret}`
}

function clean(value: unknown): string | null {
  if (value === null || value === undefined) return null
  const text = String(value).trim()
  return !text || text.toUpperCase() === 'NULL' ? null : text
}

function normalizePlate(value: unknown): string | null {
  const plate = clean(value)?.toUpperCase().replace(/[^A-Z0-9]/g, '') ?? null
  return plate && plate.length >= 5 && plate.length <= 8 ? plate : null
}

function excelDateToIso(value: unknown): string | null {
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return value.toISOString().slice(0, 10)
  }

  if (typeof value === 'number' && Number.isFinite(value)) {
    const wholeDays = Math.floor(value)
    const utcMs = Date.UTC(1899, 11, 30) + wholeDays * 86_400_000
    const date = new Date(utcMs)
    return Number.isNaN(date.getTime()) ? null : date.toISOString().slice(0, 10)
  }

  const text = clean(value)
  if (!text) return null
  const match = text.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{2,4})$/)
  if (!match) return null

  const month = Number(match[1])
  const day = Number(match[2])
  const year = Number(match[3]) < 100 ? 2000 + Number(match[3]) : Number(match[3])
  const date = new Date(Date.UTC(year, month - 1, day))
  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  ) return null

  return date.toISOString().slice(0, 10)
}

function resultLabel(code: string | null): string | null {
  if (code === 'A') return 'APROBADO'
  if (code === 'R') return 'RECHAZADO'
  return code
}

function normalizeCell(value: unknown): unknown {
  if (value && typeof value === 'object') {
    if ('result' in value) return (value as { result?: unknown }).result ?? null
    if ('text' in value) return (value as { text?: unknown }).text ?? null
    if ('richText' in value) {
      return (value as { richText?: Array<{ text?: string }> }).richText
        ?.map((item) => item.text ?? '')
        .join('') ?? null
    }
  }
  return value
}

function rowObject(values: readonly unknown[], headers: string[]): Record<string, unknown> {
  const output: Record<string, unknown> = {}
  for (let index = 0; index < headers.length; index += 1) {
    const header = headers[index]
    if (header) output[header] = values[index + 1] ?? null
  }
  return output
}

function buildImportRow(source: Record<string, unknown>, batch: Batch): ImportRow | null {
  const plateNormalized = normalizePlate(source.PPU)
  const inspectionDate = excelDateToIso(source.FEC_REVISION)
  const certificateNumber = clean(source.NUM_CERTIFICADO)
  if (!plateNormalized || !inspectionDate || !certificateNumber) return null

  const resultCode = clean(source.RESULTADO_CRT)?.toUpperCase() ?? null
  const expirationDate = excelDateToIso(source.FEC_VENCIMIENTO)

  return {
    batch_id: batch.id,
    plate: clean(source.PPU) ?? plateNormalized,
    plate_normalized: plateNormalized,
    record_type: batch.record_type,
    inspection_date: inspectionDate,
    expiration_date: expirationDate,
    result_code: resultCode,
    result_label: resultLabel(resultCode),
    station_code: clean(source.COD_PRT),
    station_name: null,
    region_code: null,
    vehicle_class: clean(source.COD_VEHICULO),
    certificate_number: certificateNumber,
    source_period: batch.period,
    raw_payload: {
      COD_PRT: clean(source.COD_PRT),
      PPU: clean(source.PPU),
      COD_VEHICULO: clean(source.COD_VEHICULO),
      COD_COMBUSTIBLE: clean(source.COD_COMBUSTIBLE),
      COD_SERVICIO: clean(source.COD_SERVICIO),
      MARCA: clean(source.MARCA),
      MODELO: clean(source.MODELO),
      ANO_FABRICACION: clean(source.ANO_FABRICACION),
      NUM_MOTOR: clean(source.NUM_MOTOR),
      NUM_CHASIS: clean(source.NUM_CHASIS),
      VIN: clean(source.VIN),
      KILOMETRAJE: clean(source.KILOMETRAJE),
      NUM_CERTIFICADO: certificateNumber,
      FEC_REVISION: inspectionDate,
      FEC_VENCIMIENTO: expirationDate,
      RESULTADO_CRT: resultCode,
      FEC_VENCIMIENTO_GASES: excelDateToIso(source.FEC_VENCIMIENTO_GASES),
      RESULTADO_CRT_GASES: clean(source.RESULTADO_CRT_GASES),
    },
  }
}

async function downloadAndExtractWorkbook(sourceUrl: string, directory: string): Promise<string> {
  const archivePath = join(directory, 'source.zip')
  const workbookPath = join(directory, 'source.xlsx')
  const response = await fetch(sourceUrl, {
    cache: 'no-store',
    redirect: 'follow',
    headers: { 'User-Agent': 'Mozilla/5.0 (compatible; LABBE-PRT-Stream/1.0)' },
  })
  if (!response.ok || !response.body) {
    throw new Error(`PRT ZIP download failed with HTTP ${response.status}`)
  }

  await pipeline(Readable.fromWeb(response.body as never), createWriteStream(archivePath))
  const directoryInfo = await unzipper.Open.file(archivePath)
  const workbookEntry = directoryInfo.files.find((file) => /\.xlsx$/i.test(file.path))
  if (!workbookEntry) throw new Error('No XLSX file found inside PRT ZIP')
  await pipeline(workbookEntry.stream(), createWriteStream(workbookPath))
  return workbookPath
}

async function upsertChunk(rows: ImportRow[]): Promise<void> {
  if (rows.length === 0) return
  const supabase = createAdminClient()
  const { error } = await supabase.from('prt_vehicle_records').upsert(rows, {
    onConflict: 'batch_id,plate_normalized,inspection_date,certificate_number',
    ignoreDuplicates: false,
  })
  if (error) throw new Error(`PRT streaming upsert failed: ${error.message}`)
}

export async function GET(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createAdminClient()
  const eligibleStatuses = ['inspected', 'profiled', 'profiling', 'failed']
  const { data, error: batchError } = await supabase
    .from('prt_import_batches')
    .select('id, period, record_type, source_url, status, source_cursor, rows_valid, rows_rejected, rows_duplicates')
    .in('status', eligibleStatuses)
    .in('record_type', ['RA2', 'RB'])
    .order('period', { ascending: false })
    .order('record_type', { ascending: true })
    .limit(1)
    .maybeSingle()

  if (batchError) return NextResponse.json({ error: batchError.message }, { status: 500 })
  if (!data) return NextResponse.json({ processed: 0, reason: 'no_large_prt_batch' })
  const batch = data as Batch

  const { data: locked, error: lockError } = await supabase
    .from('prt_import_batches')
    .update({ status: 'importing', started_at: new Date().toISOString(), error_message: null })
    .eq('id', batch.id)
    .in('status', eligibleStatuses)
    .select('id')
    .maybeSingle()

  if (lockError) return NextResponse.json({ error: lockError.message }, { status: 500 })
  if (!locked) return NextResponse.json({ processed: 0, reason: 'batch_already_claimed' })

  const workdir = await mkdtemp(join(tmpdir(), 'prt-stream-'))
  try {
    const workbookPath = await downloadAndExtractWorkbook(batch.source_url, workdir)
    const reader = new ExcelJS.stream.xlsx.WorkbookReader(workbookPath, {
      entries: 'emit',
      sharedStrings: 'cache',
      hyperlinks: 'ignore',
      styles: 'ignore',
      worksheets: 'emit',
    })

    let headers: string[] = []
    let sourceRowIndex = 0
    let processedThisRun = 0
    let validThisRun = 0
    let rejectedThisRun = 0
    let duplicatesThisRun = 0
    let reachedLimit = false
    const pending: ImportRow[] = []
    const seen = new Set<string>()

    outer: for await (const worksheet of reader) {
      for await (const row of worksheet) {
        const values = (row.values as unknown[]).map(normalizeCell)
        if (headers.length === 0) {
          headers = values.slice(1).map((value) => String(value ?? '').trim())
          continue
        }

        sourceRowIndex += 1
        if (sourceRowIndex <= batch.source_cursor) continue
        processedThisRun += 1

        const record = buildImportRow(rowObject(values, headers), batch)
        if (!record) {
          rejectedThisRun += 1
        } else {
          const key = `${record.plate_normalized}|${record.inspection_date}|${record.certificate_number}`
          if (seen.has(key)) {
            duplicatesThisRun += 1
          } else {
            seen.add(key)
            pending.push(record)
            validThisRun += 1
          }
        }

        if (pending.length >= UPSERT_CHUNK_SIZE) {
          await upsertChunk(pending.splice(0, pending.length))
        }

        if (processedThisRun >= MAX_SOURCE_ROWS_PER_RUN) {
          reachedLimit = true
          break outer
        }
      }
      break
    }

    await upsertChunk(pending)

    const nextCursor = batch.source_cursor + processedThisRun
    const nextValid = Number(batch.rows_valid ?? 0) + validThisRun
    const nextRejected = Number(batch.rows_rejected ?? 0) + rejectedThisRun + duplicatesThisRun
    const nextDuplicates = Number(batch.rows_duplicates ?? 0) + duplicatesThisRun
    const now = new Date().toISOString()

    const { error: updateError } = await supabase
      .from('prt_import_batches')
      .update({
        status: reachedLimit ? 'profiled' : 'imported',
        source_cursor: nextCursor,
        rows_read: nextCursor,
        rows_valid: nextValid,
        rows_rejected: nextRejected,
        rows_duplicates: nextDuplicates,
        completed_at: reachedLimit ? null : now,
        updated_at: now,
        error_message: null,
      })
      .eq('id', batch.id)

    if (updateError) throw new Error(updateError.message)

    return NextResponse.json({
      processed: processedThisRun,
      imported: validThisRun,
      rejected: rejectedThisRun,
      duplicates: duplicatesThisRun,
      cursor: nextCursor,
      completed: !reachedLimit,
      batch: { id: batch.id, period: batch.period, recordType: batch.record_type },
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown PRT streaming import error'
    await supabase
      .from('prt_import_batches')
      .update({ status: 'failed', error_message: message, updated_at: new Date().toISOString() })
      .eq('id', batch.id)
    return NextResponse.json({ error: message, batchId: batch.id }, { status: 500 })
  } finally {
    await rm(workdir, { recursive: true, force: true })
  }
}
