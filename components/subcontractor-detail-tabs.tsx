'use client'

import { X, FileText, Award, AlertCircle, CheckCircle, Loader, Download, Eye, Users, CheckSquare, Mail, Phone } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

interface SubcontractorDetailTabsProps {
  subcontractor: any
  initialTab?: 'resumen' | 'documentos' | 'conductores' | 'certificaciones' | 'onboarding'
  conductoresData?: any[]
  onClose: () => void
}

export function SubcontractorDetailTabs({
  subcontractor,
  initialTab = 'resumen',
  conductoresData = [],
  onClose,
}: SubcontractorDetailTabsProps) {
  const router = useRouter()
  const [documents, setDocuments] = useState<any[]>([])
  const [requirements, setRequirements] = useState<any[]>([])
  const [conductors, setConductors] = useState<any[]>(conductoresData)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState(initialTab)
  const [summary, setSummary] = useState({
    totalDocumentsUploaded: 0,
    totalRequirements: 0,
    approvedDocuments: 0,
    pendingDocuments: 0,
    expiredDocuments: 0,
  })

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch documents and requirements
        const docResponse = await fetch(`/api/subcontractors/${subcontractor.id}/documents`)
        if (docResponse.ok) {
          const data = await docResponse.json()
          setDocuments(data.documents || [])
          setRequirements(data.requirements || [])
          setSummary(data.summary || summary)
        }

        // Conductors are passed as a prop from subcontractors-list, no need to fetch
        // Use the conductoresData that's already been filtered by RUT matching
      } catch (error) {
        console.error('[v0] Error fetching data:', error)
      } finally {
        setLoading(false)
      }
    }

    if (subcontractor.id) {
      fetchData()
    }
  }, [subcontractor.id])

  const handleRefreshData = async () => {
    const docResponse = await fetch(`/api/subcontractors/${subcontractor.id}/documents`)
    if (docResponse.ok) {
      const data = await docResponse.json()
      setDocuments(data.documents || [])
      setRequirements(data.requirements || [])
      setSummary(data.summary || summary)
    }
  }

  const certifications = [
    { name: 'ARIZTIA', key: 'has_ariztia' },
    { name: 'LTS', key: 'has_lts' },
    { name: 'RENDIC', key: 'has_rendic' },
    { name: 'INTERPOLAR', key: 'has_interpolar' },
  ]

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 z-40 bg-black/70" onClick={onClose} />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col bg-slate-900 border-slate-700">
          {/* Header */}
          <CardHeader className="flex flex-row items-start justify-between border-b border-slate-700 sticky top-0 bg-slate-900 z-10">
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

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={(value: any) => setActiveTab(value)} className="flex-1 overflow-hidden flex flex-col">
            <TabsList className="border-b border-slate-700 rounded-none bg-slate-800/50 w-full justify-start px-6 py-0 h-auto">
              <TabsTrigger value="resumen" className="rounded-none">
                Resumen
              </TabsTrigger>
              <TabsTrigger value="documentos" className="rounded-none">
                Documentos ({summary.totalDocumentsUploaded}/{summary.totalRequirements})
              </TabsTrigger>
              <TabsTrigger value="certificaciones" className="rounded-none">
                Certificaciones
              </TabsTrigger>
              <TabsTrigger value="conductores" className="rounded-none">
                Conductores ({conductors.length})
              </TabsTrigger>
              <TabsTrigger value="onboarding" className="rounded-none">
                Onboarding
              </TabsTrigger>
            </TabsList>

            {/* Tab Content */}
            <div className="overflow-y-auto flex-1">
              <CardContent className="p-6 space-y-6">
                {/* RESUMEN TAB */}
                <TabsContent value="resumen" className="space-y-6 mt-0">
                  {/* Company Info Grid */}
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
                      <p className="text-xs text-slate-400 font-semibold mb-1">REPRESENTANTE LEGAL</p>
                      <p className="text-white">{subcontractor.representante_legal || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-400 font-semibold mb-1">EJECUTIVA ASIGNADA</p>
                      <p className="text-white">{subcontractor.ejecutivo_nombre || 'Sin asignar'}</p>
                    </div>
                  </div>

                  {/* Contact Section */}
                  <div className="border-t border-slate-700 pt-4 space-y-3">
                    <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                      <Mail className="w-4 h-4 text-blue-400" />
                      Contacto Directo
                    </h3>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <p className="text-xs text-slate-400 font-semibold mb-1">TELÉFONO</p>
                        {subcontractor.telefono ? (
                          <a href={`tel:${subcontractor.telefono}`} className="text-blue-400 hover:text-blue-300 flex items-center gap-2">
                            <Phone className="w-3 h-3" />
                            {subcontractor.telefono}
                          </a>
                        ) : (
                          <p className="text-slate-500">No disponible</p>
                        )}
                      </div>
                      <div>
                        <p className="text-xs text-slate-400 font-semibold mb-1">EMAIL</p>
                        {subcontractor.email || subcontractor.correo ? (
                          <a href={`mailto:${subcontractor.email || subcontractor.correo}`} className="text-blue-400 hover:text-blue-300 text-sm">
                            {subcontractor.email || subcontractor.correo}
                          </a>
                        ) : (
                          <p className="text-slate-500">No disponible</p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Compliance Status */}
                  <div className="border-t border-slate-700 pt-4 space-y-3">
                    <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                      <CheckSquare className="w-4 h-4 text-purple-400" />
                      Estado de Cumplimiento
                    </h3>
                    <div className="grid grid-cols-5 gap-2">
                      <div className="p-3 rounded bg-slate-800 text-center">
                        <p className="text-lg font-bold text-white">{summary.totalRequirements}</p>
                        <p className="text-xs text-slate-400">Requeridos</p>
                      </div>
                      <div className="p-3 rounded bg-blue-900/20 border border-blue-800 text-center">
                        <p className="text-lg font-bold text-blue-300">{summary.totalDocumentsUploaded}</p>
                        <p className="text-xs text-blue-400">Subidos</p>
                      </div>
                      <div className="p-3 rounded bg-green-900/20 border border-green-800 text-center">
                        <p className="text-lg font-bold text-green-300">{summary.approvedDocuments}</p>
                        <p className="text-xs text-green-400">Aprobados</p>
                      </div>
                      <div className="p-3 rounded bg-yellow-900/20 border border-yellow-800 text-center">
                        <p className="text-lg font-bold text-yellow-300">{summary.pendingDocuments}</p>
                        <p className="text-xs text-yellow-400">Pendientes</p>
                      </div>
                      <div className="p-3 rounded bg-red-900/20 border border-red-800 text-center">
                        <p className="text-lg font-bold text-red-300">{summary.expiredDocuments}</p>
                        <p className="text-xs text-red-400">Vencidos</p>
                      </div>
                    </div>

                    {/* Compliance Bar */}
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-slate-400">Progreso General</span>
                        <span className="text-sm font-bold text-white">
                          {summary.totalRequirements > 0 
                            ? Math.round((summary.approvedDocuments / summary.totalRequirements) * 100)
                            : 0}%
                        </span>
                      </div>
                      <div className="w-full bg-slate-700 rounded-full h-2 overflow-hidden">
                        <div 
                          className="bg-gradient-to-r from-green-500 to-green-400 h-full rounded-full transition-all"
                          style={{ width: `${summary.totalRequirements > 0 ? (summary.approvedDocuments / summary.totalRequirements) * 100 : 0}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </TabsContent>

                {/* DOCUMENTOS TAB */}
                <TabsContent value="documentos" className="space-y-4 mt-0">
                  {loading ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader className="w-4 h-4 animate-spin text-slate-400 mr-2" />
                      <span className="text-sm text-slate-400">Cargando documentos...</span>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {requirements.length > 0 ? (
                        requirements.map((req) => {
                          const statusColors: Record<string, string> = {
                            aprobado: 'bg-green-900/20 border-green-800 text-green-400',
                            pendiente: 'bg-yellow-900/20 border-yellow-800 text-yellow-400',
                            rechazado: 'bg-red-900/20 border-red-800 text-red-400',
                            vencido: 'bg-orange-900/20 border-orange-800 text-orange-400',
                            no_subido: 'bg-slate-800 text-slate-400',
                          }
                          const statusColor = statusColors[req.status] || statusColors.no_subido
                          const statusLabel: Record<string, string> = {
                            aprobado: 'Aprobado',
                            pendiente: 'Pendiente',
                            rechazado: 'Rechazado',
                            vencido: 'Vencido',
                            no_subido: 'No subido',
                          }
                          
                          const uploadedDoc = documents.find((d) => d.nombre?.includes(req.code ?? ''));
                          
                          return (
                            <div
                              key={req.id}
                              className={`p-3 rounded border flex items-center justify-between ${statusColor}`}
                            >
                              <div className="flex-1">
                                <p className="font-mono text-xs font-bold">{req.code}</p>
                                <p className="text-xs">{req.nombre || 'Documento requerido'}</p>
                              </div>
                              <div className="flex items-center gap-2 ml-4">
                                <span className="text-xs font-semibold">{statusLabel[req.status]}</span>
                                {uploadedDoc && uploadedDoc.archivo_url && (
                                  <div className="flex gap-2">
                                    <a
                                      href={`/api/documents/preview?path=${encodeURIComponent(uploadedDoc.archivo_url)}`}
                                      target="_blank"
                                      className="hover:opacity-75 transition-opacity"
                                      title="Ver documento"
                                    >
                                      <Eye className="w-4 h-4" />
                                    </a>
                                    <a
                                      href={`/api/documents/download?path=${encodeURIComponent(uploadedDoc.archivo_url)}`}
                                      download
                                      className="hover:opacity-75 transition-opacity"
                                      title="Descargar"
                                    >
                                      <Download className="w-4 h-4" />
                                    </a>
                                  </div>
                                )}
                              </div>
                            </div>
                          )
                        })
                      ) : (
                        <p className="text-sm text-slate-400 text-center py-8">No hay requisitos disponibles</p>
                      )}
                    </div>
                  )}
                </TabsContent>

                {/* CERTIFICACIONES TAB */}
                <TabsContent value="certificaciones" className="space-y-4 mt-0">
                  <div className="grid grid-cols-2 gap-3">
                    {certifications.map((cert) => {
                      const hasCert = subcontractor[cert.key];
                      const certDoc = documents.find((d) => d.nombre?.includes(cert.name ?? ''));
                      
                      return (
                        <div key={cert.key} className="space-y-2">
                          <div className={`p-4 rounded border-2 transition-all ${
                            hasCert
                              ? certDoc 
                                ? 'bg-green-900/30 border-green-600'
                                : 'bg-yellow-900/30 border-yellow-600'
                              : 'bg-slate-800/30 border-slate-700 opacity-50'
                          }`}>
                            <div className="flex items-center justify-between mb-2">
                              <p className="text-sm font-bold text-white">{cert.name}</p>
                              <div className="text-lg">
                                {!hasCert ? '✗' : certDoc ? '✓' : '⚠'}
                              </div>
                            </div>
                            <p className="text-xs text-slate-300">
                              {!hasCert 
                                ? 'No registrada'
                                : certDoc
                                ? 'Con documento'
                                : 'Registrada sin documento'
                              }
                            </p>
                          </div>
                          {hasCert && certDoc && certDoc.archivo_url && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="w-full text-xs"
                              onClick={() => window.open(`/api/documents/preview?path=${encodeURIComponent(certDoc.archivo_url)}`, '_blank')}
                            >
                              <Eye className="w-3 h-3 mr-1" />
                              Ver Documento
                            </Button>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </TabsContent>

                {/* CONDUCTORES TAB */}
                <TabsContent value="conductores" className="space-y-4 mt-0">
                  {conductors.length > 0 ? (
                    <div className="space-y-3">
                      {conductors.map((conductor) => (
                        <div key={conductor.id} className="p-4 rounded border border-slate-700 bg-slate-800/30">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <p className="font-semibold text-white">{conductor.nombre}</p>
                              <p className="text-xs text-slate-400 mb-2">RUT: <span className="font-mono text-amber-400">{conductor.rut?.replace(/\./g, '')}</span></p>
                              
                              {conductor.is_active && (
                                <Badge className="bg-green-500/20 text-green-300 text-xs">Activo</Badge>
                              )}
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-xs"
                              onClick={() => {
                                // Navigate to conductores page to show this conductor
                                onClose()
                                router.push(`/dashboard/company/conductores?rut=${conductor.rut.replace(/\./g, '')}`)
                              }}
                            >
                              Ver Ficha
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-slate-400 text-center py-8">Sin conductores asociados</p>
                  )}
                </TabsContent>

                {/* ONBOARDING TAB */}
                <TabsContent value="onboarding" className="space-y-4 mt-0">
                  <div className="space-y-3">
                    <p className="text-sm text-slate-300 mb-4">
                      Lista de verificación para activación de nuevo subcontratista
                    </p>
                    
                    <div className="space-y-2">
                      {[
                        { label: 'Documentos EMPRESA completados', status: requirements.filter(r => r.category === 'Empresa').some(r => r.status === 'aprobado') },
                        { label: 'Documentos SUBCONTRATACIÓN completados', status: requirements.filter(r => r.category === 'Subcontratación').some(r => r.status === 'aprobado') },
                        { label: 'Certificaciones registradas', status: certifications.some(c => subcontractor[c.key]) },
                        { label: 'Conductores asignados', status: conductors.length > 0 },
                        { label: 'Contacto verificado', status: !!subcontractor.telefono && !!subcontractor.email },
                      ].map((item, idx) => (
                        <div key={idx} className="flex items-center gap-3 p-2 rounded border border-slate-700">
                          <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                            item.status 
                              ? 'bg-green-500/20 border-green-600'
                              : 'bg-slate-800 border-slate-600'
                          }`}>
                            {item.status && <CheckCircle className="w-3 h-3 text-green-400" />}
                          </div>
                          <span className={item.status ? 'text-green-400 text-sm' : 'text-slate-400 text-sm'}>
                            {item.label}
                          </span>
                        </div>
                      ))}
                    </div>

                    <div className="border-t border-slate-700 pt-4 mt-4">
                      <Button 
                        className="w-full bg-blue-600 hover:bg-blue-700"
                        onClick={() => {
                          // Send onboarding email/invite
                        }}
                      >
                        <Mail className="w-4 h-4 mr-2" />
                        Enviar Instrucciones de Onboarding
                      </Button>
                    </div>
                  </div>
                </TabsContent>
              </CardContent>
            </div>
          </Tabs>
        </Card>
      </div>
    </>
  )
}
