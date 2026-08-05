import { PassThrough, Readable } from 'node:stream'
import ExcelJS from 'exceljs'
import * as unzipper from 'unzipper'
import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.SUPABASE_URL
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY
const PERIOD = process.env.PRT_PERIOD || null
const RECORD_TYPE = process.env.PRT_RECORD_TYPE || null
const CHUNK_SIZE = 500
const CHECKPOINT_SIZE = 10_000

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error('SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required')
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
})

function clean(value) {
  if (value === null || value === undefined) return null
  const text = String(value).trim()
  return !text || text.toUpperCase() === 'NULL' ? null : text
}

function normalizePlate(value) {
  const plate = clean(value)?.toUpperCase().replace(/[^A-Z0-9]/g, '') ?? null
  return plate && plate.length >= 5 && plate.length <= 8 ? plate : null
}

function excelDateToIso(value) {
  if (value instanceof Date && !Number.isNaN(value.getTime())) return value.toISOString().slice(0, 10)
  if (typeof value === 'number' && Number.isFinite(value)) {
    const date = new Date(Date.UTC(1899, 11, 30) + Math.floor(value) * 86_400_000)
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
  return date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day
    ? date.toISOString().slice(0, 10)
    : null
}

function normalizeCell(value) {
  if (value && typeof value === 'object') {
    if ('result' in value) return value.result ?? null
    if ('text' in value) return value.text ?? null
    if ('richText' in value) return value.richText?.map((item) => item.text ?? '').join('') ?? null
  }
  return value
}

function rowObject(values, headers) {
  const output = {}
  for (let index = 0; index < headers.length; index += 1) {
    if (headers[index]) output[headers[index]] = values[index + 1] ?? null
  }
  return output
}

function buildImportRow(source, batch) {
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
    result_label: resultCode === 'A' ? 'APROBADO' : resultCode === 'R' ? 'RECHAZADO' : resultCode,
    station_code: clean(source.COD_PRT),
    station_name: null,
    region_code: null,
    vehicle_class: clean(source.COD_VEHICULO),
    certificate_number: certificateNumber,
    source_period: batch.period,
    raw_payload: {
      COD_PRT: clean(source.COD_PRT), PPU: clean(source.PPU), COD_VEHICULO: clean(source.COD_VEHICULO),
      COD_COMBUSTIBLE: clean(source.COD_COMBUSTIBLE), COD_SERVICIO: clean(source.COD_SERVICIO),
      MARCA: clean(source.MARCA), MODELO: clean(source.MODELO), ANO_FABRICACION: clean(source.ANO_FABRICACION),
      NUM_MOTOR: clean(source.NUM_MOTOR), NUM_CHASIS: clean(source.NUM_CHASIS), VIN: clean(source.VIN),
      KILOMETRAJE: clean(source.KILOMETRAJE), NUM_CERTIFICADO: certificateNumber,
      FEC_REVISION: inspectionDate, FEC_VENCIMIENTO: expirationDate, RESULTADO_CRT: resultCode,
      FEC_VENCIMIENTO_GASES: excelDateToIso(source.FEC_VENCIMIENTO_GASES),
      RESULTADO_CRT_GASES: clean(source.RESULTADO_CRT_GASES),
    },
  }
}

async function openWorkbookStream(sourceUrl) {
  const response = await fetch(sourceUrl, {
    redirect: 'follow',
    headers: { 'User-Agent': 'Mozilla/5.0 (compatible; N3uralia-PRT-Worker/1.0)' },
  })
  if (!response.ok || !response.body) throw new Error(`PRT ZIP download failed with HTTP ${response.status}`)
  const zipStream = Readable.fromWeb(response.body)
  const unzipStream = unzipper.ParseOne(/\.xlsx$/i)
  const workbookStream = new PassThrough()
  zipStream.once('error', (error) => workbookStream.destroy(error))
  unzipStream.once('error', (error) => workbookStream.destroy(error))
  zipStream.pipe(unzipStream).pipe(workbookStream)
  return workbookStream
}

async function upsertRows(rows) {
  if (!rows.length) return
  const { error } = await supabase.from('prt_vehicle_records').upsert(rows, {
    onConflict: 'batch_id,plate_normalized,inspection_date,certificate_number',
    ignoreDuplicates: false,
  })
  if (error) throw new Error(`PRT upsert failed: ${error.message}`)
}

