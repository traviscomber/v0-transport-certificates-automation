import { NextRequest, NextResponse } from 'next/server'
import { inflateRawSync } from 'node:zlib'
import * as XLSX from 'xlsx'
import { createAdminClient } from '@/lib/supabase/admin'

export const dynamic = 'force-dynamic'
export const revalidate = 0
export const maxDuration = 300

const UPSERT_CHUNK_SIZE = 250

type ZipEntry = {
  name: string
  compressionMethod: number
  compressedSize: number
  uncompressedSize: number
  localHeaderOffset: number
}

type ImportRow = {
  batch_id: string
  plate: string
  plate_normalized: string
  record_type: 'RA1'
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

function isAuthorized(request: NextRequest): boolean {
  const secret = process.env.CRON_SECRET
  if (!secret) return true
  return request.headers.get('authorization') === `Bearer ${secret}`
}

function findEndOfCentralDirectory(buffer: Buffer): number {
  const signature = 0x06054b50
  const min = Math.max(0, buffer.length - 65_557)
  for (let offset = buffer.length - 22; offset >= min; offset -= 1) {
    if (buffer.readUInt32LE(offset) === signature) return offset
  }
  throw new Error('ZIP end-of-central-directory record not found')
}

function listZipEntries(buffer: Buffer): ZipEntry[] {
  const eocd = findEndOfCentralDirectory(buffer)
  const entryCount = buffer.readUInt16LE(eocd + 10)
  const centralDirectoryOffset = buffer.readUInt32LE(eocd + 16)
  const entries: ZipEntry[] = []
  let offset = centralDirectoryOffset

  for (let index = 0; index < entryCount; index += 1) {
    if (buffer.readUInt32LE(offset) !== 0x02014b50) {
      throw new Error(`Invalid central directory entry at offset ${offset}`)
    }
    const compressionMethod = buffer.readUInt16LE(offset + 10)
    const compressedSize = buffer.readUInt32LE(offset + 20)
    const uncompressedSize = buffer.readUInt32LE(offset + 24)
    const fileNameLength = buffer.readUInt16LE(offset + 28)
    const extraLength = buffer.readUInt16LE(offset + 30)
    const commentLength = buffer.readUInt16LE(offset + 32)
    const localHeaderOffset = buffer.readUInt32LE(offset + 42)
    const name = buffer.subarray(offset + 46, offset + 46 + fileNameLength).toString('utf8')
    entries.push({ name, compressionMethod, compressedSize, uncompressedSize, localHeaderOffset })
    offset += 46 + fileNameLength + extraLength + commentLength
  }
  return entries
}

function extractEntry(buffer: Buffer, entry: ZipEntry): Buffer {
  const offset = entry.localHeaderOffset
  if (buffer.readUInt32LE(offset) !== 0x04034b50) {
    throw new Error(`Invalid local ZIP header for ${entry.name}`)
  }
  const fileNameLength = buffer.readUInt16LE(offset + 26)
  const extraLength = buffer.readUInt16LE(offset + 28)
  const dataStart = offset + 30 + fileNameLength + extraLength
  const compressed = buffer.subarray(dataStart, dataStart + entry.compressedSize)
  if (entry.compressionMethod === 0) return Buffer.from(compressed)
  if (entry.compressionMethod === 8) return inflateRawSync(compressed)
  throw new Error(`Unsupported ZIP compression method ${entry.compressionMethod}`)
}

function clean(value: unknown): string | null {
  if (value === null || value === undefined) return null
  const text = String(value).trim()
  if (!text || text.toUpperCase() === 'NULL') return null
  return text
}

function normalizePlate(value: unknown): string | null {
  const plate = clean(value)?.toUpperCase().replace(/[^A-Z0-9]/g, '') ?? null
  return plate && plate.length >= 5 && plate.length <= 8 ? plate : null
}

function toIsoDate(value: unknown): string | null {
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return value.toISOString().slice(0, 10)
  }
  if (typeof value === 'number' && Number.isFinite(value)) {
    const parsed = XLSX.SSF.parse_date_code(value)
    if (parsed) return `${parsed.y}-${String(parsed.m).padStart(2, '0')}-${String(parsed.d).padStart(2, '0')}`
  }
  const text = clean(value)
  if (!text) return null
  const match = text.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{2,4})$/)
  if (!match) return null
  const month = Number(match[1])
  const day = Number(match[2])
  const year = Number(match[3]) < 100 ? 2000 + Number(match[3]) : Number(match[3])
  const date = new Date(Date.UTC(year, month - 1, day))
  if (date.getUTCFullYear() !== year || date.getUTCMonth() !== month - 1 || date.getUTCDate() !== day) return null
  return date.toISOString().slice(0, 10)
}

function resultLabel(code: string | null): string | null {
  if (code === 'A') return 'APROBADO'
  if (code === 'R') return 'RECHAZADO'
  return code
}

function deduplicateRows(rows: ImportRow[]): { rows: ImportRow[]; duplicates: number } {
  const unique = new Map<string, ImportRow>()
  for (const row of rows) {
    const key = [row.batch_id, row.plate_normalized, row.inspection_date ?? '', row.certificate_number ?? ''].join('|')
    unique.set(key, row)
  }
  return { rows: [...unique.values()], duplicates: rows.length - unique.size }
}

