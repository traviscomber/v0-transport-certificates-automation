"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"

const MenuIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="4" x2="20" y1="6" y2="6" />
    <line x1="4" x2="20" y1="12" y2="12" />
    <line x1="4" x2="20" y1="18" y2="18" />
  </svg>
)

const XIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M18 6 6 18" />
    <path d="M6 6l12 12" />
  </svg>
)

const TruckIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M14 18V6a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2" />
    <path d="M15 18H9" />
    <path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 17.52 8H14" />
    <circle cx="17" cy="18" r="2" />
    <circle cx="7" cy="18" r="2" />
  </svg>
)

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <header className="fixed top-0 w-full z-50 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-2">
            <div className="flex items-center justify-center w-10 h-10 bg-primary rounded-lg">
              <TruckIcon />
            </div>
            <span className="text-xl font-bold text-foreground">TransporteCL</span>
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
              Dashboard
            </a>
          </nav>

          <div className="hidden md:flex items-center space-x-4">
            <Button variant="ghost" size="sm" asChild>
              <a href="/dashboard">Iniciar Sesión</a>
            </Button>
            <Button size="sm" className="bg-primary hover:bg-primary/90" asChild>
              <a href="#demo">Comenzar Ahora</a>
            </Button>
          </div>

          <button className="md:hidden" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <XIcon /> : <MenuIcon />}
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