async function updateCheckpoint(batch, state, completed = false) {
  const now = new Date().toISOString()
  const { error } = await supabase.from('prt_import_batches').update({
    status: completed ? 'imported' : 'importing',
    source_cursor: state.cursor,
    rows_read: state.cursor,
    rows_valid: state.valid,
    rows_rejected: state.rejected + state.duplicates,
    rows_duplicates: state.duplicates,
    completed_at: completed ? now : null,
    updated_at: now,
    error_message: null,
  }).eq('id', batch.id)
  if (error) throw new Error(`Checkpoint failed: ${error.message}`)
}

async function claimBatch() {
  let query = supabase.from('prt_import_batches')
    .select('id, period, record_type, source_url, status, source_cursor, rows_valid, rows_rejected, rows_duplicates')
    .in('status', ['profiled', 'failed', 'inspected', 'importing'])
    .in('record_type', ['RA2', 'RB'])
  if (PERIOD) query = query.eq('period', PERIOD)
  if (RECORD_TYPE) query = query.eq('record_type', RECORD_TYPE)
  const { data, error } = await query.order('period', { ascending: false }).order('record_type').limit(1).maybeSingle()
  if (error) throw error
  if (!data) return null
  const { data: locked, error: lockError } = await supabase.from('prt_import_batches')
    .update({ status: 'importing', started_at: new Date().toISOString(), error_message: null })
    .eq('id', data.id).in('status', ['profiled', 'failed', 'inspected', 'importing']).select('id').maybeSingle()
  if (lockError) throw lockError
  return locked ? data : null
}

const batch = await claimBatch()
if (!batch) {
  console.log('No eligible PRT batch found')
  process.exit(0)
}

const state = {
  cursor: Number(batch.source_cursor ?? 0),
  valid: Number(batch.rows_valid ?? 0),
  rejected: Math.max(0, Number(batch.rows_rejected ?? 0) - Number(batch.rows_duplicates ?? 0)),
  duplicates: Number(batch.rows_duplicates ?? 0),
}

try {
  const workbookStream = await openWorkbookStream(batch.source_url)
  const reader = new ExcelJS.stream.xlsx.WorkbookReader(workbookStream, {
    entries: 'emit', sharedStrings: 'cache', hyperlinks: 'ignore', styles: 'ignore', worksheets: 'emit',
  })
  let headers = []
  let sourceRowIndex = 0
  let sinceCheckpoint = 0
  const pending = []
  const seen = new Set()

  outer: for await (const worksheet of reader) {
    for await (const row of worksheet) {
      const values = row.values.map(normalizeCell)
      if (!headers.length) {
        headers = values.slice(1).map((value) => String(value ?? '').trim())
        continue
      }
      sourceRowIndex += 1
      if (sourceRowIndex <= state.cursor) continue

      const record = buildImportRow(rowObject(values, headers), batch)
      if (!record) state.rejected += 1
      else {
        const key = `${record.plate_normalized}|${record.inspection_date}|${record.certificate_number}`
        if (seen.has(key)) state.duplicates += 1
        else {
          seen.add(key)
          pending.push(record)
          state.valid += 1
        }
      }
      state.cursor += 1
      sinceCheckpoint += 1

      if (pending.length >= CHUNK_SIZE) await upsertRows(pending.splice(0, pending.length))
      if (sinceCheckpoint >= CHECKPOINT_SIZE) {
        await upsertRows(pending.splice(0, pending.length))
        await updateCheckpoint(batch, state)
        console.log(JSON.stringify({ batch: batch.id, ...state }))
        sinceCheckpoint = 0
        seen.clear()
      }
    }
    break outer
  }

  await upsertRows(pending)
  await updateCheckpoint(batch, state, true)
  console.log(JSON.stringify({ completed: true, batch: batch.id, ...state }))
} catch (error) {
  const message = error instanceof Error ? error.message : String(error)
  await supabase.from('prt_import_batches').update({
    status: 'failed', source_cursor: state.cursor, rows_read: state.cursor,
    rows_valid: state.valid, rows_rejected: state.rejected + state.duplicates,
    rows_duplicates: state.duplicates, error_message: message, updated_at: new Date().toISOString(),
  }).eq('id', batch.id)
  throw error
}
