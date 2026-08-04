import { NextRequest, NextResponse } from 'next/server'
import { inflateRawSync } from 'node:zlib'
import * as XLSX from 'xlsx'
import { createAdminClient } from '@/lib/supabase/admin'

export const dynamic = 'force-dynamic'
export const revalidate = 0
export const maxDuration = 120

function isAuthorized(request: NextRequest): boolean {
  const secret = process.env.CRON_SECRET
  if (!secret) return true
  return request.headers.get('authorization') === `Bearer ${secret}`
}

type ZipEntry = {
  name: string
  compressionMethod: number
  compressedSize: number
  uncompressedSize: number
  localHeaderOffset: number
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

function normalizeHeader(value: unknown): string {
  return String(value ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .replace(/\s+/g, ' ')
}

function profileWorkbook(xlsxBuffer: Buffer) {
  const workbook = XLSX.read(xlsxBuffer, { type: 'buffer', cellDates: true, dense: true })
  const sheets = workbook.SheetNames.map((sheetName) => {
    const sheet = workbook.Sheets[sheetName]
    const matrix = XLSX.utils.sheet_to_json<unknown[]>(sheet, {
      header: 1,
      raw: false,
      defval: '',
      blankrows: false,
    })

    const headerIndex = matrix.findIndex((row) => {
      const nonEmpty = row.filter((cell) => normalizeHeader(cell) !== '').length
      return nonEmpty >= 3
    })
    const headers = headerIndex >= 0 ? matrix[headerIndex].map(normalizeHeader) : []
    const samples = headerIndex >= 0
      ? matrix.slice(headerIndex + 1, headerIndex + 6).map((row) =>
          Object.fromEntries(headers.map((header, index) => [header || `column_${index + 1}`, row[index] ?? ''])),
        )
      : []

    return {
      name: sheetName,
      range: sheet['!ref'] ?? null,
      headerRow: headerIndex >= 0 ? headerIndex + 1 : null,
      headers,
      sampleRows: samples,
      estimatedRows: matrix.length,
    }
  })

  return { sheetNames: workbook.SheetNames, sheets }
}

export async function GET(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createAdminClient()
  const { data: batch, error: batchError } = await supabase
    .from('prt_import_batches')
    .select('id, period, record_type, source_url, status')
    .eq('status', 'inspected')
    .order('period', { ascending: false })
    .order('record_type', { ascending: true })
    .limit(1)
    .maybeSingle()

  if (batchError) return NextResponse.json({ error: batchError.message }, { status: 500 })
  if (!batch) return NextResponse.json({ profiled: 0, reason: 'no_inspected_batch' })

  const { error: lockError } = await supabase
    .from('prt_import_batches')
    .update({ status: 'profiling', started_at: new Date().toISOString(), error_message: null })
    .eq('id', batch.id)
    .eq('status', 'inspected')

  if (lockError) return NextResponse.json({ error: lockError.message }, { status: 500 })

  try {
    const response = await fetch(batch.source_url, {
      cache: 'no-store',
      redirect: 'follow',
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; LABBE-PRT-Profiler/1.0)' },
    })
    if (!response.ok) throw new Error(`PRT ZIP download failed with HTTP ${response.status}`)

    const zipBuffer = Buffer.from(await response.arrayBuffer())
    const xlsxEntry = listZipEntries(zipBuffer).find((entry) => /\.xlsx$/i.test(entry.name))
    if (!xlsxEntry) throw new Error('No XLSX file found inside PRT ZIP')

    const xlsxBuffer = extractEntry(zipBuffer, xlsxEntry)
    if (xlsxBuffer.length !== xlsxEntry.uncompressedSize) {
      throw new Error(`XLSX size mismatch: expected ${xlsxEntry.uncompressedSize}, got ${xlsxBuffer.length}`)
    }

    const workbookProfile = profileWorkbook(xlsxBuffer)
    const profile = {
      archiveEntry: xlsxEntry.name,
      workbookSizeBytes: xlsxBuffer.length,
      ...workbookProfile,
      profiledAt: new Date().toISOString(),
    }

    const { error: updateError } = await supabase
      .from('prt_import_batches')
      .update({ status: 'profiled', workbook_profile: profile, updated_at: new Date().toISOString() })
      .eq('id', batch.id)

    if (updateError) throw new Error(updateError.message)

    return NextResponse.json({
      profiled: 1,
      batch: {
        id: batch.id,
        period: batch.period,
        recordType: batch.record_type,
        sourceUrl: batch.source_url,
      },
      profile,
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown PRT workbook profiling error'
    await supabase
      .from('prt_import_batches')
      .update({ status: 'failed', error_message: message, updated_at: new Date().toISOString() })
      .eq('id', batch.id)

    return NextResponse.json({ error: message, batchId: batch.id }, { status: 500 })
  }
}
