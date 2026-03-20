import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'

export default function WalmartOCRLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/walmart-ocr" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">
              W
            </div>
            <span className="font-bold text-lg">OCR Portal</span>
          </Link>

          <nav className="flex items-center gap-6">
            <Link
              href="/walmart-ocr"
              className="text-sm font-medium hover:text-blue-600 transition-colors"
            >
              Upload
            </Link>
            <Link
              href="/walmart-ocr/compliance"
              className="text-sm font-medium hover:text-blue-600 transition-colors"
            >
              Dashboard
            </Link>
            <Button variant="outline" size="sm">
              Salir
            </Button>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">{children}</main>

      {/* Footer */}
      <footer className="bg-slate-50 border-t border-slate-200 mt-16">
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-3 gap-8 mb-8">
            <div>
              <h3 className="font-semibold mb-4">Portal</h3>
              <ul className="space-y-2 text-sm text-slate-600">
                <li>
                  <Link href="/walmart-ocr" className="hover:text-blue-600">
                    Subir Documentos
                  </Link>
                </li>
                <li>
                  <Link href="/walmart-ocr/compliance" className="hover:text-blue-600">
                    Dashboard
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Documentos</h3>
              <ul className="space-y-2 text-sm text-slate-600">
                <li>35+ Tipos Soportados</li>
                <li>Validación Automática</li>
                <li>Reportes</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Soporte</h3>
              <ul className="space-y-2 text-sm text-slate-600">
                <li>
                  <a href="mailto:support@example.com" className="hover:text-blue-600">
                    Email
                  </a>
                </li>
                <li>Chat en vivo</li>
              </ul>
            </div>
          </div>

          <Separator className="my-8" />

          <div className="text-center text-sm text-slate-600">
            <p>
              © 2024 Walmart Chile OCR Portal. Todos los derechos reservados.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
