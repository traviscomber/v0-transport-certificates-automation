"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Copy, Mail, Phone, MapPin, Building2, FileText, Eye, EyeOff } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface Executive {
  id: string
  email: string
  full_name: string
  role: string
  company_name: string
  rut: string
  phone: string
  address: string
  city: string
  region: string
  is_active: boolean
  created_at: string
}

export default function ExecutivesPage() {
  const [executives, setExecutives] = useState<Executive[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showPasswords, setShowPasswords] = useState<Record<string, boolean>>({})
  const { toast } = useToast()

  useEffect(() => {
    fetchExecutives()
  }, [])

  const fetchExecutives = async () => {
    try {
      setIsLoading(true)
      const response = await fetch("/api/executives")
      const data = await response.json()

      if (!data.success) {
        setError(data.error)
        return
      }

      setExecutives(data.executives)
    } catch (err: any) {
      setError(err.message || "Error al cargar ejecutivas")
    } finally {
      setIsLoading(false)
    }
  }

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text)
    toast({
      title: "Copiado",
      description: `${label} copiado al portapapeles`,
    })
  }

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "admin":
        return "bg-red-100 text-red-800"
      case "dispatcher":
        return "bg-blue-100 text-blue-800"
      case "driver":
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getRoleLabel = (role: string) => {
    switch (role) {
      case "admin":
        return "Administrador"
      case "dispatcher":
        return "Despachador"
      case "driver":
        return "Conductor"
      default:
        return role
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center">
        <div className="text-white text-center">
          <div className="text-4xl font-bold mb-4">Cargando...</div>
          <p className="text-gray-400">Obteniendo datos de ejecutivas</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Ejecutivas - Transportes Labbe</h1>
          <p className="text-gray-400">Credenciales y datos de contacto de ejecutivas</p>
        </div>

        {error && (
          <Card className="mb-6 border-red-200 bg-red-50">
            <CardContent className="pt-6">
              <p className="text-red-800">{error}</p>
            </CardContent>
          </Card>
        )}

        {executives.length === 0 ? (
          <Card className="border-gray-700 bg-slate-800">
            <CardContent className="pt-6 text-center py-12">
              <p className="text-gray-400 text-lg">No se encontraron ejecutivas en la base de datos</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {executives.map((executive) => (
              <Card key={executive.id} className="border-gray-700 bg-slate-800 overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-orange-600 to-orange-700 text-white">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-2xl">{executive.full_name}</CardTitle>
                      <CardDescription className="text-orange-100">
                        {executive.company_name}
                      </CardDescription>
                    </div>
                    <Badge
                      className={`${getRoleBadgeColor(executive.role)} rounded-full px-4 py-2 text-sm font-semibold`}
                    >
                      {getRoleLabel(executive.role)}
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent className="pt-6 space-y-6">
                  {/* Credenciales de Acceso */}
                  <div className="bg-slate-700 rounded-lg p-4 border border-slate-600">
                    <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                      <FileText className="w-5 h-5" />
                      Credenciales de Acceso
                    </h3>
                    <div className="space-y-3">
                      {/* Email */}
                      <div>
                        <label className="text-gray-300 text-sm font-medium block mb-1">Email</label>
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            value={executive.email}
                            readOnly
                            className="flex-1 bg-slate-600 text-white px-3 py-2 rounded border border-slate-500 text-sm"
                          />
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => copyToClipboard(executive.email, "Email")}
                            className="bg-slate-600 border-slate-500 text-white hover:bg-slate-500"
                          >
                            <Copy className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>

                      {/* RUT */}
                      <div>
                        <label className="text-gray-300 text-sm font-medium block mb-1">RUT</label>
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            value={executive.rut || "No disponible"}
                            readOnly
                            className="flex-1 bg-slate-600 text-white px-3 py-2 rounded border border-slate-500 text-sm"
                          />
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => copyToClipboard(executive.rut, "RUT")}
                            className="bg-slate-600 border-slate-500 text-white hover:bg-slate-500"
                            disabled={!executive.rut}
                          >
                            <Copy className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Información de Contacto */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Teléfono */}
                    <div className="bg-slate-700 rounded-lg p-4 border border-slate-600">
                      <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
                        <Phone className="w-5 h-5 text-orange-500" />
                        Teléfono
                      </h4>
                      <p className="text-gray-200 text-lg">{executive.phone || "No disponible"}</p>
                    </div>

                    {/* Email Alt */}
                    <div className="bg-slate-700 rounded-lg p-4 border border-slate-600">
                      <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
                        <Mail className="w-5 h-5 text-orange-500" />
                        Correo
                      </h4>
                      <p className="text-gray-200 text-sm break-all">{executive.email}</p>
                    </div>
                  </div>

                  {/* Información de Dirección */}
                  <div className="bg-slate-700 rounded-lg p-4 border border-slate-600">
                    <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
                      <MapPin className="w-5 h-5 text-orange-500" />
                      Ubicación
                    </h4>
                    <div className="space-y-2 text-gray-200">
                      <p>
                        <span className="text-gray-400">Dirección:</span> {executive.address || "No disponible"}
                      </p>
                      <p>
                        <span className="text-gray-400">Ciudad:</span> {executive.city || "No disponible"}
                      </p>
                      <p>
                        <span className="text-gray-400">Región:</span> {executive.region || "No disponible"}
                      </p>
                    </div>
                  </div>

                  {/* Información de Empresa */}
                  <div className="bg-slate-700 rounded-lg p-4 border border-slate-600">
                    <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
                      <Building2 className="w-5 h-5 text-orange-500" />
                      Información de Empresa
                    </h4>
                    <div className="space-y-2 text-gray-200">
                      <p>
                        <span className="text-gray-400">Empresa:</span> {executive.company_name}
                      </p>
                      <p>
                        <span className="text-gray-400">Estado:</span>{" "}
                        <Badge className={executive.is_active ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
                          {executive.is_active ? "Activo" : "Inactivo"}
                        </Badge>
                      </p>
                      <p>
                        <span className="text-gray-400">Creado:</span>{" "}
                        {new Date(executive.created_at).toLocaleDateString("es-CL")}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Estadísticas */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="border-gray-700 bg-slate-800">
            <CardHeader>
              <CardTitle className="text-white">Total de Ejecutivas</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-bold text-orange-500">{executives.length}</p>
            </CardContent>
          </Card>

          <Card className="border-gray-700 bg-slate-800">
            <CardHeader>
              <CardTitle className="text-white">Ejecutivas Activas</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-bold text-green-500">{executives.filter((e) => e.is_active).length}</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
