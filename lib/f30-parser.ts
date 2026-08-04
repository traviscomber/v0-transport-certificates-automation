export type F30Status =
  | 'valid'
  | 'warning'
  | 'rut_mismatch'
  | 'analysis_failed'

export type F30Details = {
  detected: boolean
  documentRut: string | null
  expectedRut: string | null
  companyName: string | null
  principalCompany: string | null
  periodMonth: number | null
  periodYear: number | null
  workers: number | null
  remunerationAmount: number | null
  certificateNumber: string | null
  issuanceDate: string | null
  confidence: number | null
  warnings: string[]
}

const MONTHS: Record<string, number> = {
  enero: 1,
  febrero: 2,
  marzo: 3,
  abril: 4,
  mayo: 5,
  junio: 6,
  julio: 7,
  agosto: 8,
  septiembre: 9,
  setiembre: 9,
  octubre: 10,
  noviembre: 11,
  diciembre: 12,
}

function normalizeRut(value: string | null | undefined): string | null {
  if (!value) return null
  const clean = value.toUpperCase().replace(/[^0-9K]/g, '')
  if (clean.length < 2) return null
  return `${clean.slice(0, -1)}-${clean.slice(-1)}`
}

function cleanCompanyName(value: string | null): string | null {
  if (!value) return null
  return value
    .replace(/^subcontratista\s*,?\s*/i, '')
    .replace(/\s+/g, ' ')
    .replace(/[;,]+$/g, '')
    .trim() || null
}

export function parseF30Document(input: {
  rawText: string
  summaryText?: string | null
  expectedRut?: string | null
  documentNumber?: string | null
  issuanceDate?: string | null
  confidence?: number | null
  warnings?: string[] | null
}): { status: F30Status; details: F30Details } | null {
  const rawText = input.rawText || ''
  const summaryText = input.summaryText || ''
  const combinedText = `${summaryText}\n${rawText}`
  const normalized = combinedText.toLowerCase()
  const detected =
    normalized.includes('cumplimiento de obligaciones laborales') ||
    normalized.includes('obligaciones laborales y previsionales') ||
    normalized.includes('f30-1')

  if (!detected) return null

  const rutMatch = rawText.match(/\b(\d{1,2}(?:\.\d{3}){2}-[0-9Kk]|\d{7,8}-[0-9Kk])\b/)
  const documentRut = normalizeRut(rutMatch?.[1])
  const expectedRut = normalizeRut(input.expectedRut)

  const summaryCompanyMatch = summaryText.match(
    /(?:empresa|empleador)\s+(.+?)\s+(?:cumple|como subcontratista|mantiene|acredita)/i,
  )
  const summaryPrincipalMatch = summaryText.match(
    /empresa principal\s+(.+?)(?=\s+para\s+el\s+periodo|\s+para\s+el\s+período|\s+durante\s+el\s+periodo|\s+durante\s+el\s+período|\s+se\s+reporta|\s+con\s+\d|$)/i,
  )
  const rawCompanyMatch = rawText.match(
    /(?:raz[oó]n social|nombre o raz[oó]n social)\s*[:\-]?\s*([^\n]{4,180})/i,
  )
  const rawPrincipalMatch = rawText.match(
    /(?:empresa principal|mandante)\s*[:\-]?\s*([^\n]{4,180})/i,
  )

  let periodMonth: number | null = null
  let periodYear: number | null = null
  for (const [monthName, monthNumber] of Object.entries(MONTHS)) {
    const match = normalized.match(new RegExp(`\\b${monthName}\\s+(?:de\\s+)?(20\\d{2})\\b`, 'i'))
    if (match) {
      periodMonth = monthNumber
      periodYear = Number(match[1])
      break
    }
  }

  const workersMatch = combinedText.match(/(?:trabajadores?|n[uú]mero de trabajadores?)\D{0,25}(\d{1,5})/i)
  const amountMatch = combinedText.match(/(?:remuneraciones?|monto(?: total)?)\D{0,50}\$\s*([\d.]{3,})/i)
  const remunerationAmount = amountMatch
    ? Number(amountMatch[1].replace(/\./g, ''))
    : null

  const warnings = input.warnings ?? []
  let status: F30Status = warnings.length > 0 ? 'warning' : 'valid'
  if (expectedRut && documentRut && expectedRut !== documentRut) {
    status = 'rut_mismatch'
  }

  return {
    status,
    details: {
      detected: true,
      documentRut,
      expectedRut,
      companyName: cleanCompanyName(summaryCompanyMatch?.[1] ?? rawCompanyMatch?.[1] ?? null),
      principalCompany: cleanCompanyName(summaryPrincipalMatch?.[1] ?? rawPrincipalMatch?.[1] ?? null),
      periodMonth,
      periodYear,
      workers: workersMatch ? Number(workersMatch[1]) : null,
      remunerationAmount,
      certificateNumber: input.documentNumber ?? null,
      issuanceDate: input.issuanceDate ?? null,
      confidence: input.confidence ?? null,
      warnings,
    },
  }
}
