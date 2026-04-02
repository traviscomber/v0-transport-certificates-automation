'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { FileText, Download, CheckCircle, Clock, AlertTriangle, Plus } from 'lucide-react'

interface Certificate {
  id: string
  certificate_type: string
  file_name: string
  file_url: string
  expiry_date: string
  status: 'pending' | 'approved' | 'rejected' | 'expired'
  created_at: string
}

export default function CertificatesPage() {
  const [certificates, setCertificates] = useState<Certificate[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchCertificates()
  }, [])

  const fetchCertificates = async () => {
    try {
      const response = await fetch('/api/certificates')
      if (response.ok) {
        const { data } = await response.json()
        setCertificates(data || [])
      }
    } catch (error) {
      console.error('Error fetching certificates:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved': return <CheckCircle className='h-5 w-5 text-green-500' />
      case 'pending': return <Clock className='h-5 w-5 text-yellow-500' />
      case 'rejected': return <AlertTriangle className='h-5 w-5 text-red-500' />
      case 'expired': return <AlertTriangle className='h-5 w-5 text-orange-500' />
      default: return <FileText className='h-5 w-5 text-blue-500' />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-500/30 text-green-200 border-green-500/50'
      case 'pending': return 'bg-yellow-500/30 text-yellow-200 border-yellow-500/50'
      case 'rejected': return 'bg-red-500/30 text-red-200 border-red-500/50'
      case 'expired': return 'bg-orange-500/30 text-orange-200 border-orange-500/50'
      default: return 'bg-slate-500/30 text-slate-200 border-slate-500/50'
    }
  }

  const isExpiringSoon = (expiryDate: string) => {
    if (!expiryDate) return false
    const days = Math.ceil((new Date(expiryDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
    return days <= 30 && days > 0
  }

  return (
    <div className='min-h-screen bg-gradient-dark p-4 sm:p-6 lg:p-8'>
      <div className='space-y-8'>
        {/* Header */}
        <div className='flex items-center justify-between'>
          <div className='space-y-2'>
            <h1 className='text-3xl font-bold text-foreground'>Gestión de Certificados</h1>
            <p className='text-muted-foreground'>Documentos y certificados legales</p>
          </div>
          <Button className='btn-orange'>
            <Plus className='h-4 w-4 mr-2' />
            Subir Certificado
          </Button>
        </div>

        {/* Certificates List */}
        <div className='space-y-4'>
          {loading ? (
            <Card className='border-slate-700/50 bg-gradient-to-br from-slate-800 to-slate-900'>
              <CardContent className='p-8 text-center'>
                <div className='text-muted-foreground'>Cargando certificados...</div>
              </CardContent>
            </Card>
          ) : certificates.length === 0 ? (
            <Card className='border-slate-700/50 bg-gradient-to-br from-slate-800 to-slate-900'>
              <CardContent className='p-8 text-center'>
                <FileText className='h-12 w-12 text-slate-400 mx-auto mb-4' />
                <div className='text-foreground font-semibold'>Sin certificados</div>
                <div className='text-muted-foreground'>Sube tus certificados y documentos</div>
              </CardContent>
            </Card>
          ) : (
            certificates.map(cert => (
              <Card key={cert.id} className='border-slate-700/50 bg-gradient-to-br from-slate-800 to-slate-900 hover:border-slate-600 transition-all'>
                <CardContent className='p-6'>
                  <div className='flex items-start gap-4'>
                    <div className='mt-1'>
                      {getStatusIcon(cert.status)}
                    </div>
                    <div className='flex-1'>
                      <div className='flex items-center gap-3 mb-2'>
                        <h3 className='font-semibold text-foreground'>{cert.file_name}</h3>
                        <Badge className={getStatusColor(cert.status)}>
                          {cert.status.toUpperCase()}
                        </Badge>
                        {isExpiringSoon(cert.expiry_date) && (
                          <Badge className='bg-orange-500/30 text-orange-200 border border-orange-500/50'>
                            Próximo a vencer
                          </Badge>
                        )}
                      </div>
                      <p className='text-muted-foreground text-sm mb-3'>{cert.certificate_type}</p>
                      <div className='flex items-center justify-between'>
                        <div className='flex gap-4 text-xs text-muted-foreground'>
                          {cert.expiry_date && (
                            <span>Vencimiento: {new Date(cert.expiry_date).toLocaleDateString('es-ES')}</span>
                          )}
                          <span>Subido: {new Date(cert.created_at).toLocaleDateString('es-ES')}</span>
                        </div>
                        <div className='flex gap-2'>
                          <Button variant='outline' size='sm' className='text-xs'>
                            <Download className='h-3 w-3 mr-1' />
                            Descargar
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
