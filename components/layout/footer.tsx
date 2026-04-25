const TruckIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M14 18V6a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2" />
    <path d="M15 18H9" />
    <path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 17.52 8H14" />
    <circle cx="17" cy="18" r="2" />
    <circle cx="7" cy="18" r="2" />
  </svg>
)

export function Footer() {
  return (
    <footer className="bg-card border-t border-border">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <div className="flex items-center justify-center w-10 h-10 bg-primary rounded-lg">
                <TruckIcon />
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-bold text-foreground leading-tight">N3uralia ERP Minería</span>
                <span className="text-xs text-muted-foreground leading-tight">by SegurIA</span>
              </div>
            </div>
            <p className="text-muted-foreground mb-4 max-w-md">
              Plataforma integral para operaciones mineras chilenas. Producción, mantención, bodega, HSE, documentos, compras, finanzas e inteligencia operacional conectadas en una sola fuente de verdad.
            </p>
            <div className="text-sm text-muted-foreground">N3uralia ERP Minería © 2026 — Desarrollado por SegurIA para Cía. Minera La Patagua.</div>
          </div>

          <div>
            <h3 className="font-semibold text-foreground mb-4">Operación</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <a href="#" className="hover:text-foreground transition-colors">
                  Producción
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-foreground transition-colors">
                  Mantención
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-foreground transition-colors">
                  Bodega
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-foreground transition-colors">
                  HSE / Seguridad
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-foreground mb-4">Gestión</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <a href="#" className="hover:text-foreground transition-colors">
                  Compras
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-foreground transition-colors">
                  Finanzas
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-foreground transition-colors">
                  Reportes
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-foreground transition-colors">
                  IA Operacional
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-border mt-8 pt-8">
          <div className="text-center text-sm text-muted-foreground mb-4">
            <p>
              Una plataforma construida para ordenar, controlar y escalar la operación minera de La Patagua con trazabilidad, seguridad e inteligencia operacional.
            </p>
          </div>
          <div className="text-center text-sm">
            <p className="text-muted-foreground">
              <span className="font-semibold text-foreground">N3uralia ERP Minería</span> by{' '}
              <a 
                href="https://seguria.cl" 
                target="_blank" 
                rel="noopener noreferrer"
                className="font-semibold text-primary hover:text-primary/80 transition-colors"
              >
                SegurIA
              </a>
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}
