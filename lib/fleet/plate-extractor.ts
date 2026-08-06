const PLATE_PATTERNS = [
  /\b([A-Z]{4})[\s.-]?([0-9]{2})\b/g,
  /\b([A-Z]{3})[\s.-]?([0-9]{3})\b/g,
  /\b([A-Z]{2})[\s.-]?([0-9]{4})\b/g,
]

const VEHICLE_KEYWORDS = [
  'revision tecnica',
  'certificado de revision',
  'permiso de circulacion',
  'padron',
  'vehiculo',
  'camion',
  'tractocamion',
  'patente',
  'ppu',
]

export type PlateCandidate = {
  plate: string
  source: 'file_name' | 'ocr_text'
  confidence: number
}

export function normalizePlate(value: string): string {
  return value.toUpperCase().replace(/[^A-Z0-9]/g, '')
}

function extractFromValue(value: string, source: PlateCandidate['source']): PlateCandidate[] {
  const normalizedText = value
    .toUpperCase()
    .replace(/[_/\\]+/g, ' ')
    .replace(/[^A-Z0-9\s.-]/g, ' ')

  const candidates = new Map<string, PlateCandidate>()

  for (const pattern of PLATE_PATTERNS) {
    for (const match of normalizedText.matchAll(pattern)) {
      const plate = normalizePlate(`${match[1]}${match[2]}`)
      candidates.set(plate, {
        plate,
        source,
        confidence: source === 'file_name' ? 0.96 : 0.9,
      })
    }
  }

  return [...candidates.values()]
}

export function extractPlateCandidates(input: {
  fileName?: string | null
  ocrText?: string | null
}): PlateCandidate[] {
  const combined = new Map<string, PlateCandidate>()

  for (const candidate of extractFromValue(input.fileName ?? '', 'file_name')) {
    combined.set(candidate.plate, candidate)
  }

  for (const candidate of extractFromValue(input.ocrText ?? '', 'ocr_text')) {
    const existing = combined.get(candidate.plate)
    if (!existing || candidate.confidence > existing.confidence) {
      combined.set(candidate.plate, candidate)
    }
  }

  return [...combined.values()]
}

export function isVehicleRelatedDocument(input: {
  fileName?: string | null
  documentType?: string | null
}): boolean {
  const searchable = `${input.fileName ?? ''} ${input.documentType ?? ''}`
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')

  return VEHICLE_KEYWORDS.some((keyword) => searchable.includes(keyword))
}
