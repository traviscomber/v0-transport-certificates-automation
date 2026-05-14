"use client"

import { useState, useEffect, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import {
  Search,
  Plus,
  Eye,
  Edit,
  Trash2,
  Building,
  Phone,
  Mail,
  MapPin,
  FileText,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Users,
  Truck,
  Calendar,
} from "lucide-react"

interface Transporter {
  id: string
  companyName: string
  rut: string
  contactName: string
  email: string
  phone: string
  address: string
  city: string
  region: string
  status: "active" | "inactive" | "suspended"
  registrationDate: string
  lastActivity: string
  documentsCount: {
    total: number
    approved: number
    pending: number
    expired: number
  }
  vehicles: Vehicle[]
  notes?: string
}

interface Vehicle {
  id: string
  plate: string
  type: string
  year: string
  brand: string
  model: string
}

// Mock data for transporters
const mockTransporters: Transporter[] = [
  {
    id: "1",
    companyName: "Transportes González Ltda.",
    rut: "76.123.456-7",
    contactName: "Carlos González",
    email: "carlos@transportesgonzalez.cl",
    phone: "+56 9 8765 4321",
    address: "Av. Libertador 1234",
    city: "Santiago",
    region: "Metropolitana",
    status: "active",
    registrationDate: "2023-06-15",
    lastActivity: "2024-01-15",
    documentsCount: {
      total: 8,
      approved: 6,
      pending: 1,
      expired: 1,
    },
    vehicles: [
      { id: "1", plate: "ABCD-12", type: "Camión", year: "2020", brand: "Mercedes", model: "Actros" },
      { id: "2", plate: "EFGH-34", type: "Camioneta", year: "2019", brand: "Ford", model: "Ranger" },
    ],
    notes: "Cliente confiable con buen historial de cumplimiento",
  },
  {
    id: "2",
    companyName: "Logística del Sur S.A.",
    rut: "96.789.123-4",
    contactName: "María Rodríguez",
    email: "maria@logisticasur.cl",
    phone: "+56 9 1234 5678",
    address: "Calle Principal 567",
    city: "Temuco",
    region: "Araucanía",
    status: "active",
    registrationDate: "2023-08-20",
    lastActivity: "2024-01-14",
    documentsCount: {
      total: 12,
      approved: 8,
      pending: 3,
      expired: 1,
    },
    vehicles: [
      { id: "3", plate: "IJKL-56", type: "Camión", year: "2021", brand: "Volvo", model: "FH" },
      { id: "4", plate: "MNOP-78", type: "Remolque", year: "2020", brand: "Krone", model: "SD" },
    ],
  },
  {
    id: "3",
    companyName: "Carga Pesada Ltda.",
    rut: "79.987.654-3",
    contactName: "Juan Pérez",
    email: "juan@cargapesada.cl",
    phone: "+56 9 9876 5432",
    address: "Industrial Norte 890",
    city: "Antofagasta",
    region: "Antofagasta",
    status: "suspended",
    registrationDate: "2023-03-10",
    lastActivity: "2023-12-20",
    documentsCount: {
      total: 6,
      approved: 2,
      pending: 1,
      expired: 3,
    },
    vehicles: [{ id: "5", plate: "QRST-90", type: "Camión", year: "2018", brand: "Scania", model: "R450" }],
    notes: "Suspendido por documentos vencidos - requiere regularización",
  },
]

export function TransporterManagement() {
  const [transporters, setTransporters] = useState<Transporter[]>(mockTransporters)
  const [supabaseTransporters, setSupabaseTransporters] = useState<any[]>([])
  const [uploadedDocuments, setUploadedDocuments] = useState<any[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [selectedTransporter, setSelectedTransporter] = useState<Transporter | null>(null)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editingTransporter, setEditingTransporter] = useState<Transporter | null>(null)
  const [newTransporter, setNewTransporter] = useState<Partial<Transporter>>({
    companyName: "",
    rut: "",
    contactName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    region: "",
    status: "active",
  })

  useEffect(() => {
    const loadSupabaseTransporters = async () => {
      try {

        const response = await fetch("/api/documents?type=transporters")
        const result = await response.json()

        if (result.success) {
          setSupabaseTransporters(result.data)
        } else {
          console.error("[v0] Error loading transporters:", result.error)
        }
      } catch (error) {
        console.error("[v0] Error fetching transporters:", error)
      }
    }

    const loadUploadedDocuments = () => {
      try {
        const docs = JSON.parse(localStorage.getItem("uploadedDocuments") || "[]")
        const transporterDocs = docs.filter(
          (doc: any) =>
            doc.documentType === "Licencia de Conducir" || doc.ocrData?.nombreConductor || doc.ocrData?.rutConductor,
        )
        setUploadedDocuments(transporterDocs)
      } catch (error) {
        console.error("[v0] Error loading documents:", error)
      }
    }

    loadSupabaseTransporters()
    loadUploadedDocuments()

    const handleStorageChange = () => {
      loadUploadedDocuments()
    }

    window.addEventListener("storage", handleStorageChange)
    return () => window.removeEventListener("storage", handleStorageChange)
  }, [])

  const handleEditTransporter = (transporter: Transporter) => {
    setEditingTransporter(transporter)
    setNewTransporter({
      companyName: transporter.companyName,
      rut: transporter.rut,
      contactName: transporter.contactName,
      email: transporter.email,
      phone: transporter.phone,
      address: transporter.address,
      city: transporter.city,
      region: transporter.region,
      status: transporter.status,
      notes: transporter.notes,
    })
    setIsEditDialogOpen(true)
  }

  const handleSaveEdit = async () => {
    if (!editingTransporter) return

    try {

      // Check if this is a Supabase transporter
      if (editingTransporter.id.startsWith("supabase-")) {
        const supabaseId = editingTransporter.id.replace("supabase-", "")

        const response = await fetch(`/api/documents/${supabaseId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: newTransporter.companyName,
            rut: newTransporter.rut,
            // Add other fields as needed
          }),
        })

        if (response.ok) {
          // Reload Supabase data
          const loadResponse = await fetch("/api/documents?type=transporters")
          const result = await loadResponse.json()
          if (result.success) {
            setSupabaseTransporters(result.data)
          }
        }
      } else {
        // Update local transporters
        setTransporters((prev) =>
          prev.map((t) =>
            t.id === editingTransporter.id
              ? {
                  ...t,
                  companyName: newTransporter.companyName || t.companyName,
                  rut: newTransporter.rut || t.rut,
                  contactName: newTransporter.contactName || t.contactName,
                  email: newTransporter.email || t.email,
                  phone: newTransporter.phone || t.phone,
                  address: newTransporter.address || t.address,
                  city: newTransporter.city || t.city,
                  region: newTransporter.region || t.region,
                  status: (newTransporter.status as Transporter["status"]) || t.status,
                  notes: newTransporter.notes || t.notes,
                }
              : t,
          ),
        )
      }

      setIsEditDialogOpen(false)
      setEditingTransporter(null)
      setNewTransporter({
        companyName: "",
        rut: "",
        contactName: "",
        email: "",
        phone: "",
        address: "",
        city: "",
        region: "",
        status: "active",
      })
    } catch (error) {
      console.error("[v0] Error saving transporter edit:", error)
    }
  }

  const handleDeleteTransporter = async (transporter: Transporter) => {
    try {

      // Check if this is a Supabase transporter
      if (transporter.id.startsWith("supabase-")) {
        const supabaseId = transporter.id.replace("supabase-", "")

        const response = await fetch(`/api/documents/${supabaseId}`, {
          method: "DELETE",
        })

        if (response.ok) {
          // Reload Supabase data
          const loadResponse = await fetch("/api/documents?type=transporters")
          const result = await loadResponse.json()
          if (result.success) {
            setSupabaseTransporters(result.data)
          }
        }
      } else {
        // Remove from local transporters
        setTransporters((prev) => prev.filter((t) => t.id !== transporter.id))
      }
    } catch (error) {
      console.error("[v0] Error deleting transporter:", error)
    }
  }

  const mergedTransporters = useMemo(() => {
    const transportersFromSupabase = supabaseTransporters.map((transporter: any) => {
      const document = transporter.documents


      return {
        id: `supabase-${transporter.id}`,
        companyName: transporter.name || "Información no disponible",
        rut: transporter.rut || "No disponible",
        contactName: transporter.name || "No disponible",
        email: "No disponible",
        phone: "No disponible",
        address: "No disponible",
        city: "No disponible",
        region: "No disponible",
        status: "active" as const,
        registrationDate: transporter.created_at
          ? new Date(transporter.created_at).toISOString().split("T")[0]
          : new Date().toISOString().split("T")[0],
        lastActivity: transporter.updated_at
          ? new Date(transporter.updated_at).toISOString().split("T")[0]
          : new Date().toISOString().split("T")[0],
        documentsCount: {
          total: 1,
          approved: 1,
          pending: 0,
          expired: transporter.expiry_date && new Date(transporter.expiry_date) < new Date() ? 1 : 0,
        },
        vehicles: [],
        notes: `Licencia: ${transporter.license_number || "N/A"}, Clase: ${transporter.license_class || "N/A"}, Vencimiento: ${transporter.expiry_date || "N/A"}`,
      }
    })

    const transportersFromDocs = uploadedDocuments.map((doc: any) => {
      const ocrData = doc.ocrData || {}
      const formData = doc.formData || {}


      let companyName = "Información no disponible"
      if (formData.transporterName) companyName = formData.transporterName
      else if (ocrData.nombreConductor) companyName = ocrData.nombreConductor
      else if (ocrData.nombreTransportista) companyName = ocrData.nombreTransportista

      let rut = "No disponible"
      if (formData.transporterRut) rut = formData.transporterRut
      else if (ocrData.rutConductor) rut = ocrData.rutConductor
      else if (ocrData.rutTransportista) rut = ocrData.rutTransportista

      let contactName = "No disponible"
      if (ocrData.nombreConductor) contactName = ocrData.nombreConductor
      else if (formData.transporterName) contactName = formData.transporterName


      return {
        id: `uploaded-${doc.id}`,
        companyName,
        rut,
        contactName,
        email: "No disponible",
        phone: "No disponible",
        address: "No disponible",
        city: "No disponible",
        region: "No disponible",
        status: "active" as const,
        registrationDate: doc.uploadDate || new Date().toISOString().split("T")[0],
        lastActivity: doc.uploadDate || new Date().toISOString().split("T")[0],
        documentsCount: {
          total: 1,
          approved: doc.confidence === "high" ? 1 : 0,
          pending: doc.confidence === "medium" || doc.confidence === "low" ? 1 : 0,
          expired: 0,
        },
        vehicles: [],
        notes: `Documento subido: ${doc.documentType}. Confianza OCR: ${doc.confidence || "desconocida"}. ${ocrData.numeroLicencia ? `Licencia: ${ocrData.numeroLicencia}` : ""}`,
      }
    })

    return [...mockTransporters, ...transportersFromSupabase, ...transportersFromDocs]
  }, [supabaseTransporters, uploadedDocuments])

  const filteredTransporters = mergedTransporters.filter((transporter) => {
    const matchesSearch =
      transporter.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transporter.rut.includes(searchTerm) ||
      transporter.contactName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transporter.email.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = statusFilter === "all" || transporter.status === statusFilter

    return matchesSearch && matchesStatus
  })

  const getStatusBadge = (status: Transporter["status"]) => {
    switch (status) {
      case "active":
        return (
          <Badge variant="default" className="bg-green-100 text-green-800 hover:bg-green-100">
            <CheckCircle className="w-3 h-3 mr-1" />
            Activo
          </Badge>
        )
      case "inactive":
        return (
          <Badge variant="secondary">
            <XCircle className="w-3 h-3 mr-1" />
            Inactivo
          </Badge>
        )
      case "suspended":
        return (
          <Badge variant="destructive">
            <AlertTriangle className="w-3 h-3 mr-1" />
            Suspendido
          </Badge>
        )
      default:
        return <Badge variant="outline">Desconocido</Badge>
    }
  }

  const getStatusCount = (status: Transporter["status"]) => {
    return mergedTransporters.filter((t) => t.status === status).length
  }

  const handleAddTransporter = () => {
    const transporter: Transporter = {
      id: Date.now().toString(),
      companyName: newTransporter.companyName || "",
      rut: newTransporter.rut || "",
      contactName: newTransporter.contactName || "",
      email: newTransporter.email || "",
      phone: newTransporter.phone || "",
      address: newTransporter.address || "",
      city: newTransporter.city || "",
      region: newTransporter.region || "",
      status: (newTransporter.status as Transporter["status"]) || "active",
      registrationDate: new Date().toISOString().split("T")[0],
      lastActivity: new Date().toISOString().split("T")[0],
      documentsCount: {
        total: 0,
        approved: 0,
        pending: 0,
        expired: 0,
      },
      vehicles: [],
      notes: newTransporter.notes,
    }

    setTransporters([...transporters, transporter])
    setNewTransporter({
      companyName: "",
      rut: "",
      contactName: "",
      email: "",
      phone: "",
      address: "",
      city: "",
      region: "",
      status: "active",
    })
    setIsAddDialogOpen(false)
  }

  const getComplianceRate = (documentsCount: Transporter["documentsCount"]) => {
    if (documentsCount.total === 0) return 0
    return Math.round((documentsCount.approved / documentsCount.total) * 100)
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Gestión de Transportistas</h1>
          <p className="text-muted-foreground mt-2">Administra empresas de transporte y sus documentos</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Agregar Transportista
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Agregar Nuevo Transportista</DialogTitle>
              <DialogDescription>Complete la información de la empresa de transporte</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="companyName">Nombre de la Empresa *</Label>
                  <Input
                    id="companyName"
                    value={newTransporter.companyName}
                    onChange={(e) => setNewTransporter({ ...newTransporter, companyName: e.target.value })}
                    placeholder="Ej: Transportes ABC Ltda."
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="rut">RUT *</Label>
                  <Input
                    id="rut"
                    value={newTransporter.rut}
                    onChange={(e) => setNewTransporter({ ...newTransporter, rut: e.target.value })}
                    placeholder="Ej: 76.123.456-7"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contactName">Nombre de Contacto *</Label>
                  <Input
                    id="contactName"
                    value={newTransporter.contactName}
                    onChange={(e) => setNewTransporter({ ...newTransporter, contactName: e.target.value })}
                    placeholder="Ej: Juan Pérez"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={newTransporter.email}
                    onChange={(e) => setNewTransporter({ ...newTransporter, email: e.target.value })}
                    placeholder="contacto@empresa.cl"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Teléfono</Label>
                  <Input
                    id="phone"
                    value={newTransporter.phone}
                    onChange={(e) => setNewTransporter({ ...newTransporter, phone: e.target.value })}
                    placeholder="+56 9 1234 5678"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="status">Estado</Label>
                  <Select
                    value={newTransporter.status}
                    onValueChange={(value) =>
                      setNewTransporter({ ...newTransporter, status: value as Transporter["status"] })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Activo</SelectItem>
                      <SelectItem value="inactive">Inactivo</SelectItem>
                      <SelectItem value="suspended">Suspendido</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">Dirección</Label>
                <Input
                  id="address"
                  value={newTransporter.address}
                  onChange={(e) => setNewTransporter({ ...newTransporter, address: e.target.value })}
                  placeholder="Av. Principal 123"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="city">Ciudad</Label>
                  <Input
                    id="city"
                    value={newTransporter.city}
                    onChange={(e) => setNewTransporter({ ...newTransporter, city: e.target.value })}
                    placeholder="Santiago"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="region">Región</Label>
                  <Input
                    id="region"
                    value={newTransporter.region}
                    onChange={(e) => setNewTransporter({ ...newTransporter, region: e.target.value })}
                    placeholder="Metropolitana"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="notes">Notas</Label>
                <Textarea
                  id="notes"
                  value={newTransporter.notes}
                  onChange={(e) => setNewTransporter({ ...newTransporter, notes: e.target.value })}
                  placeholder="Información adicional sobre el transportista..."
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleAddTransporter}>Agregar Transportista</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Transportistas</CardTitle>
            <Users className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mergedTransporters.length}</div>
            <p className="text-xs text-muted-foreground">Empresas registradas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Activos</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{getStatusCount("active")}</div>
            <p className="text-xs text-muted-foreground">En operación</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Suspendidos</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{getStatusCount("suspended")}</div>
            <p className="text-xs text-muted-foreground">Requieren atención</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Vehículos</CardTitle>
            <Truck className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {mergedTransporters.reduce((total, t) => total + t.vehicles.length, 0)}
            </div>
            <p className="text-xs text-muted-foreground">Registrados</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle>Filtros y Búsqueda</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por empresa, RUT, contacto..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Filtrar por estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los estados</SelectItem>
                <SelectItem value="active">Activos</SelectItem>
                <SelectItem value="inactive">Inactivos</SelectItem>
                <SelectItem value="suspended">Suspendidos</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Transporters Table */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Transportistas</CardTitle>
          <CardDescription>
            {filteredTransporters.length} de {mergedTransporters.length} transportistas
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Empresa</TableHead>
                  <TableHead>Contacto</TableHead>
                  <TableHead>Ubicación</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Documentos</TableHead>
                  <TableHead>Cumplimiento</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTransporters.map((transporter) => (
                  <TableRow key={transporter.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{transporter.companyName}</div>
                        <div className="text-sm text-muted-foreground">{transporter.rut}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{transporter.contactName}</div>
                        <div className="text-sm text-muted-foreground">{transporter.email}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {transporter.city}, {transporter.region}
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(transporter.status)}</TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div>Total: {transporter.documentsCount.total}</div>
                        <div className="text-muted-foreground">
                          {transporter.documentsCount.approved} aprobados, {transporter.documentsCount.pending}{" "}
                          pendientes
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <div className="text-sm font-medium">{getComplianceRate(transporter.documentsCount)}%</div>
                        <div
                          className={`h-2 w-16 rounded-full ${
                            getComplianceRate(transporter.documentsCount) >= 80
                              ? "bg-green-200"
                              : getComplianceRate(transporter.documentsCount) >= 60
                                ? "bg-yellow-200"
                                : "bg-red-200"
                          }`}
                        >
                          <div
                            className={`h-2 rounded-full ${
                              getComplianceRate(transporter.documentsCount) >= 80
                                ? "bg-green-600"
                                : getComplianceRate(transporter.documentsCount) >= 60
                                  ? "bg-yellow-600"
                                  : "bg-red-600"
                            }`}
                            style={{ width: `${getComplianceRate(transporter.documentsCount)}%` }}
                          />
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="ghost" size="sm" onClick={() => setSelectedTransporter(transporter)}>
                              <Eye className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                            <DialogHeader>
                              <DialogTitle>Detalles del Transportista</DialogTitle>
                              <DialogDescription>Información completa de la empresa</DialogDescription>
                            </DialogHeader>
                            {selectedTransporter && (
                              <div className="space-y-6">
                                {/* Company Information */}
                                <div className="grid grid-cols-2 gap-4 p-4 bg-muted rounded-lg">
                                  <div className="space-y-3">
                                    <div className="flex items-center space-x-2">
                                      <Building className="h-4 w-4 text-muted-foreground" />
                                      <div>
                                        <Label className="text-sm font-medium">Empresa</Label>
                                        <p className="text-sm">{selectedTransporter.companyName}</p>
                                      </div>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                      <FileText className="h-4 w-4 text-muted-foreground" />
                                      <div>
                                        <Label className="text-sm font-medium">RUT</Label>
                                        <p className="text-sm">{selectedTransporter.rut}</p>
                                      </div>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                      <Mail className="h-4 w-4 text-muted-foreground" />
                                      <div>
                                        <Label className="text-sm font-medium">Email</Label>
                                        <p className="text-sm">{selectedTransporter.email}</p>
                                      </div>
                                    </div>
                                  </div>
                                  <div className="space-y-3">
                                    <div className="flex items-center space-x-2">
                                      <Users className="h-4 w-4 text-muted-foreground" />
                                      <div>
                                        <Label className="text-sm font-medium">Contacto</Label>
                                        <p className="text-sm">{selectedTransporter.contactName}</p>
                                      </div>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                      <Phone className="h-4 w-4 text-muted-foreground" />
                                      <div>
                                        <Label className="text-sm font-medium">Teléfono</Label>
                                        <p className="text-sm">{selectedTransporter.phone}</p>
                                      </div>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                      <MapPin className="h-4 w-4 text-muted-foreground" />
                                      <div>
                                        <Label className="text-sm font-medium">Ubicación</Label>
                                        <p className="text-sm">
                                          {selectedTransporter.city}, {selectedTransporter.region}
                                        </p>
                                      </div>
                                    </div>
                                  </div>
                                </div>

                                {/* Status and Dates */}
                                <div className="grid grid-cols-3 gap-4">
                                  <div>
                                    <Label className="text-sm font-medium">Estado</Label>
                                    <div className="mt-1">{getStatusBadge(selectedTransporter.status)}</div>
                                  </div>
                                  <div>
                                    <Label className="text-sm font-medium">Fecha de Registro</Label>
                                    <p className="text-sm flex items-center mt-1">
                                      <Calendar className="h-4 w-4 mr-1 text-muted-foreground" />
                                      {selectedTransporter.registrationDate}
                                    </p>
                                  </div>
                                  <div>
                                    <Label className="text-sm font-medium">Última Actividad</Label>
                                    <p className="text-sm flex items-center mt-1">
                                      <Calendar className="h-4 w-4 mr-1 text-muted-foreground" />
                                      {selectedTransporter.lastActivity}
                                    </p>
                                  </div>
                                </div>

                                {/* Documents Summary */}
                                <div>
                                  <Label className="text-sm font-medium mb-3 block">Resumen de Documentos</Label>
                                  <div className="grid grid-cols-4 gap-4">
                                    <Card>
                                      <CardContent className="p-4 text-center">
                                        <div className="text-2xl font-bold">
                                          {selectedTransporter.documentsCount.total}
                                        </div>
                                        <p className="text-xs text-muted-foreground">Total</p>
                                      </CardContent>
                                    </Card>
                                    <Card>
                                      <CardContent className="p-4 text-center">
                                        <div className="text-2xl font-bold text-green-600">
                                          {selectedTransporter.documentsCount.approved}
                                        </div>
                                        <p className="text-xs text-muted-foreground">Aprobados</p>
                                      </CardContent>
                                    </Card>
                                    <Card>
                                      <CardContent className="p-4 text-center">
                                        <div className="text-2xl font-bold text-yellow-600">
                                          {selectedTransporter.documentsCount.pending}
                                        </div>
                                        <p className="text-xs text-muted-foreground">Pendientes</p>
                                      </CardContent>
                                    </Card>
                                    <Card>
                                      <CardContent className="p-4 text-center">
                                        <div className="text-2xl font-bold text-red-600">
                                          {selectedTransporter.documentsCount.expired}
                                        </div>
                                        <p className="text-xs text-muted-foreground">Vencidos</p>
                                      </CardContent>
                                    </Card>
                                  </div>
                                </div>

                                {/* Vehicles */}
                                <div>
                                  <Label className="text-sm font-medium mb-3 block">Vehículos Registrados</Label>
                                  {selectedTransporter.vehicles.length > 0 ? (
                                    <div className="space-y-2">
                                      {selectedTransporter.vehicles.map((vehicle) => (
                                        <div
                                          key={vehicle.id}
                                          className="flex items-center justify-between p-3 border rounded"
                                        >
                                          <div className="flex items-center space-x-3">
                                            <Truck className="h-5 w-5 text-muted-foreground" />
                                            <div>
                                              <p className="font-medium">{vehicle.plate}</p>
                                              <p className="text-sm text-muted-foreground">
                                                {vehicle.brand} {vehicle.model} ({vehicle.year})
                                              </p>
                                            </div>
                                          </div>
                                          <Badge variant="outline">{vehicle.type}</Badge>
                                        </div>
                                      ))}
                                    </div>
                                  ) : (
                                    <p className="text-sm text-muted-foreground">No hay vehículos registrados</p>
                                  )}
                                </div>

                                {/* Notes */}
                                {selectedTransporter.notes && (
                                  <div>
                                    <Label className="text-sm font-medium">Notas</Label>
                                    <p className="text-sm text-muted-foreground mt-1 p-3 bg-muted rounded">
                                      {selectedTransporter.notes}
                                    </p>
                                  </div>
                                )}
                              </div>
                            )}
                          </DialogContent>
                        </Dialog>

                        <Button variant="ghost" size="sm" onClick={() => handleEditTransporter(transporter)}>
                          <Edit className="h-4 w-4" />
                        </Button>

                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>¿Eliminar transportista?</AlertDialogTitle>
                              <AlertDialogDescription>
                                Esta acción no se puede deshacer. Se eliminará permanentemente el transportista{" "}
                                <strong>{transporter.companyName}</strong> y todos sus datos asociados.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDeleteTransporter(transporter)}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                Eliminar
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Editar Transportista</DialogTitle>
            <DialogDescription>Modifique la información de la empresa de transporte</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-companyName">Nombre de la Empresa *</Label>
                <Input
                  id="edit-companyName"
                  value={newTransporter.companyName}
                  onChange={(e) => setNewTransporter({ ...newTransporter, companyName: e.target.value })}
                  placeholder="Ej: Transportes ABC Ltda."
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-rut">RUT *</Label>
                <Input
                  id="edit-rut"
                  value={newTransporter.rut}
                  onChange={(e) => setNewTransporter({ ...newTransporter, rut: e.target.value })}
                  placeholder="Ej: 76.123.456-7"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-contactName">Nombre de Contacto *</Label>
                <Input
                  id="edit-contactName"
                  value={newTransporter.contactName}
                  onChange={(e) => setNewTransporter({ ...newTransporter, contactName: e.target.value })}
                  placeholder="Ej: Juan Pérez"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-email">Email *</Label>
                <Input
                  id="edit-email"
                  type="email"
                  value={newTransporter.email}
                  onChange={(e) => setNewTransporter({ ...newTransporter, email: e.target.value })}
                  placeholder="contacto@empresa.cl"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-phone">Teléfono</Label>
                <Input
                  id="edit-phone"
                  value={newTransporter.phone}
                  onChange={(e) => setNewTransporter({ ...newTransporter, phone: e.target.value })}
                  placeholder="+56 9 1234 5678"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-status">Estado</Label>
                <Select
                  value={newTransporter.status}
                  onValueChange={(value) =>
                    setNewTransporter({ ...newTransporter, status: value as Transporter["status"] })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Activo</SelectItem>
                    <SelectItem value="inactive">Inactivo</SelectItem>
                    <SelectItem value="suspended">Suspendido</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-address">Dirección</Label>
              <Input
                id="edit-address"
                value={newTransporter.address}
                onChange={(e) => setNewTransporter({ ...newTransporter, address: e.target.value })}
                placeholder="Av. Principal 123"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-city">Ciudad</Label>
                <Input
                  id="edit-city"
                  value={newTransporter.city}
                  onChange={(e) => setNewTransporter({ ...newTransporter, city: e.target.value })}
                  placeholder="Santiago"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-region">Región</Label>
                <Input
                  id="edit-region"
                  value={newTransporter.region}
                  onChange={(e) => setNewTransporter({ ...newTransporter, region: e.target.value })}
                  placeholder="Metropolitana"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-notes">Notas</Label>
              <Textarea
                id="edit-notes"
                value={newTransporter.notes}
                onChange={(e) => setNewTransporter({ ...newTransporter, notes: e.target.value })}
                placeholder="Información adicional sobre el transportista..."
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleSaveEdit}>Guardar Cambios</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
