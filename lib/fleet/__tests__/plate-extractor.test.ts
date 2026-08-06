import {
  extractPlateCandidates,
  isVehicleRelatedDocument,
  normalizePlate,
} from '@/lib/fleet/plate-extractor'

describe('plate extractor', () => {
  it('normalizes formatted Chilean plates', () => {
    expect(normalizePlate('cdgl-97')).toBe('CDGL97')
    expect(normalizePlate('FXRL 20')).toBe('FXRL20')
  })

  it.each([
    ['CRT_CDGL-97.pdf', 'CDGL97'],
    ['revision_CTHX29.pdf', 'CTHX29'],
    ['certificado FXRL 20.png', 'FXRL20'],
    ['padron ABC-123.pdf', 'ABC123'],
    ['vehiculo AB-1234.pdf', 'AB1234'],
  ])('extracts %s as %s', (fileName, expected) => {
    expect(extractPlateCandidates({ fileName })).toEqual([
      expect.objectContaining({ plate: expected, source: 'file_name', confidence: 0.96 }),
    ])
  })

  it('extracts a plate from existing OCR text', () => {
    const candidates = extractPlateCandidates({
      ocrText: 'PLACA PATENTE UNICA / PPU: CTHX-29',
    })

    expect(candidates).toEqual([
      expect.objectContaining({ plate: 'CTHX29', source: 'ocr_text', confidence: 0.9 }),
    ])
  })

  it('deduplicates the same plate and keeps the strongest source', () => {
    const candidates = extractPlateCandidates({
      fileName: 'CRT_CDGL97.pdf',
      ocrText: 'PPU CDGL-97',
    })

    expect(candidates).toEqual([
      expect.objectContaining({ plate: 'CDGL97', source: 'file_name', confidence: 0.96 }),
    ])
  })

  it('does not accept arbitrary long identifiers as plates', () => {
    expect(extractPlateCandidates({
      ocrText: 'VIN 93SAJAHR49R692258 CERTIFICADO A1315000000118741',
    })).toEqual([])
  })

  it('identifies documents that should enter the existing OCR pipeline', () => {
    expect(isVehicleRelatedDocument({ fileName: 'revision_tecnica_camion.pdf' })).toBe(true)
    expect(isVehicleRelatedDocument({ documentType: 'Permiso de circulación' })).toBe(true)
    expect(isVehicleRelatedDocument({ fileName: 'liquidacion_sueldo.pdf' })).toBe(false)
  })
})
