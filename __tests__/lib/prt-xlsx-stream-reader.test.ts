import { Readable } from 'node:stream'
import * as XLSX from 'xlsx'
import { readPrtWorkbookRows } from '@/lib/prt-xlsx-stream-reader'

function workbookBuffer() {
  const workbook = XLSX.utils.book_new()
  const worksheet = XLSX.utils.aoa_to_sheet([
    ['PPU', 'FEC_REVISION', 'NUM_CERTIFICADO', 'RESULTADO_CRT'],
    ['ABCD12', 45500, 'CERT-1', 'A'],
    ['EFGH34', 45501, 'CERT-2', 'R'],
  ])
  XLSX.utils.book_append_sheet(workbook, worksheet, 'PRT')
  return XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx', bookSST: true }) as Buffer
}

describe('readPrtWorkbookRows', () => {
  it('resolves shared strings without temporary worksheet files', async () => {
    const result = await readPrtWorkbookRows(Readable.from(workbookBuffer()), 0, 10)

    expect(result.processed).toBe(2)
    expect(result.reachedLimit).toBe(false)
    expect(result.rows).toEqual([
      { PPU: 'ABCD12', FEC_REVISION: 45500, NUM_CERTIFICADO: 'CERT-1', RESULTADO_CRT: 'A' },
      { PPU: 'EFGH34', FEC_REVISION: 45501, NUM_CERTIFICADO: 'CERT-2', RESULTADO_CRT: 'R' },
    ])
  })

  it('honors source cursor and per-run limit', async () => {
    const result = await readPrtWorkbookRows(Readable.from(workbookBuffer()), 1, 1)

    expect(result.processed).toBe(1)
    expect(result.reachedLimit).toBe(true)
    expect(result.rows).toEqual([
      { PPU: 'EFGH34', FEC_REVISION: 45501, NUM_CERTIFICADO: 'CERT-2', RESULTADO_CRT: 'R' },
    ])
  })
})
