'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Truck, LogIn, UserPlus } from 'lucide-react'

export default function TestPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-12 h-12 rounded-lg bg-orange-500 flex items-center justify-center">
            <Truck className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-white">Página de Prueba - DocuFleet</h1>
        </div>
        
        <p className="text-slate-400 mb-12 text-lg">
          Acceso rápido a los diferentes dashboards y funcionalidades del sistema.
        </p>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Login Card */}
          <Card className="bg-slate-800/50 border-slate-700 hover:border-orange-500/50 transition-colors">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <LogIn className="w-5 h-5 text-orange-500" />
                Iniciar Sesión
              </CardTitle>
              <CardDescription>Accede con tu cuenta existente</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-slate-400 mb-4">
                Si ya tienes una cuenta registrada, puedes iniciar sesión aquí para acceder al dashboard.
              </p>
              <Link href="/auth/login">
                <Button className="w-full btn-orange">
                  Ir a Login
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Register Card */}
          <Card className="bg-slate-800/50 border-slate-700 hover:border-orange-500/50 transition-colors">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-orange-500" />
                Crear Cuenta
              </CardTitle>
              <CardDescription>Regístrate para acceder al sistema</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-slate-400 mb-4">
                Crea una nueva cuenta como conductor, despachador o administrador.
              </p>
              <Link href="/auth/register">
                <Button className="w-full btn-orange">
                  Ir a Registro
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        <div className="mt-12 p-6 bg-slate-800/30 border border-slate-700 rounded-lg">
          <h2 className="text-xl font-bold text-white mb-4">Credenciales de Demo</h2>
          <div className="space-y-4 text-sm text-slate-300">
            <div>
              <p className="font-semibold text-orange-400">Conductor</p>
              <p>Email: conductor@demo.cl | Password: demo123</p>
            </div>
            <div>
              <p className="font-semibold text-orange-400">Despachador</p>
              <p>Email: dispatcher@demo.cl | Password: demo123</p>
            </div>
            <div>
              <p className="font-semibold text-orange-400">Administrador</p>
              <p>Email: admin@demo.cl | Password: demo123</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
