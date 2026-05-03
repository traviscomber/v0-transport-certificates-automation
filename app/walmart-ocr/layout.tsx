import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { FileCheck, Home, BarChart3, CheckCircle2, LogOut } from 'lucide-react'

export default function WalmartOCRLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-dark">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-slate-700/50 bg-slate-900/80 backdrop-blur-md shadow-lg">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <Link href="/walmart-ocr" className="flex items-center gap-3 group hover:opacity-80 transition-opacity">
            <div className="w-10 h-10 gradient-accent rounded-lg flex items-center justify-center shadow-lg glow-orange group-hover:scale-110 transition-transform">
              <FileCheck className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="font-bold text-lg text-foreground">DocuFleet</div>
              <div className="text-xs text-accent font-semibold">OCR Portal</div>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-2">
            <Link
              href="/walmart-ocr"
              className="text-sm font-medium px-4 py-2 rounded-lg hover:bg-slate-800/50 hover:text-accent transition-all flex items-center gap-2"
            >
              <FileCheck className="w-4 h-4" />
              Cargar Documentos
            </Link>
            <Link
              href="/walmart-ocr/compliance"
              className="text-sm font-medium px-4 py-2 rounded-lg hover:bg-slate-800/50 hover:text-accent transition-all flex items-center gap-2"
            >
              <BarChart3 className="w-4 h-4" />
              Compliance
            </Link>
            <Link
              href="/walmart-ocr/review"
              className="text-sm font-medium px-4 py-2 rounded-lg hover:bg-slate-800/50 hover:text-accent transition-all flex items-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              Revisar
            </Link>
            <Separator orientation="vertical" className="mx-2 h-6 bg-slate-700/50" />
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-muted-foreground hover:text-red-400 hover:bg-red-500/10"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Salir
            </Button>
          </nav>

          <Link href="/admin">
            <Button size="sm" className="btn-orange md:hidden">
              <Home className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">{children}</main>

      {/* Footer */}
      <footer className="border-t border-slate-700/50 bg-slate-900/50 mt-24 py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="font-bold text-foreground mb-4">Plataforma</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link href="/walmart-ocr" className="hover:text-accent transition-colors">
                    Subir Documentos
                  </Link>
                </li>
                <li>
                  <Link href="/walmart-ocr/compliance" className="hover:text-accent transition-colors">
                    Dashboard
                  </Link>
                </li>
                <li>
                  <Link href="/walmart-ocr/review" className="hover:text-accent transition-colors">
                    Revisar
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold text-foreground mb-4">Capacidades</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>35+ Tipos de Documentos</li>
                <li>Validacion 99% Precision</li>
                <li>Alertas Automaticas</li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold text-foreground mb-4">Recursos</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link href="/admin" className="hover:text-accent transition-colors">
                    Panel Admin
                  </Link>
                </li>
                <li>
                  <Link href="/" className="hover:text-accent transition-colors">
                    Inicio
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold text-foreground mb-4">Soporte</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <a href="mailto:support@docufleet.cl" className="hover:text-accent transition-colors">
                    Email: support@docufleet.cl
                  </a>
                </li>
                <li>Chat en vivo disponible</li>
              </ul>
            </div>
          </div>

          <Separator className="my-8 bg-slate-700/30" />

          <div className="text-center text-sm text-muted-foreground">
            <p>
              © 2024 DocuFleet - Compliance Documental Automatizado. Todos los derechos reservados.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
