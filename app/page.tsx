"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { 
  Truck, 
  FileCheck, 
  Shield, 
  Zap, 
  Users,
  ArrowRight,
  CheckCircle2
} from "lucide-react"

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/40">
        <div className="container mx-auto px-4 py-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Truck className="w-8 h-8 text-primary" />
            <h1 className="text-2xl font-bold">Transportes Labbe</h1>
          </div>
          <div className="flex gap-3">
            <Link href="/auth/login-company">
              <Button size="sm">Iniciar Sesión</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="max-w-3xl">
          <h2 className="text-5xl font-bold mb-6">
            Portal de Empresas Transportistas
          </h2>
          <p className="text-xl text-muted-foreground mb-8">
            Accede a tu plataforma de gestión documental y operativa. Valida documentos, 
            gestiona certificados y automatiza tus procesos de cumplimiento.
          </p>
          <div className="flex gap-4">
            <Link href="/auth/login-company">
              <Button size="lg" className="gap-2">
                Acceder al Portal <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
            <Button size="lg" variant="outline">
              Más Información
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-muted/50 py-20">
        <div className="container mx-auto px-4">
          <h3 className="text-3xl font-bold mb-12 text-center">
            Características Principales
          </h3>
          <div className="grid md:grid-cols-3 gap-6">
            <Card className="border-border/40">
              <CardContent className="pt-6">
                <FileCheck className="w-12 h-12 text-primary mb-4" />
                <h4 className="text-lg font-semibold mb-2">Documentación Completa</h4>
                <p className="text-sm text-muted-foreground">
                  Gestiona y valida todos tus documentos de transporte en un solo lugar
                </p>
              </CardContent>
            </Card>
            
            <Card className="border-border/40">
              <CardContent className="pt-6">
                <Shield className="w-12 h-12 text-primary mb-4" />
                <h4 className="text-lg font-semibold mb-2">Cumplimiento Normativo</h4>
                <p className="text-sm text-muted-foreground">
                  Asegura el cumplimiento de regulaciones y evita sanciones
                </p>
              </CardContent>
            </Card>
            
            <Card className="border-border/40">
              <CardContent className="pt-6">
                <Zap className="w-12 h-12 text-primary mb-4" />
                <h4 className="text-lg font-semibold mb-2">Automatización</h4>
                <p className="text-sm text-muted-foreground">
                  Procesos automáticos que ahorran tiempo y reducen errores
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h3 className="text-3xl font-bold mb-6">
              Beneficios para tu Empresa
            </h3>
            <div className="space-y-4">
              <div className="flex gap-3">
                <CheckCircle2 className="w-6 h-6 text-green-500 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold">Gestión Centralizada</h4>
                  <p className="text-sm text-muted-foreground">Acceso desde cualquier dispositivo</p>
                </div>
              </div>
              <div className="flex gap-3">
                <CheckCircle2 className="w-6 h-6 text-green-500 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold">Validación Instant</h4>
                  <p className="text-sm text-muted-foreground">Verifica documentos al instante</p>
                </div>
              </div>
              <div className="flex gap-3">
                <CheckCircle2 className="w-6 h-6 text-green-500 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold">Reportes Detallados</h4>
                  <p className="text-sm text-muted-foreground">Analítica completa de tus operaciones</p>
                </div>
              </div>
              <div className="flex gap-3">
                <CheckCircle2 className="w-6 h-6 text-green-500 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold">Soporte Continuo</h4>
                  <p className="text-sm text-muted-foreground">Equipo disponible para asistirte</p>
                </div>
              </div>
            </div>
          </div>
          <div className="bg-muted/50 rounded-lg p-8 h-96 flex items-center justify-center">
            <div className="text-center">
              <Users className="w-16 h-16 text-primary/50 mx-auto mb-4" />
              <p className="text-muted-foreground">Visualización de datos</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-primary/5 border-t border-border/40 py-16">
        <div className="container mx-auto px-4 text-center">
          <h3 className="text-3xl font-bold mb-4">
            ¿Listo para comenzar?
          </h3>
          <p className="text-lg text-muted-foreground mb-8">
            Accede a tu cuenta para gestionar tus documentos y operaciones
          </p>
          <Link href="/auth/login-company">
            <Button size="lg" className="gap-2">
              Iniciar Sesión <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/40 bg-muted/30 py-12">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-2">
              <Truck className="w-6 h-6 text-primary" />
              <span className="font-semibold">Transportes Labbe</span>
            </div>
            <p className="text-sm text-muted-foreground">
              © 2026 Transportes Labbe. Todos los derechos reservados.
            </p>
          </div>
        </div>
      </footer>
    </main>
  )
}
