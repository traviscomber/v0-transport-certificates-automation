import {
  extractPlateCandidates,
  isVehicleRelatedDocument,
  normalizePlate,
} from '@/lib/fleet/plate-extractor'

describe('plate extractor', () => {
  test('normalizes separators without changing plate characters', () => {
    expect(normalizePlate('AB-CD-12')).toBe('ABCD12')
    expect(normalizePlate('aa.bb.123')).toBe('AABB123')
  })

  test('extracts modern Chilean plate from filename', () => {
    expect(extractPlateCandidates({ fileName: 'FOTO PATENTE ABCD-12.jpeg' })).toEqual([
      expect.objectContaining({ plate: 'ABCD12', source: 'file_name' }),
    ])
  })

  test('extracts historical plate formats from OCR text', () => {
    const plates = extractPlateCandidates({
      ocrText: 'Patentes observadas: ABC 123 y AB 1234',
    }).map((candidate) => candidate.plate)

    expect(plates).toContain('ABC123')
    expect(plates).toContain('AB1234')
  })

  test('deduplicates the same plate found in filename and OCR text', () => {
    const plates = extractPlateCandidates({
      fileName: 'camion ABCD12.jpg',
      ocrText: 'PPU ABCD-12',
    })

    expect(plates).toHaveLength(1)
    expect(plates[0]).toMatchObject({ plate: 'ABCD12', source: 'file_name' })
  })

  test('classifies vehicle evidence independently from labor documents', () => {
    expect(isVehicleRelatedDocument({ fileName: 'PATENTE CAMION.pdf' })).toBe(true)
    expect(isVehicleRelatedDocument({ documentType: 'REVISION TECNICA' })).toBe(true)
    expect(isVehicleRelatedDocument({ fileName: 'Liquidacion sueldo julio.pdf' })).toBe(false)
    expect(isVehicleRelatedDocument({ fileName: 'Comprobante de pago sueldo.jpeg' })).toBe(false)
    expect(isVehicleRelatedDocument({ fileName: 'F30-1 LTS.pdf' })).toBe(false)
  })
})
