import type { Readable } from 'node:stream'
import * as unzipper from 'unzipper'

type SharedStringRef = { sharedString: number }
type RawValue = string | number | boolean | null | SharedStringRef
type RawRow = Record<string, RawValue>

type StreamRowsResult = {
  rows: Array<Record<string, unknown>>
  processed: number
  reachedLimit: boolean
}

function decodeXml(value: string): string {
  return value
    .replace(/&#x([0-9a-fA-F]+);/g, (_, code) => String.fromCodePoint(Number.parseInt(code, 16)))
    .replace(/&#([0-9]+);/g, (_, code) => String.fromCodePoint(Number.parseInt(code, 10)))
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
}

function attr(source: string, name: string): string | null {
  const match = source.match(new RegExp(`\\b${name}=["']([^"']*)["']`, 'i'))
  return match ? decodeXml(match[1]) : null
}

function columnFromReference(reference: string | null): string | null {
  if (!reference) return null
  return reference.match(/^[A-Z]+/i)?.[0]?.toUpperCase() ?? null
}

function textNodes(xml: string): string {
  return [...xml.matchAll(/<t(?:\s[^>]*)?>([\s\S]*?)<\/t>/gi)]
    .map((match) => decodeXml(match[1]))
    .join('')
}

function parseCell(attributes: string, body: string): [string, RawValue] | null {
  const column = columnFromReference(attr(attributes, 'r'))
  if (!column) return null

  const type = attr(attributes, 't')
  if (type === 'inlineStr') return [column, textNodes(body)]

  const raw = body.match(/<v(?:\s[^>]*)?>([\s\S]*?)<\/v>/i)?.[1]
  if (raw === undefined) return [column, null]
  const decoded = decodeXml(raw).trim()

  if (type === 's') {
    const index = Number(decoded)
    return [column, Number.isInteger(index) && index >= 0 ? { sharedString: index } : null]
  }
  if (type === 'b') return [column, decoded === '1' || decoded.toLowerCase() === 'true']
  if (type === 'str' || type === 'e') return [column, decoded]

  const numeric = Number(decoded)
  return [column, decoded !== '' && Number.isFinite(numeric) ? numeric : decoded]
}

function parseRow(xml: string): RawRow {
  const row: RawRow = {}
  const cellPattern = /<c\b([^>]*)>([\s\S]*?)<\/c>|<c\b([^>]*)\/>/gi
  for (const match of xml.matchAll(cellPattern)) {
    const parsed = parseCell(match[1] ?? match[3] ?? '', match[2] ?? '')
    if (parsed) row[parsed[0]] = parsed[1]
  }
  return row
}

async function parseSharedStrings(stream: NodeJS.ReadableStream): Promise<string[]> {
  const values: string[] = []
  let buffer = ''

  for await (const chunk of stream as AsyncIterable<Buffer | string>) {
    buffer += Buffer.isBuffer(chunk) ? chunk.toString('utf8') : String(chunk)

    while (true) {
      const start = buffer.indexOf('<si')
      if (start < 0) {
        if (buffer.length > 32) buffer = buffer.slice(-32)
        break
      }
      const openEnd = buffer.indexOf('>', start)
      if (openEnd < 0) {
        buffer = buffer.slice(start)
        break
      }
      const end = buffer.indexOf('</si>', openEnd + 1)
      if (end < 0) {
        buffer = buffer.slice(start)
        break
      }

      values.push(textNodes(buffer.slice(openEnd + 1, end)))
      buffer = buffer.slice(end + 5)
    }
  }

  return values
}

async function parseWorksheet(
  stream: NodeJS.ReadableStream,
  cursor: number,
  limit: number,
): Promise<{ header: RawRow | null; rows: RawRow[]; processed: number; reachedLimit: boolean }> {
  let buffer = ''
  let header: RawRow | null = null
  const rows: RawRow[] = []
  let sourceRowIndex = 0
  let processed = 0
  let reachedLimit = false
  let drainOnly = false

  for await (const chunk of stream as AsyncIterable<Buffer | string>) {
    if (drainOnly) continue
    buffer += Buffer.isBuffer(chunk) ? chunk.toString('utf8') : String(chunk)

    while (true) {
      const start = buffer.indexOf('<row')
      if (start < 0) {
        if (buffer.length > 64) buffer = buffer.slice(-64)
        break
      }
      const openEnd = buffer.indexOf('>', start)
      if (openEnd < 0) {
        buffer = buffer.slice(start)
        break
      }
      const end = buffer.indexOf('</row>', openEnd + 1)
      if (end < 0) {
        buffer = buffer.slice(start)
        break
      }

      const row = parseRow(buffer.slice(openEnd + 1, end))
      buffer = buffer.slice(end + 6)

      if (!header) {
        header = row
        continue
      }

      sourceRowIndex += 1
      if (sourceRowIndex <= cursor) continue

      processed += 1
      rows.push(row)
      if (processed >= limit) {
        reachedLimit = true
        drainOnly = true
        buffer = ''
        break
      }
    }
  }

  return { header, rows, processed, reachedLimit }
}

function resolve(value: RawValue, sharedStrings: string[]): unknown {
  if (value && typeof value === 'object' && 'sharedString' in value) {
    return sharedStrings[value.sharedString] ?? null
  }
  return value
}

function resolveRows(header: RawRow | null, rows: RawRow[], sharedStrings: string[]): Array<Record<string, unknown>> {
  if (!header) return []
  const headers = new Map<string, string>()
  for (const [column, raw] of Object.entries(header)) {
    const value = resolve(raw, sharedStrings)
    const name = String(value ?? '').trim()
    if (name) headers.set(column, name)
  }

  return rows.map((row) => {
    const output: Record<string, unknown> = {}
    for (const [column, raw] of Object.entries(row)) {
      const name = headers.get(column)
      if (name) output[name] = resolve(raw, sharedStrings)
    }
    return output
  })
}

export async function readPrtWorkbookRows(
  workbookStream: Readable,
  cursor: number,
  limit: number,
): Promise<StreamRowsResult> {
  const zip = unzipper.Parse({ forceStream: true })
  workbookStream.pipe(zip)

  let sharedStrings: string[] = []
  let worksheet: Awaited<ReturnType<typeof parseWorksheet>> | null = null

  for await (const entry of zip) {
    const path = String(entry.path ?? '')
    if (path === 'xl/sharedStrings.xml') {
      sharedStrings = await parseSharedStrings(entry)
    } else if (path === 'xl/worksheets/sheet1.xml') {
      worksheet = await parseWorksheet(entry, cursor, limit)
    } else {
      entry.autodrain()
    }
  }

  if (!worksheet?.header) throw new Error('PRT workbook has no readable first worksheet')

  return {
    rows: resolveRows(worksheet.header, worksheet.rows, sharedStrings),
    processed: worksheet.processed,
    reachedLimit: worksheet.reachedLimit,
  }
}
