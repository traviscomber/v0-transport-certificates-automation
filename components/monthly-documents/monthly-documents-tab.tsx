import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Calendar } from 'lucide-react'

export const MONTHLY_DOCUMENTS = [
  { id: 'planillas_afp', name: 'Planillas de imposiciones (AFP, Salud, Mutual, Seguro Social)', providers: [] },
  { id: 'iva', name: 'IVA', providers: [] },
  { id: 'f30', name: 'F30', providers: [] },
  { id: 'f30_1', name: 'F30-1', providers: [] },
  { id: 'liq_sueldo', name: 'Liq Sueldo', providers: [] },
  { id: 'cert_afil_mutual', name: 'Cert. Afil Mutual', providers: [] },
  { id: 'cert_tasas_mutual', name: 'Cert. Tasas Mutual', providers: [] },
  { id: 'hoja_vida', name: 'Hoja de vida', providers: [] },
  { id: 'cert_antecedentes', name: 'Cert. Antecedentes', providers: [] },
  { id: 'cert_cotizaciones', name: 'Certificado de cotizaciones', providers: ['Ariztia'] },
  { id: 'f30_1_lts', name: 'F30-1 Lts', providers: ['LTS'] },
  { id: 'comprobantes_sueldo', name: 'Comprobantes de pago sueldo', providers: ['Rendic', 'Interpolar'] },
]

interface MonthlyDocument {
  id: string
  driver_id: string
  document_type: string
  month_year: string
  status: 'pending' | 'uploaded' | 'verified' | 'expired'
  provider: string
  file_url?: string
  file_name?: string
  uploaded_at?: string
  expiry_date?: string
}

export function MonthlyDocumentsTab() {
  const [documents, setDocuments] = useState<MonthlyDocument[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7))
  const [selectedDriver, setSelectedDriver] = useState<string>('')
  const [selectedProvider, setSelectedProvider] = useState<string>('all')
  const [drivers, setDrivers] = useState<Array<{ id: string; nombre: string }>>([])

  useEffect(() => {
    fetchDocuments()
    fetchDrivers()
  }, [selectedMonth, selectedDriver, selectedProvider])

  const fetchDocuments = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (selectedMonth) params.append('month_year', selectedMonth)
      if (selectedDriver) params.append('driver_id', selectedDriver)
      if (selectedProvider !== 'all') params.append('provider', selectedProvider)

      const response = await fetch(`/api/company/monthly-documents?${params}`)
      if (response.ok) {
        const data = await response.json()
        setDocuments(data)
      }
    } catch (error) {
      console.error('Failed to fetch documents:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchDrivers = async () => {
    try {
      const response = await fetch('/api/company/data')
      if (response.ok) {
        const data = await response.json()
        setDrivers(data.drivers || [])
      }
    } catch (error) {
      console.error('Failed to fetch drivers:', error)
    }
  }

  const getStatusBadge = (status: string) => {
    const variants: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-800',
      uploaded: 'bg-blue-100 text-blue-800',
      verified: 'bg-green-100 text-green-800',
      expired: 'bg-red-100 text-red-800',
    }
    return variants[status] || variants.pending
  }

  const documentsByType = MONTHLY_DOCUMENTS.reduce((acc, docType) => {
    const docsOfType = documents.filter(d => d.document_type === docType.id)
    return { ...acc, [docType.id]: docsOfType }
  }, {} as Record<string, MonthlyDocument[]>)

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Documentos Mensuales</CardTitle>
          <CardDescription>Gestiona y sigue el estado de documentos requeridos mensuales</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Mes</label>
              <Input
                type="month"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="w-full"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Conductor</label>
              <Select value={selectedDriver || 'all'} onValueChange={(value) => setSelectedDriver(value === 'all' ? '' : value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  {drivers.map((driver) => (
                    <SelectItem key={driver.id} value={driver.id}>
                      {driver.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Proveedor</label>
              <Select value={selectedProvider} onValueChange={setSelectedProvider}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="">General</SelectItem>
                  <SelectItem value="Ariztia">Ariztia</SelectItem>
                  <SelectItem value="LTS">LTS</SelectItem>
                  <SelectItem value="Rendic">Rendic</SelectItem>
                  <SelectItem value="Interpolar">Interpolar</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button onClick={fetchDocuments} className="w-full">
                Filtrar
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {loading ? (
        <Card className="p-6 text-center text-gray-500">Cargando documentos...</Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {MONTHLY_DOCUMENTS.map((docType) => (
            <Card key={docType.id}>
              <CardHeader>
                <CardTitle className="text-lg">{docType.name}</CardTitle>
                {docType.providers.length > 0 && (
                  <CardDescription>
                    Proveedores: {docType.providers.join(', ')}
                  </CardDescription>
                )}
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {(documentsByType[docType.id] || []).length === 0 ? (
                    <p className="text-sm text-gray-500">No hay documentos registrados</p>
                  ) : (
                    (documentsByType[docType.id] || []).map((doc) => (
                      <div key={doc.id} className="flex items-center justify-between p-2 border rounded">
                        <div className="flex-1">
                          <p className="text-sm font-medium">{drivers.find(d => d.id === doc.driver_id)?.nombre || doc.driver_id}</p>
                          <p className="text-xs text-gray-500">{doc.provider}</p>
                        </div>
                        <Badge className={getStatusBadge(doc.status)}>
                          {doc.status}
                        </Badge>
                      </div>
                    ))
                  )}
                  <Button variant="outline" size="sm" className="w-full mt-4">
                    Subir Documento
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
