import { createHash } from 'node:crypto'
import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export const dynamic = 'force-dynamic'
export const revalidate = 0
export const maxDuration = 60

const MAX_ARCHIVE_BYTES = 250 * 1024 * 1024

type ZipEntry = {
  name: string
  compressedSize: number
  uncompressedSize: number
  compressionMethod: number
  crc32: string
  isDirectory: boolean
}

function isAuthorized(request: NextRequest): boolean {
  const secret = process.env.CRON_SECRET
  if (!secret) return true
  return request.headers.get('authorization') === `Bearer ${secret}`
}

function findEndOfCentralDirectory(buffer: Buffer): number {
  const minimumOffset = Math.max(0, buffer.length - 65_557)
  for (let offset = buffer.length - 22; offset >= minimumOffset; offset -= 1) {
    if (buffer.readUInt32LE(offset) === 0x06054b50) return offset
  }
  throw new Error('ZIP end-of-central-directory record not found')
}

function inspectZip(buffer: Buffer): ZipEntry[] {
  const eocdOffset = findEndOfCentralDirectory(buffer)
  const entryCount = buffer.readUInt16LE(eocdOffset + 10)
  const centralDirectoryOffset = buffer.readUInt32LE(eocdOffset + 16)
  const entries: ZipEntry[] = []
  let offset = centralDirectoryOffset

  for (let index = 0; index < entryCount; index += 1) {
    if (offset + 46 > buffer.length || buffer.readUInt32LE(offset) !== 0x02014b50) {
      throw new Error(`Invalid ZIP central directory entry at index ${index}`)
    }

    const compressionMethod = buffer.readUInt16LE(offset + 10)
    const crc32 = buffer.readUInt32LE(offset + 16).toString(16).padStart(8, '0')
    const compressedSize = buffer.readUInt32LE(offset + 20)
    const uncompressedSize = buffer.readUInt32LE(offset + 24)
    const fileNameLength = buffer.readUInt16LE(offset + 28)
    const extraLength = buffer.readUInt16LE(offset + 30)
    const commentLength = buffer.readUInt16LE(offset + 32)
    const nameStart = offset + 46
    const nameEnd = nameStart + fileNameLength

    if (nameEnd > buffer.length) throw new Error('Invalid ZIP filename boundary')

    const name = buffer.subarray(nameStart, nameEnd).toString('utf8')
    entries.push({
      name,
      compressedSize,
      uncompressedSize,
      compressionMethod,
      crc32,
      isDirectory: name.endsWith('/'),
    })

    offset = nameEnd + extraLength + commentLength
  }

  return entries
}

export async function GET(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createAdminClient()
  const { data: batch, error: selectError } = await supabase
    .from('prt_import_batches')
    .select('id, period, record_type, source_url, status')
    .eq('status', 'discovered')
    .order('period', { ascending: false })
    .order('record_type', { ascending: true })
    .limit(1)
    .maybeSingle()

  if (selectError) {
    return NextResponse.json({ error: selectError.message }, { status: 500 })
  }

  if (!batch) {
    return NextResponse.json({ inspected: 0, message: 'No discovered PRT batches pending inspection' })
  }

  const startedAt = new Date().toISOString()
  const { error: lockError } = await supabase
    .from('prt_import_batches')
    .update({ status: 'inspecting', started_at: startedAt, error_message: null })
    .eq('id', batch.id)
    .eq('status', 'discovered')

  if (lockError) {
    return NextResponse.json({ error: lockError.message }, { status: 500 })
  }

  try {
    const response = await fetch(batch.source_url, {
      cache: 'no-store',
      redirect: 'follow',
      headers: {
        Accept: 'application/zip,application/octet-stream,*/*',
        'User-Agent': 'Mozilla/5.0 (compatible; LABBE-PRT-Importer/1.0)',
      },
    })

    if (!response.ok) throw new Error(`PRT archive download failed with HTTP ${response.status}`)

    const declaredLength = Number(response.headers.get('content-length') || 0)
    if (declaredLength > MAX_ARCHIVE_BYTES) {
      throw new Error(`PRT archive exceeds ${MAX_ARCHIVE_BYTES} bytes`)
    }

    const arrayBuffer = await response.arrayBuffer()
    if (arrayBuffer.byteLength === 0) throw new Error('PRT archive is empty')
    if (arrayBuffer.byteLength > MAX_ARCHIVE_BYTES) {
      throw new Error(`PRT archive exceeds ${MAX_ARCHIVE_BYTES} bytes`)
    }

    const buffer = Buffer.from(arrayBuffer)
    const sourceHash = createHash('sha256').update(buffer).digest('hex')
    const entries = inspectZip(buffer)
    const dataEntries = entries.filter((entry) => !entry.isDirectory)

    if (dataEntries.length === 0) throw new Error('PRT archive contains no files')

    const { error: updateError } = await supabase
      .from('prt_import_batches')
      .update({
        status: 'inspected',
        source_hash: sourceHash,
        source_size_bytes: buffer.length,
        archive_entries: entries,
        inspected_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        error_message: null,
      })
      .eq('id', batch.id)

    if (updateError) throw new Error(updateError.message)

    return NextResponse.json({
      inspected: 1,
      batch: {
        id: batch.id,
        period: batch.period,
        recordType: batch.record_type,
        sourceUrl: batch.source_url,
        sourceSizeBytes: buffer.length,
        sourceHash,
        entries,
      },
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown PRT inspection error'
    await supabase
      .from('prt_import_batches')
      .update({
        status: 'failed',
        error_message: message,
        updated_at: new Date().toISOString(),
      })
      .eq('id', batch.id)

    return NextResponse.json({ error: message, batchId: batch.id }, { status: 500 })
  }
}
