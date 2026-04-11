"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-20">
        <h1 className="text-4xl font-bold mb-6">Transportes Labbe</h1>
        <p className="text-lg mb-8">Portal de Empresas Transportistas</p>
        
        <div className="flex gap-4">
          <Link href="/auth/login-company">
            <Button>Iniciar Sesión - Empresa</Button>
          </Link>
          <Link href="/auth/login">
            <Button variant="outline">Iniciar Sesión - Individual</Button>
          </Link>
        </div>
      </div>
    </main>
  )
}
