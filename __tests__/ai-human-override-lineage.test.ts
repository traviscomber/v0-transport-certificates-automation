import {
  buildHumanOverrideRecord,
  normalizeOverrideValue,
} from '@/lib/ai-human-override-lineage'

describe('AI human override lineage', () => {
  it('records a real field correction with deterministic evidence', () => {
    const input = {
      documentId: 'doc-123',
      documentSource: 'subcontractor_documents',
      fieldName: 'expiration_date',
      aiValue: '2026-09-03T12:00:00Z',
      humanValue: '2026-09-04',
      aiConfidence: 0.94,
      modelName: 'gpt-4o-mini',
      promptRevision: 'document-extraction-v1',
      reviewerId: 'reviewer-1',
      reviewerRole: 'ejecutiva',
      reviewedAt: '2026-09-03T20:00:00-04:00',
    }

    const first = buildHumanOverrideRecord(input)
    const second = buildHumanOverrideRecord(input)

    expect(first).not.toBeNull()
    expect(first?.ai_value).toBe('2026-09-03')
    expect(first?.human_value).toBe('2026-09-04')
    expect(first?.reviewed_at).toBe('2026-09-04T00:00:00.000Z')
    expect(first?.idempotency_key).toHaveLength(64)
    expect(second?.idempotency_key).toBe(first?.idempotency_key)
  })

  it('does not create an override when normalized AI and human values agree', () => {
    expect(buildHumanOverrideRecord({
      documentId: 'doc-123',
      documentSource: 'uploaded_documents',
      fieldName: 'document_number',
      aiValue: ' ABC   123 ',
      humanValue: 'ABC 123',
      reviewerId: 'reviewer-1',
    })).toBeNull()
  })

  it('rejects non-evaluable fields such as extracted text', () => {
    expect(() => buildHumanOverrideRecord({
      documentId: 'doc-123',
      documentSource: 'subcontractor_documents',
      fieldName: 'ai_extracted_text',
      aiValue: 'full OCR text',
      humanValue: 'edited full OCR text',
      reviewerId: 'reviewer-1',
    })).toThrow('Unsupported override field')
  })

  it('rejects unknown document sources', () => {
    expect(() => buildHumanOverrideRecord({
      documentId: 'doc-123',
      documentSource: 'some_legacy_table',
      fieldName: 'document_type',
      aiValue: 'DOCUMENTO',
      humanValue: 'F30',
      reviewerId: 'reviewer-1',
    })).toThrow('Unsupported document source')
  })

  it('rejects invalid model confidence rather than converting it to accuracy', () => {
    expect(() => buildHumanOverrideRecord({
      documentId: 'doc-123',
      documentSource: 'subcontractor_documents',
      fieldName: 'document_type',
      aiValue: 'DOCUMENTO',
      humanValue: 'F30',
      aiConfidence: 1.2,
      reviewerId: 'reviewer-1',
    })).toThrow('aiConfidence must be between 0 and 1')
  })

  it('requires an explicit reviewer identity', () => {
    expect(() => buildHumanOverrideRecord({
      documentId: 'doc-123',
      documentSource: 'subcontractor_documents',
      fieldName: 'document_type',
      aiValue: 'DOCUMENTO',
      humanValue: 'F30',
      reviewerId: ' ',
    })).toThrow('reviewerId is required')
  })

  it('keeps non-ISO values visible instead of guessing a date', () => {
    expect(normalizeOverrideValue('expiration_date', '03/09/2026')).toBe('03/09/2026')
  })
})
