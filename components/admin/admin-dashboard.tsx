"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Users,
  FileText,
  Clock,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Search,
  LogOut,
  Eye,
  Edit,
  Plus,
  Shield,
  BarChart3,
} from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { UserManagementModal } from "./user-management-modal"
import { SystemStatsCard } from "./system-stats-card"
import { AuditLogTable } from "./audit-log-table"
import { NotificationCenter } from "./notification-center"
import { CertificateProcessingPanel } from "./certificate-processing-panel"

interface Profile {
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

interface Certificate {
  id: string
  driver_id: string
  certificate_type: string
  certificate_number: string
  issue_date: string
  expiry_date: string
  issuing_authority: string
  status: string
  file_url: string
  file_name: string
  validation_notes: string
  created_at: string
  profiles: {
    full_name: string
    email: string
    company_name: string
  }
}

interface AuditLogEntry {
  id: string
  user_id: string
  action: string
  table_name: string
  record_id: string
  old_values: any
  new_values: any
  ip_address: string
  user_agent: string
  created_at: string
}

interface Notification {
  id: string
  user_id: string
  title: string
  message: string
  type: string
  is_read: boolean
  created_at: string
  profiles: {
    full_name: string
    email: string
  }
}

interface SystemStats {
  totalUsers: number
  totalCertificates: number
  pendingCertificates: number
  expiredCertificates: number
}

interface AdminDashboardProps {
  profile: Profile
  users: Profile[]
  certificates: Certificate[]
  auditLog: AuditLogEntry[]
  notifications: Notification[]
  stats: SystemStats
}

export function AdminDashboard({ profile, users, certificates, auditLog, notifications, stats }: AdminDashboardProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [roleFilter, setRoleFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [selectedUser, setSelectedUser] = useState<Profile | null>(null)
  const [showCreateUser, setShowCreateUser] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push("/auth/login")
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "approved":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "pending":
        return <Clock className="h-4 w-4 text-yellow-500" />
      case "rejected":
        return <XCircle className="h-4 w-4 text-red-500" />
      case "expired":
        return <AlertTriangle className="h-4 w-4 text-red-500" />
      default:
        return <Clock className="h-4 w-4 text-gray-500" />
    }
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case "admin":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200"
      case "dispatcher":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
      case "driver":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
    }
  }

  const getRoleLabel = (role: string) => {
    const labels = {
      admin: "Administrador",
      dispatcher: "Despachador",
      driver: "Conductor",
    }
    return labels[role as keyof typeof labels] || role
  }

  // Filter users
  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.company_name?.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesRole = roleFilter === "all" || user.role === roleFilter
    const matchesStatus = statusFilter === "all" || (statusFilter === "active" ? user.is_active : !user.is_active)

    return matchesSearch && matchesRole && matchesStatus
  })

  // Get company statistics
  const companies = [...new Set(users.filter((u) => u.company_name).map((u) => u.company_name))]
  const drivers = users.filter((u) => u.role === "driver")
  const dispatchers = users.filter((u) => u.role === "dispatcher")
  const admins = users.filter((u) => u.role === "admin")

  const approvedCerts = certificates.filter((c) => c.status === "approved")
  const pendingCerts = certificates.filter((c) => c.status === "pending")
  const rejectedCerts = certificates.filter((c) => c.status === "rejected")
  const expiredCerts = certificates.filter((c) => c.status === "expired")

  const handleBulkProcess = async () => {
    // Refresh the page data after bulk processing
    router.refresh()
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2">
                <Shield className="h-6 w-6 text-primary" />
                Panel de Administración
              </h1>
              <p className="text-muted-foreground">Sistema de gestión TransporteCL</p>
            </div>
            <div className="flex items-center gap-4">
              <Button variant="outline" size="sm" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                Cerrar Sesión
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* System Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <SystemStatsCard
            title="Total Usuarios"
            value={stats.totalUsers}
            icon={<Users className="h-4 w-4" />}
            description={`${drivers.length} conductores, ${dispatchers.length} despachadores`}
          />
          <SystemStatsCard
            title="Certificados"
            value={stats.totalCertificates}
            icon={<FileText className="h-4 w-4" />}
            description={`${approvedCerts.length} aprobados`}
          />
          <SystemStatsCard
            title="Pendientes"
            value={stats.pendingCertificates}
            icon={<Clock className="h-4 w-4 text-yellow-500" />}
            description="Requieren validación"
            variant="warning"
          />
          <SystemStatsCard
            title="Empresas"
            value={companies.length}
            icon={<BarChart3 className="h-4 w-4" />}
            description="Empresas registradas"
          />
        </div>

        <Tabs defaultValue="users" className="space-y-6">
          <TabsList>
            <TabsTrigger value="users">Gestión de Usuarios</TabsTrigger>
            <TabsTrigger value="certificates">Certificados</TabsTrigger>
            <TabsTrigger value="processing">
              Procesamiento IA
              {pendingCerts.length > 0 && (
                <Badge variant="destructive" className="ml-2 h-5 w-5 p-0 text-xs">
                  {pendingCerts.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="notifications">
              Notificaciones
              {notifications.filter((n) => !n.is_read).length > 0 && (
                <Badge variant="destructive" className="ml-2 h-5 w-5 p-0 text-xs">
                  {notifications.filter((n) => !n.is_read).length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="audit">Auditoría</TabsTrigger>
            <TabsTrigger value="analytics">Analíticas</TabsTrigger>
          </TabsList>

          <TabsContent value="users" className="space-y-6">
            {/* User Management */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">Gestión de Usuarios</CardTitle>
                    <CardDescription>Administra usuarios del sistema</CardDescription>
                  </div>
                  <Button onClick={() => setShowCreateUser(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Crear Usuario
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col sm:flex-row gap-4 mb-6">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Buscar usuarios..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <Select value={roleFilter} onValueChange={setRoleFilter}>
                    <SelectTrigger className="w-full sm:w-[180px]">
                      <SelectValue placeholder="Rol" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos los roles</SelectItem>
                      <SelectItem value="admin">Administradores</SelectItem>
                      <SelectItem value="dispatcher">Despachadores</SelectItem>
                      <SelectItem value="driver">Conductores</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-full sm:w-[180px]">
                      <SelectValue placeholder="Estado" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      <SelectItem value="active">Activos</SelectItem>
                      <SelectItem value="inactive">Inactivos</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="border-b">
                      <tr className="text-left">
                        <th className="p-4 font-medium">Usuario</th>
                        <th className="p-4 font-medium">Rol</th>
                        <th className="p-4 font-medium">Empresa</th>
                        <th className="p-4 font-medium">Estado</th>
                        <th className="p-4 font-medium">Registro</th>
                        <th className="p-4 font-medium">Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredUsers.map((user) => (
                        <tr key={user.id} className="border-b hover:bg-muted/50">
                          <td className="p-4">
                            <div>
                              <div className="font-medium">{user.full_name}</div>
                              <div className="text-sm text-muted-foreground">{user.email}</div>
                            </div>
                          </td>
                          <td className="p-4">
                            <Badge className={getRoleColor(user.role)}>{getRoleLabel(user.role)}</Badge>
                          </td>
                          <td className="p-4">
                            <span className="text-sm">{user.company_name || "N/A"}</span>
                          </td>
                          <td className="p-4">
                            <Badge variant={user.is_active ? "default" : "secondary"}>
                              {user.is_active ? "Activo" : "Inactivo"}
                            </Badge>
                          </td>
                          <td className="p-4">
                            <span className="text-sm">{new Date(user.created_at).toLocaleDateString("es-CL")}</span>
                          </td>
                          <td className="p-4">
                            <div className="flex items-center gap-2">
                              <Button variant="outline" size="sm" onClick={() => setSelectedUser(user)}>
                                <Eye className="h-4 w-4 mr-1" />
                                Ver
                              </Button>
                              <Button variant="outline" size="sm" onClick={() => setSelectedUser(user)}>
                                <Edit className="h-4 w-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {filteredUsers.length === 0 && (
                  <div className="text-center py-12">
                    <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">No se encontraron usuarios</h3>
                    <p className="text-muted-foreground">Ajusta los filtros para ver más resultados.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="certificates" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Todos los Certificados</CardTitle>
                <CardDescription>Vista general de certificados en el sistema</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                  <Card>
                    <CardContent className="p-4 text-center">
                      <div className="text-2xl font-bold text-green-600">{approvedCerts.length}</div>
                      <div className="text-sm text-muted-foreground">Aprobados</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4 text-center">
                      <div className="text-2xl font-bold text-yellow-600">{pendingCerts.length}</div>
                      <div className="text-sm text-muted-foreground">Pendientes</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4 text-center">
                      <div className="text-2xl font-bold text-red-600">{rejectedCerts.length}</div>
                      <div className="text-sm text-muted-foreground">Rechazados</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4 text-center">
                      <div className="text-2xl font-bold text-red-600">{expiredCerts.length}</div>
                      <div className="text-sm text-muted-foreground">Vencidos</div>
                    </CardContent>
                  </Card>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="border-b">
                      <tr className="text-left">
                        <th className="p-4 font-medium">Conductor</th>
                        <th className="p-4 font-medium">Empresa</th>
                        <th className="p-4 font-medium">Tipo</th>
                        <th className="p-4 font-medium">Estado</th>
                        <th className="p-4 font-medium">Vencimiento</th>
                        <th className="p-4 font-medium">Subido</th>
                      </tr>
                    </thead>
                    <tbody>
                      {certificates.slice(0, 50).map((certificate) => (
                        <tr key={certificate.id} className="border-b hover:bg-muted/50">
                          <td className="p-4">
                            <div>
                              <div className="font-medium">{certificate.profiles.full_name}</div>
                              <div className="text-sm text-muted-foreground">{certificate.profiles.email}</div>
                            </div>
                          </td>
                          <td className="p-4">
                            <span className="text-sm">{certificate.profiles.company_name}</span>
                          </td>
                          <td className="p-4">
                            <div className="flex items-center gap-2">
                              <FileText className="h-4 w-4 text-muted-foreground" />
                              <span className="text-sm">{certificate.certificate_type}</span>
                            </div>
                          </td>
                          <td className="p-4">
                            <Badge
                              className={`${certificate.status === "approved" ? "bg-green-100 text-green-800" : certificate.status === "pending" ? "bg-yellow-100 text-yellow-800" : "bg-red-100 text-red-800"}`}
                            >
                              {getStatusIcon(certificate.status)}
                              <span className="ml-1">{certificate.status}</span>
                            </Badge>
                          </td>
                          <td className="p-4">
                            {certificate.expiry_date ? (
                              <span className="text-sm">
                                {new Date(certificate.expiry_date).toLocaleDateString("es-CL")}
                              </span>
                            ) : (
                              "N/A"
                            )}
                          </td>
                          <td className="p-4">
                            <span className="text-sm">
                              {new Date(certificate.created_at).toLocaleDateString("es-CL")}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="processing" className="space-y-6">
            <CertificateProcessingPanel pendingCount={pendingCerts.length} onBulkProcess={handleBulkProcess} />
          </TabsContent>

          <TabsContent value="notifications" className="space-y-6">
            <NotificationCenter notifications={notifications} />
          </TabsContent>

          <TabsContent value="audit" className="space-y-6">
            <AuditLogTable auditLog={auditLog} />
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Distribución por Empresa</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {companies.slice(0, 10).map((company) => {
                      const companyUsers = users.filter((u) => u.company_name === company)
                      const percentage = (companyUsers.length / users.length) * 100

                      return (
                        <div key={company} className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>{company}</span>
                            <span>{companyUsers.length} usuarios</span>
                          </div>
                          <div className="w-full bg-muted rounded-full h-2">
                            <div className="bg-primary h-2 rounded-full" style={{ width: `${percentage}%` }} />
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Certificados por Tipo</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {["f30", "license", "medical", "vehicle_registration", "insurance"].map((type) => {
                      const typeCerts = certificates.filter((c) => c.certificate_type === type)
                      const percentage = certificates.length > 0 ? (typeCerts.length / certificates.length) * 100 : 0

                      return (
                        <div key={type} className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>{type}</span>
                            <span>{typeCerts.length} certificados</span>
                          </div>
                          <div className="w-full bg-muted rounded-full h-2">
                            <div className="bg-primary h-2 rounded-full" style={{ width: `${percentage}%` }} />
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Modals */}
      {(selectedUser || showCreateUser) && (
        <UserManagementModal
          user={selectedUser}
          isCreate={showCreateUser}
          onClose={() => {
            setSelectedUser(null)
            setShowCreateUser(false)
          }}
          onSuccess={() => {
            setSelectedUser(null)
            setShowCreateUser(false)
            router.refresh()
          }}
        />
      )}
    </div>
  )
}