function buildRows(xlsxBuffer: Buffer, batch: { id: string; period: string }): { rows: ImportRow[]; rejected: number; duplicates: number } {
  const workbook = XLSX.read(xlsxBuffer, { type: 'buffer', cellDates: true })
  const sheetName = workbook.SheetNames[0]
  if (!sheetName) throw new Error('PRT workbook has no sheets')
  const sheet = workbook.Sheets[sheetName]
  const sourceRows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, { raw: true, defval: null })
  const candidateRows: ImportRow[] = []
  let rejected = 0

  for (const source of sourceRows) {
    const plateNormalized = normalizePlate(source.PPU)
    const inspectionDate = toIsoDate(source.FEC_REVISION)
    const certificateNumber = clean(source.NUM_CERTIFICADO)
    if (!plateNormalized || !inspectionDate || !certificateNumber) {
      rejected += 1
      continue
    }
    const resultCode = clean(source.RESULTADO_CRT)?.toUpperCase() ?? null
    candidateRows.push({
      batch_id: batch.id,
      plate: clean(source.PPU) ?? plateNormalized,
      plate_normalized: plateNormalized,
      record_type: 'RA1',
      inspection_date: inspectionDate,
      expiration_date: toIsoDate(source.FEC_VENCIMIENTO),
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
        FEC_VENCIMIENTO: toIsoDate(source.FEC_VENCIMIENTO),
        RESULTADO_CRT: resultCode,
        FEC_VENCIMIENTO_GASES: toIsoDate(source.FEC_VENCIMIENTO_GASES),
        RESULTADO_CRT_GASES: clean(source.RESULTADO_CRT_GASES),
      },
    })
  }

  const deduplicated = deduplicateRows(candidateRows)
  return { rows: deduplicated.rows, rejected, duplicates: deduplicated.duplicates }
}

export async function GET(request: NextRequest) {
  if (!isAuthorized(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const supabase = createAdminClient()
  const { data: batch, error: batchError } = await supabase
    .from('prt_import_batches')
    .select('id, period, record_type, source_url, status')
    .eq('status', 'profiled')
    .eq('record_type', 'RA1')
    .order('period', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (batchError) return NextResponse.json({ error: batchError.message }, { status: 500 })
  if (!batch) return NextResponse.json({ imported: 0, reason: 'no_profiled_ra1_batch' })

  const { data: locked, error: lockError } = await supabase
    .from('prt_import_batches')
    .update({ status: 'importing', started_at: new Date().toISOString(), error_message: null })
    .eq('id', batch.id)
    .eq('status', 'profiled')
    .select('id')
    .maybeSingle()

  if (lockError) return NextResponse.json({ error: lockError.message }, { status: 500 })
  if (!locked) return NextResponse.json({ imported: 0, reason: 'batch_already_claimed' })

  try {
    const response = await fetch(batch.source_url, {
      cache: 'no-store',
      redirect: 'follow',
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; LABBE-PRT-Importer/1.1)' },
    })
    if (!response.ok) throw new Error(`PRT ZIP download failed with HTTP ${response.status}`)

    const zipBuffer = Buffer.from(await response.arrayBuffer())
    const xlsxEntry = listZipEntries(zipBuffer).find((entry) => /\.xlsx$/i.test(entry.name))
    if (!xlsxEntry) throw new Error('No XLSX file found inside PRT ZIP')
    const xlsxBuffer = extractEntry(zipBuffer, xlsxEntry)
    const { rows, rejected, duplicates } = buildRows(xlsxBuffer, { id: batch.id, period: batch.period })

    let imported = 0
    for (let offset = 0; offset < rows.length; offset += UPSERT_CHUNK_SIZE) {
      const chunk = rows.slice(offset, offset + UPSERT_CHUNK_SIZE)
      const { error } = await supabase.from('prt_vehicle_records').upsert(chunk, {
        onConflict: 'batch_id,plate_normalized,inspection_date,certificate_number',
        ignoreDuplicates: false,
      })
      if (error) throw new Error(`PRT upsert failed at row ${offset + 1}: ${error.message}`)
      imported += chunk.length
      await supabase
        .from('prt_import_batches')
        .update({ rows_read: imported + rejected + duplicates, rows_valid: imported, rows_rejected: rejected + duplicates, updated_at: new Date().toISOString() })
        .eq('id', batch.id)
    }

    const completedAt = new Date().toISOString()
    const { error: updateError } = await supabase
      .from('prt_import_batches')
      .update({
        status: 'imported',
        rows_read: rows.length + rejected + duplicates,
        rows_valid: imported,
        rows_rejected: rejected + duplicates,
        completed_at: completedAt,
        updated_at: completedAt,
      })
      .eq('id', batch.id)
    if (updateError) throw new Error(updateError.message)

    return NextResponse.json({
      imported,
      rejected,
      duplicates,
      rowsRead: rows.length + rejected + duplicates,
      batch: { id: batch.id, period: batch.period, recordType: batch.record_type },
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown PRT import error'
    await supabase
      .from('prt_import_batches')
      .update({ status: 'failed', error_message: message, updated_at: new Date().toISOString() })
      .eq('id', batch.id)
    return NextResponse.json({ error: message, batchId: batch.id }, { status: 500 })
  }
}
