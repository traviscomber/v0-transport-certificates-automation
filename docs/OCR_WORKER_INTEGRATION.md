# External OCR Worker Integration

## Overview

The document OCR pipeline now supports both local Tesseract OCR and an external OCR worker service. This allows offloading computationally expensive OCR processing to a dedicated worker while keeping Vercel serverless functions lightweight.

## Configuration

### Environment Variables

Required to enable the external OCR worker:

```
OCR_PROCESSING_ENABLED=true
OCR_WORKER_URL=https://direccion-del-worker
OCR_WORKER_SECRET=C4ritOs  # or your worker secret
```

### Behavior

**When enabled:**
1. Document OCR cron tries external worker FIRST
2. If worker is unavailable or fails → automatic fallback to local Tesseract OCR
3. Each document's extraction method is tracked (external_ocr_worker or local_tesseract_ocr_fallback)

**When disabled:**
- Uses local Tesseract OCR (default behavior)
- No external calls made

## API Integration

### External OCR Worker Endpoint

```
POST /process
Headers:
  - Authorization: Bearer {OCR_WORKER_SECRET}
Body: multipart/form-data
  - document: File (PDF or image)
  - expectedType: string (e.g., "CEDULA", "PASAPORTE")
  - mimeType: string (e.g., "application/pdf", "image/png")

Response (200):
{
  "documentType": "CEDULA",
  "expirationDate": "2027-12-31",
  "issuanceDate": "2020-01-15",
  "documentNumber": "12345678-9",
  "extractedText": "...",
  "confidence": 0.95,
  "warnings": [],
  "pagesProcessed": 1
}
```

### Timeout

- Worker has 120 seconds (2 minutes) to process each document
- If timeout occurs, fallback to local OCR automatically

## Monitoring

### Cron Response Example

```json
{
  "processed": 1,
  "extracted": 1,
  "engine": "external_ocr_worker (with local fallback)",
  "results": [
    {
      "documentId": "doc-123",
      "fileName": "cedula.pdf",
      "status": "text_extracted",
      "textLength": 450,
      "confidence": 0.92,
      "pagesProcessed": 1,
      "engine": "external_ocr_worker",
      "processingTimeMs": 3500
    }
  ],
  "durationMs": 4200
}
```

### Database Tracking

Documents include:
- `extraction_method`: "external_ocr_worker" | "local_tesseract_ocr" | "local_tesseract_ocr_fallback"
- `ai_extracted_text`: Full OCR result text
- `ai_confidence`: Confidence score (0-1)
- `ai_warnings`: Any processing warnings

## Error Handling

### Worker Unavailable

```
[OCR] External worker failed, falling back to local OCR:
{
  "documentId": "doc-456",
  "error": "Could not connect to worker"
}
```

→ Automatically uses local Tesseract OCR and continues processing

### Invalid Configuration

```
Error: OCR_WORKER_URL or OCR_WORKER_SECRET not configured
```

→ Only triggers if OCR_PROCESSING_ENABLED=true but credentials missing

## Performance

### External Worker
- Typical: 2-5 seconds per document
- More consistent across many documents
- Scales independently from Vercel

### Local Tesseract (Fallback)
- Typical: 5-15 seconds per document
- Variable based on Vercel instance load
- Consumes CPU/memory on Vercel function

## Deployment

1. Set environment variables in Vercel:
   ```
   OCR_PROCESSING_ENABLED=true
   OCR_WORKER_URL=https://your-worker-domain
   OCR_WORKER_SECRET=your-secret
   ```

2. Deploy via git:
   ```
   git push origin main
   ```

3. Verify in logs:
   ```
   [OCR] Attempting external worker for document: doc-xyz
   [OCR] External worker success: processingTimeMs=3200
   ```

## Testing

### Manual Test

```bash
curl -X POST https://cleaner2.vercel.app/api/cron/document-ocr \
  -H "Authorization: Bearer YOUR_CRON_SECRET"
```

Response shows which engine was used for each document.

### Production Monitoring

- Check Vercel logs for "[OCR] External worker success" messages
- Monitor `document_text_extractions.extraction_method` in database
- Track success rate and processing times via `processingTimeMs`

## Fallback Guarantees

- ✅ Worker timeout → local OCR
- ✅ Worker 4xx/5xx error → local OCR
- ✅ Worker network error → local OCR
- ✅ Invalid auth → local OCR
- ✅ Invalid response format → local OCR

No documents are skipped. Processing always completes.
