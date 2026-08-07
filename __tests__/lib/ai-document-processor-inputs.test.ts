import {
  extractDocumentFromPdfBuffer,
  extractDocumentMetadata,
} from '@/lib/ai-document-processor'

describe('AI document input validation', () => {
  test('rejects an empty PDF before any OpenAI request', async () => {
    await expect(extractDocumentFromPdfBuffer(new Uint8Array())).rejects.toThrow('Document PDF is empty')
  })

  test('rejects an empty image before any OpenAI request', async () => {
    await expect(extractDocumentMetadata('   ')).rejects.toThrow('Document image is empty')
  })
})
