'use client'

import { X, FileText, Award, AlertCircle, CheckCircle } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface SubcontractorDetailCardProps {
  subcontractor: any
  onClose: () => void
}

export function SubcontractorDetailCard({
  subcontractor,
  onClose,
}: SubcontractorDetailCardProps) {
  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 z-40 bg-black/70" onClick={onClose} />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-slate-900 border-slate-700">
          <CardHeader className="flex flex-row items-start justify-between border-b border-slate-700 sticky top-0 bg-slate-900">
            <div className="space-y-2 flex-1">
              <CardTitle className="text-2xl text-white">
                {subcontractor.nombre}
              </CardTitle>
              {subcontractor.nombre_fantasia && (
                <p className="text-sm text-slate-400 italic">
                  {subcontractor.nombre_fantasia}
                </p>
              )}
              <div className="flex gap-2 items-center">
                {subcontractor.is_active ? (
                  <>
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <Badge className="bg-green-500/20 text-green-300">Activo</Badge>
                  </>
                ) : (
                  <>
                    <AlertCircle className="w-4 h-4 text-red-500" />
                    <Badge className="bg-red-500/20 text-red-300">Inactivo</Badge>
                  </>
                )}
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </CardHeader>

          <CardContent className="space-y-6 p-6">
            {/* Company Info */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-slate-400 font-semibold mb-1">RUT</p>
                <p className="font-mono text-amber-400 font-bold">{subcontractor.rut}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400 font-semibold mb-1">COMUNA</p>
                <p className="text-white">{subcontractor.comuna || 'N/A'}</p>
              </div>
              <div className="col-span-2">
                <p className="text-xs text-slate-400 font-semibold mb-1">DIRECCIÓN</p>
                <p className="text-white">{subcontractor.direccion || 'N/A'}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400 font-semibold mb-1">
                  REPRESENTANTE LEGAL
                </p>
                <p className="text-white">{subcontractor.representante_legal || 'N/A'}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400 font-semibold mb-1">
                  EJECUTIVA ASIGNADA
                </p>
                <p className="text-white">{subcontractor.ejecutivo_nombre || 'Sin asignar'}</p>
              </div>
            </div>

            {/* Contact Information */}
            <div className="border-t border-slate-700 pt-4 space-y-3">
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <span className="inline-block w-2 h-2 bg-blue-500 rounded-full"></span>
                Información de Contacto
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-xs text-slate-400 font-semibold mb-1">TELÉFONO</p>
                  {subcontractor.telefono ? (
                    <a
                      href={`tel:${subcontractor.telefono}`}
                      className="text-blue-400 hover:text-blue-300 transition-colors"
                    >
                      {subcontractor.telefono}
                    </a>
                  ) : (
                    <p className="text-slate-500">No disponible</p>
                  )}
                </div>
                <div>
                  <p className="text-xs text-slate-400 font-semibold mb-1">EMAIL</p>
                  {subcontractor.email || subcontractor.correo ? (
                    <a
                      href={`mailto:${subcontractor.email || subcontractor.correo}`}
                      className="text-blue-400 hover:text-blue-300 transition-colors break-all"
                    >
                      {subcontractor.email || subcontractor.correo}
                    </a>
                  ) : (
                    <p className="text-slate-500">No disponible</p>
                  )}
                </div>
              </div>
            </div>

            {/* Certifications */}
            <div className="border-t border-slate-700 pt-4 space-y-3">
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <Award className="w-4 h-4" />
                Certificaciones
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                <div className="p-3 rounded bg-blue-900/20 border border-blue-800 text-center">
                  <p className="text-xs text-blue-400 font-semibold mb-1">ARIZTIA</p>
                  <p className="text-2xl text-blue-300">
                    {subcontractor.ariztia ? '✓' : '—'}
                  </p>
                </div>
                <div className="p-3 rounded bg-green-900/20 border border-green-800 text-center">
                  <p className="text-xs text-green-400 font-semibold mb-1">LTS</p>
                  <p className="text-2xl text-green-300">
                    {subcontractor.lts ? '✓' : '—'}
                  </p>
                </div>
                <div className="p-3 rounded bg-purple-900/20 border border-purple-800 text-center">
                  <p className="text-xs text-purple-400 font-semibold mb-1">RENDIC</p>
                  <p className="text-2xl text-purple-300">
                    {subcontractor.rendic ? '✓' : '—'}
                  </p>
                </div>
                <div className="p-3 rounded bg-orange-900/20 border border-orange-800 text-center">
                  <p className="text-xs text-orange-400 font-semibold mb-1">INTERPOLAR</p>
                  <p className="text-2xl text-orange-300">
                    {subcontractor.interpolar ? '✓' : '—'}
                  </p>
                </div>
              </div>
            </div>

            {/* Documents Summary */}
            <div className="border-t border-slate-700 pt-4 space-y-3">
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Carpeta de Documentos
              </h3>
              <p className="text-xs text-slate-400">
                Esta sección mostrará los documentos requeridos y cargados.
              </p>
              <button className="w-full px-4 py-2 rounded bg-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-700 transition-colors text-sm">
                Ver Documentos Completos
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  )
}
