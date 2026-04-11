"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Menu, X, Truck } from "lucide-react"

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <header className="fixed top-0 w-full z-50 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-2">
            <div className="flex items-center justify-center w-10 h-10 bg-primary rounded-lg">
              <Truck className="w-6 h-6 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold text-foreground">Transportes Labbe</span>
          </div>

          <nav className="hidden md:flex items-center space-x-8">
            <a href="#problema" className="text-muted-foreground hover:text-foreground transition-colors">
              El Problema
            </a>
            <a href="#solucion" className="text-muted-foreground hover:text-foreground transition-colors">
              La Solución
            </a>
            <a href="#demo" className="text-muted-foreground hover:text-foreground transition-colors">
              Ver Demo
            </a>
            <a href="/dashboard" className="text-muted-foreground hover:text-foreground transition-colors">
              Acceso
            </a>
          </nav>

          <div className="hidden md:flex items-center space-x-2">
            <Button variant="ghost" size="sm" asChild>
              <a href="/auth/login">Iniciar Sesión</a>
            </Button>
            <Button size="sm" className="bg-primary hover:bg-primary/90" asChild>
              <a href="/dashboard/executive">Ejecutivas</a>
            </Button>
          </div>

          <button className="md:hidden" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-border">
            <nav className="flex flex-col space-y-4">
              <a
                href="#problema"
                onClick={() => setIsMenuOpen(false)}
                className="text-left text-muted-foreground hover:text-foreground transition-colors"
              >
                El Problema
              </a>
              <a
                href="#solucion"
                onClick={() => setIsMenuOpen(false)}
                className="text-left text-muted-foreground hover:text-foreground transition-colors"
              >
                La Solución
              </a>
              <a
                href="#demo"
                onClick={() => setIsMenuOpen(false)}
                className="text-left text-muted-foreground hover:text-foreground transition-colors"
              >
                Ver Demo
              </a>
              <a href="/dashboard" className="text-muted-foreground hover:text-foreground transition-colors">
                Dashboard
              </a>
              <div className="flex flex-col space-y-2 pt-4">
                <Button variant="ghost" size="sm" asChild>
                  <a href="/dashboard">Iniciar Sesión</a>
                </Button>
                <Button size="sm" className="bg-primary hover:bg-primary/90" asChild>
                  <a href="#demo">Comenzar Ahora</a>
                </Button>
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}
