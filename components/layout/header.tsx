"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"

const MenuIcon = ({ className }: { className?: string }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}>
    <line x1="4" x2="20" y1="6" y2="6" />
    <line x1="4" x2="20" y1="12" y2="12" />
    <line x1="4" x2="20" y1="18" y2="18" />
  </svg>
)

const XIcon = ({ className }: { className?: string }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}>
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
      <div className="container mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 sm:h-16">
          <div className="flex items-center space-x-2">
            <div className="flex items-center justify-center w-8 sm:w-10 h-8 sm:h-10 bg-primary rounded-lg">
              <TruckIcon />
            </div>
            <div className="flex flex-col">
              <span className="text-base sm:text-xl font-bold text-foreground leading-tight">DocuFleet</span>
              <span className="text-[8px] sm:text-[10px] text-muted-foreground leading-tight">by Segur-ia</span>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6 lg:space-x-8">
            <a href="#problema" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              El Problema
            </a>
            <a href="#solucion" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              La Solución
            </a>
            <a href="#demo" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Ver Demo
            </a>
            <a href="/dashboard" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Dashboard
            </a>
          </nav>

          {/* Desktop Auth Buttons */}
          <div className="hidden md:flex items-center space-x-3">
            <Button variant="ghost" size="sm" asChild>
              <a href="/auth/login" className="text-sm">Iniciar Sesion</a>
            </Button>
            <Button size="sm" className="bg-primary hover:bg-primary/90 text-xs sm:text-sm" asChild>
              <a href="/auth/register">Crear Cuenta</a>
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button 
            className="md:hidden p-1.5 hover:bg-slate-800/50 rounded-lg transition-colors" 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Menu"
          >
            {isMenuOpen ? <XIcon className="h-5 w-5" /> : <MenuIcon className="h-5 w-5" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-3 sm:py-4 border-t border-border bg-background/95 backdrop-blur-sm">
            <nav className="flex flex-col space-y-2 px-2">
              <a
                href="#problema"
                onClick={() => setIsMenuOpen(false)}
                className="text-left px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-slate-800/50 rounded-lg transition-colors"
              >
                El Problema
              </a>
              <a
                href="#solucion"
                onClick={() => setIsMenuOpen(false)}
                className="text-left px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-slate-800/50 rounded-lg transition-colors"
              >
                La Solución
              </a>
              <a
                href="#demo"
                onClick={() => setIsMenuOpen(false)}
                className="text-left px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-slate-800/50 rounded-lg transition-colors"
              >
                Ver Demo
              </a>
              <a 
                href="/dashboard" 
                onClick={() => setIsMenuOpen(false)}
                className="text-left px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-slate-800/50 rounded-lg transition-colors"
              >
                Dashboard
              </a>
              <div className="flex flex-col space-y-2 pt-2 px-2 border-t border-border">
                <Button variant="ghost" size="sm" asChild className="text-xs sm:text-sm w-full justify-start">
                  <a href="/auth/login">Iniciar Sesion</a>
                </Button>
                <Button size="sm" className="bg-primary hover:bg-primary/90 text-xs sm:text-sm w-full justify-start" asChild>
                  <a href="/auth/register">Crear Cuenta</a>
                </Button>
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}
