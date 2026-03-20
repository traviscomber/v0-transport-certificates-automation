'use client'

import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Upload, BarChart3, FileText } from 'lucide-react'

export default function WalmartOCRHome() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="container mx-auto px-4 py-16">
        {/* Hero Section */}
        <div className="max-w-4xl mx-auto text-center mb-16">
          <h1 className="text-5xl font-bold text-white mb-4">
            Portal OCR Walmart Chile
          </h1>
          <p className="text-xl text-slate-300 mb-8">
            Extrae datos automáticamente de 35+ documentos de transporte
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/walmart-ocr">
              <Button size="lg" className="gap-2">
                <Upload className="h-5 w-5" />
                Empezar a Subir Documentos
              </Button>
            </Link>
            <Link href="/walmart-ocr/compliance">
              <Button size="lg" variant="outline" className="gap-2">
                <BarChart3 className="h-5 w-5" />
                Ver Dashboard
              </Button>
            </Link>
          </div>
        </div>

        {/* Features Grid */}
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Upload className="h-5 w-5 text-blue-400" />
                Upload Inteligente
              </CardTitle>
            </CardHeader>
            <CardContent className="text-slate-300">
              <p>
                Carga fotos de documentos y nuestra IA reconoce automáticamente el tipo de documento
              </p>
            </CardContent>
          </Card>

          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <FileText className="h-5 w-5 text-green-400" />
                Extracción Precisa
              </CardTitle>
            </CardHeader>
            <CardContent className="text-slate-300">
              <p>
                Extrae datos estructurados con validación de formatos chilenos (RUT, fechas, patentes)
              </p>
            </CardContent>
          </Card>

          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-purple-400" />
                Dashboard Ejecutivo
              </CardTitle>
            </CardHeader>
            <CardContent className="text-slate-300">
              <p>
                Visualiza tu cumplimiento documental y descarga reportes para Walmart
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Document Types */}
        <div className="max-w-6xl mx-auto mb-16">
          <h2 className="text-3xl font-bold text-white mb-8 text-center">
            Documentos Soportados
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { title: 'EMPRESA', count: 5, color: 'from-blue-600 to-blue-400' },
              { title: 'CONDUCTOR', count: 9, color: 'from-green-600 to-green-400' },
              { title: 'VEHÍCULO', count: 8, color: 'from-purple-600 to-purple-400' },
              { title: 'SEGURIDAD', count: 5, color: 'from-orange-600 to-orange-400' },
              { title: 'OPERACIONAL', count: 5, color: 'from-pink-600 to-pink-400' },
              { title: 'SUBCONTRATACIÓN', count: 3, color: 'from-cyan-600 to-cyan-400' },
            ].map((category) => (
              <Card
                key={category.title}
                className={`bg-gradient-to-br ${category.color} border-0`}
              >
                <CardHeader>
                  <CardTitle className="text-white text-lg">
                    {category.title}
                  </CardTitle>
                  <CardDescription className="text-white/80">
                    {category.count} documentos
                  </CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>

        {/* Stats */}
        <div className="max-w-4xl mx-auto bg-slate-800 border border-slate-700 rounded-lg p-8 mb-16">
          <div className="grid grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-blue-400 mb-2">35+</div>
              <p className="text-slate-300">Tipos de Documentos</p>
            </div>
            <div>
              <div className="text-4xl font-bold text-green-400 mb-2">85%+</div>
              <p className="text-slate-300">Precisión OCR</p>
            </div>
            <div>
              <div className="text-4xl font-bold text-purple-400 mb-2">&lt;2s</div>
              <p className="text-slate-300">Procesamiento por Doc</p>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="max-w-2xl mx-auto text-center">
          <h3 className="text-2xl font-bold text-white mb-4">
            Comienza a procesar documentos ahora
          </h3>
          <p className="text-slate-300 mb-6">
            Sin configuración complicada. Solo carga tus documentos y nosotros nos encargamos del resto.
          </p>
          <Link href="/walmart-ocr">
            <Button size="lg" className="gap-2">
              <Upload className="h-5 w-5" />
              Ir al Portal OCR
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
