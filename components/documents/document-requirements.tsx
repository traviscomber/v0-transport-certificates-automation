'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, AlertCircle, Info } from "lucide-react"

export function DocumentRequirements() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold text-[#18181B]">Requisitos de Documentos Chilenos</h2>
        <p className="text-[#71717A]">Información detallada sobre cada documento obligatorio para transporte en Chile</p>
      </div>

      <Tabs defaultValue="identidad" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="identidad">Identidad</TabsTrigger>
          <TabsTrigger value="conductor">Conductor</TabsTrigger>
          <TabsTrigger value="vehiculo">Vehículo</TabsTrigger>
          <TabsTrigger value="seguro">Seguro</TabsTrigger>
        </TabsList>

        {/* IDENTIDAD */}
        <TabsContent value="identidad" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                Cédula de Identidad (Carnet)
              </CardTitle>
              <CardDescription>Documento de identificación personal obligatorio</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div>
                  <h4 className="font-semibold text-sm mb-2">Información Requerida:</h4>
                  <ul className="space-y-1 text-sm text-[#71717A]">
                    <li>✓ Nombre completo del titular</li>
                    <li>✓ RUT (Rut Único Tributario) formato XX.XXX.XXX-K</li>
                    <li>✓ Fotografía del titular</li>
                    <li>✓ Fecha de nacimiento</li>
                    <li>✓ Estado civil</li>
                    <li>✓ Código QR de autenticación (nuevo carnet 2024)</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-sm mb-2">Elementos de Seguridad:</h4>
                  <ul className="space-y-1 text-sm text-[#71717A]">
                    <li>• 32 medidas de seguridad</li>
                    <li>• Chip de identificación</li>
                    <li>• Código QR reverso</li>
                    <li>• Elementos táctiles para discapacidad visual</li>
                    <li>• Símbolo copihue, huemul y cóndor</li>
                    <li>• Cordillera de los Andes como fondo</li>
                  </ul>
                </div>
                <div className="bg-blue-50 p-3 rounded-lg">
                  <div className="flex gap-2">
                    <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-blue-900">
                      <strong>Nota:</strong> La cédula de identidad NO es documento de conducir. La licencia de conducir es un documento adicional y separado.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                Certificado RUT
              </CardTitle>
              <CardDescription>Documento tributario del SII</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div>
                  <h4 className="font-semibold text-sm mb-2">Información Requerida:</h4>
                  <ul className="space-y-1 text-sm text-[#71717A]">
                    <li>✓ RUT con formato XX.XXX.XXX-K</li>
                    <li>✓ Nombre completo (persona o razón social)</li>
                    <li>✓ Estado tributario (ACTIVO/INACTIVO)</li>
                    <li>✓ Actividad económica (si aplica)</li>
                    <li>✓ Fecha de emisión</li>
                  </ul>
                </div>
                <div className="bg-green-50 p-3 rounded-lg">
                  <p className="text-sm text-green-900">
                    <strong>Descarga:</strong> Disponible en <strong>www.sii.cl</strong> - Opción "e-RUT"
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* CONDUCTOR */}
        <TabsContent value="conductor" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                Licencia de Conducir
              </CardTitle>
              <CardDescription>Documento obligatorio para conducir</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div>
                  <h4 className="font-semibold text-sm mb-2">Clases de Licencia:</h4>
                  <div className="space-y-2">
                    <div className="flex items-start gap-3">
                      <Badge variant="default" className="mt-1">CLASE B</Badge>
                      <div className="text-sm">
                        <p className="font-semibold">Vehículos particulares (automóviles)</p>
                        <p className="text-[#71717A]">Peso hasta 3.500 kg</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Badge variant="default" className="mt-1">CLASE D</Badge>
                      <div className="text-sm">
                        <p className="font-semibold">Transporte de carga (camiones)</p>
                        <p className="text-[#71717A]">Requiere capacitación especial</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Badge variant="default" className="mt-1">CLASE E</Badge>
                      <div className="text-sm">
                        <p className="font-semibold">Transporte de pasajeros</p>
                        <p className="text-[#71717A]">Buses y microbuses. Requerimientos de salud más estrictos</p>
                      </div>
                    </div>
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold text-sm mb-2">Información en la Licencia:</h4>
                  <ul className="space-y-1 text-sm text-[#71717A]">
                    <li>✓ RUT del conductor (número de licencia)</li>
                    <li>✓ Nombre completo</li>
                    <li>✓ Fotografía</li>
                    <li>✓ Clase de licencia</li>
                    <li>✓ Fecha de vencimiento (cumpleaños)</li>
                    <li>✓ Firma del Director de Tránsito</li>
                    <li>✓ Holograma del Escudo Nacional</li>
                  </ul>
                </div>
                <div className="bg-yellow-50 p-3 rounded-lg">
                  <div className="flex gap-2">
                    <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-yellow-900">
                      La licencia vence el día del cumpleaños del conductor. Debe renovarse antes de esa fecha.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* VEHÍCULO */}
        <TabsContent value="vehiculo" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                Tarjeta de Circulación
              </CardTitle>
              <CardDescription>Documento anual de validez del vehículo</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <ul className="space-y-1 text-sm text-[#71717A]">
                <li>✓ Patente del vehículo</li>
                <li>✓ Propietario (nombre y RUT)</li>
                <li>✓ Año vencimiento</li>
                <li>✓ Clase de vehículo</li>
                <li>✓ Marca, modelo y año</li>
                <li>✓ Número de motor y chasis</li>
                <li>✓ Cilindrada</li>
                <li>✓ Color oficial</li>
              </ul>
              <p className="text-xs text-[#A1A1A6] pt-2">
                Documento verde del MTT. Obligatorio tener a bordo del vehículo.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                RTV (Revisión Técnica Vehicular)
              </CardTitle>
              <CardDescription>Inspección técnica anual obligatoria</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2">
                <h4 className="font-semibold text-sm">Sistemas Verificados:</h4>
                <ul className="space-y-1 text-sm text-[#71717A]">
                  <li>• Frenos (eficiencia)</li>
                  <li>• Sistema de luces (faros, frenos, intermitentes)</li>
                  <li>• Embrague</li>
                  <li>• Dirección</li>
                  <li>• Suspensión</li>
                  <li>• Neumáticos y ruedas</li>
                  <li>• Protecciones (parachoques, espejos)</li>
                  <li>• Emisión de gases (ambiental)</li>
                </ul>
              </div>
              <p className="text-xs text-[#A1A1A6] pt-2">
                Vencimiento: Un año desde fecha de aprobación. Realizado en plantas RTV autorizadas.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* SEGURO */}
        <TabsContent value="seguro" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                Seguro de Responsabilidad Civil (RC)
              </CardTitle>
              <CardDescription>Cobertura obligatoria de daños a terceros</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div>
                  <h4 className="font-semibold text-sm mb-2">Información en Póliza:</h4>
                  <ul className="space-y-1 text-sm text-[#71717A]">
                    <li>✓ Número de póliza</li>
                    <li>✓ Nombre compañía aseguradora</li>
                    <li>✓ Vehículo asegurado (patente, marca, modelo)</li>
                    <li>✓ Propietario (nombre y RUT)</li>
                    <li>✓ Vigencia (desde/hasta fechas)</li>
                    <li>✓ Montos de cobertura en pesos chilenos</li>
                    <li>✓ Prima anual</li>
                  </ul>
                </div>
                <div className="bg-red-50 p-3 rounded-lg">
                  <div className="flex gap-2">
                    <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-red-900">
                      <strong>Obligatorio:</strong> Tener póliza vigente. La multa por conducir sin seguro es significativa.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Card className="border-blue-200 bg-blue-50">
        <CardHeader>
          <CardTitle className="text-base">Checklist Antes de Subir Documentos</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" className="rounded" />
            <span>Todos los documentos están vigentes (no vencidos)</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" className="rounded" />
            <span>Los RUT coinciden entre documentos (mismo formato XX.XXX.XXX-K)</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" className="rounded" />
            <span>Las imágenes son legibles y claras</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" className="rounded" />
            <span>Se incluyen frente y reverso cuando aplica</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" className="rounded" />
            <span>El vehículo en tarjeta coincide con el de RTV y seguro</span>
          </label>
        </CardContent>
      </Card>
    </div>
  )
}
