import { Button } from "@/components/ui/button"
import { ArrowRight, Truck, FileCheck, Shield } from "lucide-react"

export function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden gradient-mesh">
      <div className="absolute inset-0 flex items-center justify-center opacity-5">
        <Truck size={384} />
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <div className="mb-8">
            <h1 className="text-5xl md:text-7xl font-bold text-balance mb-6">
              Transportes Labbe
              <span className="text-primary block">100% Automatizado</span>
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground text-balance max-w-2xl mx-auto leading-relaxed">
              Certificados F-30, cumplimiento normativo y gestión documental. Todo automatizado, todo en una plataforma.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
            <Button size="lg" className="bg-primary hover:bg-primary/90 text-lg px-8 py-4">
              Ingresar a Portal
              <ArrowRight className="w-5 h-5" />
            </Button>
            <Button variant="outline" size="lg" className="text-lg px-8 py-4 bg-transparent">
              Ver Demo
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-3xl mx-auto">
            <div className="flex flex-col items-center space-y-3">
              <FileCheck className="w-8 h-8" />
              <span className="text-sm font-medium">F-30 Automático</span>
            </div>
            <div className="flex flex-col items-center space-y-3">
              <Shield className="w-8 h-8" />
              <span className="text-sm font-medium">100% Cumplimiento</span>
            </div>
            <div className="flex flex-col items-center space-y-3">
              <Truck className="w-8 h-8" />
              <span className="text-sm font-medium">Gestión Unificada</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
