'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Building2, LogOut, FileCheck, TrendingUp } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function CompanyDashboard() {
  const router = useRouter()

  const company = {
    id: 'labbe-12345',
    rut: '78.376.780-5',
    razon_social: 'Transportes Labbe Hermanos Limitada',
    email: 'admin@transporteslabbe.cl',
    telefono: '+56 2 2978 5200',
    direccion: 'Av. Américo Vespucio 1234, Santiago',
    region: 'Metropolitana',
    ciudad: 'Santiago'
  }

  const handleLogout = () => {
    router.push('/auth/login-company')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <header className="border-b border-slate-700/50 bg-slate-900/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Building2 className="w-8 h-8 text-orange-500" />
            <span className="text-2xl font-bold text-white">Dashboard - Labbe</span>
          </div>
          <Button
            onClick={handleLogout}
            variant="outline"
            className="border-slate-500 text-slate-300 hover:bg-slate-700"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Cerrar sesión
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Bienvenido, Transportes Labbe</h1>
          <p className="text-slate-400">Administra tu empresa y accede a tus documentos certificados</p>
        </div>

        <div className="grid md:grid-cols-3 gap-4 mb-8">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-300">Certificados Activos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-orange-500">24</div>
              <p className="text-xs text-slate-400 mt-1">+2 este mes</p>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-300">Documentos Vencidos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-red-500">3</div>
              <p className="text-xs text-slate-400 mt-1">Requieren atención</p>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-300">Permisos Vigentes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-500">18</div>
              <p className="text-xs text-slate-400 mt-1">Todos al día</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-orange-500" />
                Información de la Empresa
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-slate-400">Razón Social</p>
                <p className="text-lg font-semibold text-white">{company.razon_social}</p>
              </div>
              <div>
                <p className="text-sm text-slate-400">RUT</p>
                <p className="text-lg font-semibold text-white">{company.rut}</p>
              </div>
              <div>
                <p className="text-sm text-slate-400">Correo</p>
                <p className="text-white">{company.email}</p>
              </div>
              <div>
                <p className="text-sm text-slate-400">Teléfono</p>
                <p className="text-white">{company.telefono}</p>
              </div>
              <div>
                <p className="text-sm text-slate-400">Ubicación</p>
                <p className="text-white">{company.direccion}</p>
                <p className="text-sm text-slate-400">{company.ciudad}, {company.region}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileCheck className="w-5 h-5 text-orange-500" />
                Documentos Recientes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  { name: 'Licencia de Conducir - 14156425-1', date: '10 de abril, 2026', status: 'Vigente' },
                  { name: 'Certificado de Inscripción - RFC', date: '9 de abril, 2026', status: 'Vigente' },
                  { name: 'Permiso de Circulación - Camión', date: '8 de abril, 2026', status: 'Vence en 30 días' },
                ].map((doc, idx) => (
                  <div key={idx} className="pb-3 border-b border-slate-700 last:border-0">
                    <p className="text-sm font-medium text-white">{doc.name}</p>
                    <div className="flex items-center justify-between mt-1">
                      <p className="text-xs text-slate-400">{doc.date}</p>
                      <span className={`text-xs px-2 py-1 rounded ${
                        doc.status === 'Vigente' 
                          ? 'bg-green-500/20 text-green-400' 
                          : 'bg-yellow-500/20 text-yellow-400'
                      }`}>
                        {doc.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="mt-8 grid md:grid-cols-2 gap-4">
          <Button className="bg-orange-500 hover:bg-orange-600 text-white h-12 text-base">
            <FileCheck className="w-4 h-4 mr-2" />
            Ver Todos los Certificados
          </Button>
          <Button variant="outline" className="border-slate-500 text-slate-300 hover:bg-slate-700 h-12 text-base">
            <TrendingUp className="w-4 h-4 mr-2" />
            Solicitar Nuevo Documento
          </Button>
        </div>
      </main>
    </div>
  )
}
