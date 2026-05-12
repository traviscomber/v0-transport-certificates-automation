'use client'

import { useState } from 'react'
import { Document, Page, pdfjs } from 'react-pdf'
import { ChevronLeft, ChevronRight, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

// Set up the worker from CDN
if (typeof window !== 'undefined') {
  pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`
}

interface PDFViewerProps {
  url: string
  filename: string
}

export function PDFViewer({ url, filename }: PDFViewerProps) {
  const [numPages, setNumPages] = useState<number | null>(null)
  const [pageNumber, setPageNumber] = useState(1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Use proxy endpoint to avoid CORS issues
  const proxyUrl = `/api/documents/proxy?url=${encodeURIComponent(url)}`

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    try {
      setNumPages(numPages)
      setLoading(false)
      setError(null)
    } catch (err) {
      console.error('[v0] Error in onDocumentLoadSuccess:', err)
    }
  }

  const onDocumentLoadError = (error: any) => {
    console.error('[v0] PDF load error:', error)
    setError('Failed to load PDF document.')
    setLoading(false)
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="w-full bg-slate-900 rounded-lg p-4 flex justify-center overflow-auto max-h-[50vh]">
        {loading && (
          <div className="flex items-center justify-center h-96">
            <Loader2 className="h-8 w-8 animate-spin text-orange-400" />
          </div>
        )}
        
        {error && (
          <div className="flex items-center justify-center h-96 text-red-400 text-center">
            <div>
              <p className="font-semibold mb-2">{error}</p>
              <p className="text-sm text-gray-400">The PDF could not be loaded. Try downloading the file instead.</p>
            </div>
          </div>
        )}

        {!loading && !error && (
          <div className="w-full flex justify-center">
            <Document
              file={proxyUrl}
              onLoadSuccess={onDocumentLoadSuccess}
              onLoadError={onDocumentLoadError}
              loading={<Loader2 className="h-8 w-8 animate-spin" />}
              error="Failed to load PDF"
            >
              <Page 
                pageNumber={pageNumber}
                scale={1.2}
                renderTextLayer={false}
                renderAnnotationLayer={false}
              />
            </Document>
          </div>
        )}
      </div>

      {numPages && numPages > 1 && (
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPageNumber(Math.max(1, pageNumber - 1))}
            disabled={pageNumber <= 1}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm text-muted-foreground">
            Page {pageNumber} of {numPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPageNumber(Math.min(numPages, pageNumber + 1))}
            disabled={pageNumber >= numPages}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  )
}
