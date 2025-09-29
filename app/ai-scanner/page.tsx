import { DocumentScanner } from "@/components/ai/document-scanner"

export default function AIScannerPage() {
  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Escáner Inteligente</h1>
        <p className="text-muted-foreground">
          Digitaliza y extrae datos automáticamente de tus documentos de transporte
        </p>
      </div>

      <DocumentScanner />
    </div>
  )
}
