import { Button } from "@/components/ui/button"
import { ArrowRight, Phone, Mail } from "lucide-react"

export function CTASection() {
  return (
    <section className="py-24 bg-primary/5">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-4xl md:text-6xl font-bold text-balance mb-6">
            Automatiza tu Transporte
            <span className="text-primary block">Hoy Mismo</span>
          </h2>
          <p className="text-xl text-muted-foreground text-balance mb-12 leading-relaxed">
            Demo gratuita en 15 minutos. Implementación rápida y acompañamiento completo. Garantía de resultados o te devolvemos tu dinero.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Button size="lg" className="bg-primary hover:bg-primary/90 text-lg px-8 py-4">
              Demo Gratuita Ahora
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
            <Button variant="outline" size="lg" className="text-lg px-8 py-4 bg-transparent">
              Llamar Ahora: +56 2 2XXX XXXX
              <Phone className="ml-2 w-5 h-5" />
            </Button>
          </div>

          <div className="bg-background border border-border rounded-2xl p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-center">
              <div>
                <Mail className="w-8 h-8 text-primary mx-auto mb-3" />
                <div className="font-semibold mb-1">Email Directo</div>
                <div className="text-muted-foreground">ventas@cleaner.cl</div>
              </div>
              <div>
                <Phone className="w-8 h-8 text-primary mx-auto mb-3" />
                <div className="font-semibold mb-1">WhatsApp</div>
                <div className="text-muted-foreground">+56 9 XXXX XXXX</div>
              </div>
            </div>
            <div className="mt-6 pt-6 border-t border-border">
              <div className="text-sm text-primary font-medium">Respuesta en menos de 2 horas</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
