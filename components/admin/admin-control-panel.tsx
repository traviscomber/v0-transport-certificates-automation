"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Users,
  Activity,
  Download,
  Upload,
  Database,
  Server,
  AlertTriangle,
  CheckCircle,
  Clock,
  Eye,
  Edit,
  Trash2,
  Plus,
  BarChart3,
  FileText,
  Calendar,
  Mail,
} from "lucide-react"
import { ChangePasswordForm } from "@/components/auth/change-password-form"

interface SystemUser {
  id: string
  name: string
  email: string
  role: "admin" | "operator" | "viewer"
  status: "active" | "inactive"
  lastLogin: string
  createdAt: string
}

interface AuditLog {
  id: string
  user: string
  action: string
  resource: string
  timestamp: string
  details: string
  status: "success" | "error" | "warning"
}

interface SystemStats {
  totalDocuments: number
  pendingVerifications: number
  activeTransporters: number
  systemUptime: string
  storageUsed: string
  lastBackup: string
}

// Mock data
const mockUsers: SystemUser[] = [
  {
    id: "1",
    name: "Ana García",
    email: "ana.garcia@cleaner.cl",
    role: "admin",
    status: "active",
    lastLogin: "2024-01-15 14:30",
    createdAt: "2023-06-01",
  },
  {
    id: "2",
    name: "Carlos Rodríguez",
    email: "carlos.rodriguez@cleaner.cl",
    role: "operator",
    status: "active",
    lastLogin: "2024-01-15 09:15",
    createdAt: "2023-08-15",
  },
  {
    id: "3",
    name: "María López",
    email: "maria.lopez@cleaner.cl",
    role: "viewer",
    status: "inactive",
    lastLogin: "2024-01-10 16:45",
    createdAt: "2023-10-20",
  },
]

const mockAuditLogs: AuditLog[] = [
  {
    id: "1",
    user: "Ana García",
    action: "Documento Aprobado",
    resource: "F-30 - Transportes González",
    timestamp: "2024-01-15 14:25",
    details: "Certificado F-30 aprobado después de verificación",
    status: "success",
  },
  {
    id: "2",
    user: "Carlos Rodríguez",
    action: "Transportista Creado",
    resource: "Logística del Norte S.A.",
    timestamp: "2024-01-15 11:30",
    details: "Nuevo transportista registrado en el sistema",
    status: "success",
  },
  {
    id: "3",
    user: "Sistema",
    action: "Backup Fallido",
    resource: "Base de Datos",
    timestamp: "2024-01-15 02:00",
    details: "Error en backup automático - espacio insuficiente",
    status: "error",
  },
  {
    id: "4",
    user: "Ana García",
    action: "Configuración Modificada",
    resource: "Notificaciones Email",
    timestamp: "2024-01-14 16:20",
    details: "Configuración de notificaciones actualizada",
    status: "success",
  },
]

const mockSystemStats: SystemStats = {
  totalDocuments: 156,
  pendingVerifications: 8,
  activeTransporters: 23,
  systemUptime: "15 días, 6 horas",
  storageUsed: "2.3 GB / 10 GB",
  lastBackup: "2024-01-15 02:00",
}

export function AdminControlPanel() {
  const [users, setUsers] = useState<SystemUser[]>(mockUsers)
  const [auditLogs] = useState<AuditLog[]>(mockAuditLogs)
  const [systemStats] = useState<SystemStats>(mockSystemStats)
  const [activeTab, setActiveTab] = useState("overview")
  const [isAddUserDialogOpen, setIsAddUserDialogOpen] = useState(false)
  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    role: "viewer" as SystemUser["role"],
  })

  // System settings state
  const [settings, setSettings] = useState({
    emailNotifications: true,
    autoBackup: true,
    documentRetention: "365",
    maxFileSize: "10",
    allowedFileTypes: "pdf,doc,docx,jpg,png",
    requireTwoFactor: false,
    sessionTimeout: "480",
  })

  const getRoleBadge = (role: SystemUser["role"]) => {
    switch (role) {
      case "admin":
        return <Badge variant="destructive">Administrador</Badge>
      case "operator":
        return <Badge variant="default">Operador</Badge>
      case "viewer":
        return <Badge variant="secondary">Visualizador</Badge>
      default:
        return <Badge variant="outline">Desconocido</Badge>
    }
  }

  const getStatusBadge = (status: SystemUser["status"]) => {
    return status === "active" ? (
      <Badge variant="default" className="bg-green-100 text-green-800 hover:bg-green-100">
        <CheckCircle className="w-3 h-3 mr-1" />
        Activo
      </Badge>
    ) : (
      <Badge variant="secondary">
        <Clock className="w-3 h-3 mr-1" />
        Inactivo
      </Badge>
    )
  }

  const getLogStatusIcon = (status: AuditLog["status"]) => {
    switch (status) {
      case "success":
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case "error":
        return <AlertTriangle className="h-4 w-4 text-red-600" />
      case "warning":
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />
      default:
        return <Clock className="h-4 w-4 text-gray-600" />
    }
  }

  const handleAddUser = () => {
    const user: SystemUser = {
      id: Date.now().toString(),
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      status: "active",
      lastLogin: "Nunca",
      createdAt: new Date().toISOString().split("T")[0],
    }

    setUsers([...users, user])
    setNewUser({ name: "", email: "", role: "viewer" })
    setIsAddUserDialogOpen(false)
  }

  const handleExportData = () => {
    // Mock export functionality
    alert("Exportando datos del sistema...")
  }

  const handleBackupNow = () => {
    // Mock backup functionality
    alert("Iniciando backup manual del sistema...")
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Panel de Administración</h1>
        <p className="text-muted-foreground mt-2">Configuración y gestión del sistema</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Resumen</TabsTrigger>
          <TabsTrigger value="users">Usuarios</TabsTrigger>
          <TabsTrigger value="settings">Configuración</TabsTrigger>
          <TabsTrigger value="audit">Auditoría</TabsTrigger>
          <TabsTrigger value="maintenance">Mantenimiento</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* System Stats */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Documentos Totales</CardTitle>
                <FileText className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{systemStats.totalDocuments}</div>
                <p className="text-xs text-muted-foreground">En el sistema</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Verificaciones Pendientes</CardTitle>
                <Clock className="h-4 w-4 text-yellow-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{systemStats.pendingVerifications}</div>
                <p className="text-xs text-muted-foreground">Requieren atención</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Transportistas Activos</CardTitle>
                <Users className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{systemStats.activeTransporters}</div>
                <p className="text-xs text-muted-foreground">En operación</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Tiempo Activo</CardTitle>
                <Server className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-lg font-bold">{systemStats.systemUptime}</div>
                <p className="text-xs text-muted-foreground">Sin interrupciones</p>
              </CardContent>
            </Card>
          </div>

          {/* System Health */}
          <Card>
            <CardHeader>
              <CardTitle>Estado del Sistema</CardTitle>
              <CardDescription>Monitoreo de componentes críticos</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 border rounded">
                  <div className="flex items-center space-x-3">
                    <Database className="h-5 w-5 text-green-600" />
                    <div>
                      <p className="font-medium">Base de Datos</p>
                      <p className="text-sm text-muted-foreground">Funcionando correctamente</p>
                    </div>
                  </div>
                  <Badge variant="default" className="bg-green-100 text-green-800 hover:bg-green-100">
                    Operativo
                  </Badge>
                </div>

                <div className="flex items-center justify-between p-3 border rounded">
                  <div className="flex items-center space-x-3">
                    <Server className="h-5 w-5 text-green-600" />
                    <div>
                      <p className="font-medium">Servidor de Aplicaciones</p>
                      <p className="text-sm text-muted-foreground">CPU: 45%, RAM: 62%</p>
                    </div>
                  </div>
                  <Badge variant="default" className="bg-green-100 text-green-800 hover:bg-green-100">
                    Operativo
                  </Badge>
                </div>

                <div className="flex items-center justify-between p-3 border rounded">
                  <div className="flex items-center space-x-3">
                    <Database className="h-5 w-5 text-yellow-600" />
                    <div>
                      <p className="font-medium">Almacenamiento</p>
                      <p className="text-sm text-muted-foreground">{systemStats.storageUsed}</p>
                    </div>
                  </div>
                  <Badge variant="secondary">Advertencia</Badge>
                </div>

                <div className="flex items-center justify-between p-3 border rounded">
                  <div className="flex items-center space-x-3">
                    <Mail className="h-5 w-5 text-green-600" />
                    <div>
                      <p className="font-medium">Servicio de Email</p>
                      <p className="text-sm text-muted-foreground">Notificaciones activas</p>
                    </div>
                  </div>
                  <Badge variant="default" className="bg-green-100 text-green-800 hover:bg-green-100">
                    Operativo
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Users Tab */}
        <TabsContent value="users" className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-medium">Gestión de Usuarios</h3>
              <p className="text-sm text-muted-foreground">Administra usuarios del sistema y sus permisos</p>
            </div>
            <Dialog open={isAddUserDialogOpen} onOpenChange={setIsAddUserDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Agregar Usuario
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Agregar Nuevo Usuario</DialogTitle>
                  <DialogDescription>Complete la información del nuevo usuario del sistema</DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="userName">Nombre Completo</Label>
                    <Input
                      id="userName"
                      value={newUser.name}
                      onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                      placeholder="Ej: Juan Pérez"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="userEmail">Email</Label>
                    <Input
                      id="userEmail"
                      type="email"
                      value={newUser.email}
                      onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                      placeholder="usuario@cleaner.cl"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="userRole">Rol</Label>
                    <Select
                      value={newUser.role}
                      onValueChange={(value) => setNewUser({ ...newUser, role: value as SystemUser["role"] })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="viewer">Visualizador</SelectItem>
                        <SelectItem value="operator">Operador</SelectItem>
                        <SelectItem value="admin">Administrador</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex justify-end space-x-2">
                    <Button variant="outline" onClick={() => setIsAddUserDialogOpen(false)}>
                      Cancelar
                    </Button>
                    <Button onClick={handleAddUser}>Agregar Usuario</Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <Card>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Usuario</TableHead>
                    <TableHead>Rol</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Último Acceso</TableHead>
                    <TableHead>Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{user.name}</div>
                          <div className="text-sm text-muted-foreground">{user.email}</div>
                        </div>
                      </TableCell>
                      <TableCell>{getRoleBadge(user.role)}</TableCell>
                      <TableCell>{getStatusBadge(user.status)}</TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-1">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">{user.lastLogin}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings" className="space-y-6">
          <ChangePasswordForm />

          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Configuración General</CardTitle>
                <CardDescription>Ajustes básicos del sistema</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Notificaciones por Email</Label>
                    <p className="text-sm text-muted-foreground">Enviar alertas por correo electrónico</p>
                  </div>
                  <Switch
                    checked={settings.emailNotifications}
                    onCheckedChange={(checked) => setSettings({ ...settings, emailNotifications: checked })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Backup Automático</Label>
                    <p className="text-sm text-muted-foreground">Respaldo diario automático</p>
                  </div>
                  <Switch
                    checked={settings.autoBackup}
                    onCheckedChange={(checked) => setSettings({ ...settings, autoBackup: checked })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Autenticación de Dos Factores</Label>
                    <p className="text-sm text-muted-foreground">Requerir 2FA para todos los usuarios</p>
                  </div>
                  <Switch
                    checked={settings.requireTwoFactor}
                    onCheckedChange={(checked) => setSettings({ ...settings, requireTwoFactor: checked })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="sessionTimeout">Tiempo de Sesión (minutos)</Label>
                  <Input
                    id="sessionTimeout"
                    value={settings.sessionTimeout}
                    onChange={(e) => setSettings({ ...settings, sessionTimeout: e.target.value })}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Configuración de Documentos</CardTitle>
                <CardDescription>Ajustes para manejo de archivos</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="maxFileSize">Tamaño Máximo de Archivo (MB)</Label>
                  <Input
                    id="maxFileSize"
                    value={settings.maxFileSize}
                    onChange={(e) => setSettings({ ...settings, maxFileSize: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="allowedFileTypes">Tipos de Archivo Permitidos</Label>
                  <Input
                    id="allowedFileTypes"
                    value={settings.allowedFileTypes}
                    onChange={(e) => setSettings({ ...settings, allowedFileTypes: e.target.value })}
                    placeholder="pdf,doc,docx,jpg,png"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="documentRetention">Retención de Documentos (días)</Label>
                  <Input
                    id="documentRetention"
                    value={settings.documentRetention}
                    onChange={(e) => setSettings({ ...settings, documentRetention: e.target.value })}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="flex justify-end">
            <Button>Guardar Configuración</Button>
          </div>
        </TabsContent>

        {/* Audit Tab */}
        <TabsContent value="audit" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Registro de Auditoría</CardTitle>
              <CardDescription>Historial de actividades del sistema</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {auditLogs.map((log) => (
                  <div key={log.id} className="flex items-start space-x-3 p-4 border rounded">
                    {getLogStatusIcon(log.status)}
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{log.action}</span>
                        <span className="text-xs text-muted-foreground">{log.timestamp}</span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Usuario: {log.user} | Recurso: {log.resource}
                      </p>
                      <p className="text-sm mt-1">{log.details}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Maintenance Tab */}
        <TabsContent value="maintenance" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Backup y Restauración</CardTitle>
                <CardDescription>Gestión de copias de seguridad</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-3 border rounded">
                  <div>
                    <p className="font-medium">Último Backup</p>
                    <p className="text-sm text-muted-foreground">{systemStats.lastBackup}</p>
                  </div>
                  <Badge variant="secondary">Completado</Badge>
                </div>

                <div className="space-y-2">
                  <Button onClick={handleBackupNow} className="w-full">
                    <Database className="h-4 w-4 mr-2" />
                    Crear Backup Ahora
                  </Button>
                  <Button variant="outline" className="w-full bg-transparent">
                    <Upload className="h-4 w-4 mr-2" />
                    Restaurar desde Backup
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Exportación de Datos</CardTitle>
                <CardDescription>Exportar información del sistema</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Button onClick={handleExportData} variant="outline" className="w-full bg-transparent">
                    <Download className="h-4 w-4 mr-2" />
                    Exportar Documentos
                  </Button>
                  <Button variant="outline" className="w-full bg-transparent">
                    <Download className="h-4 w-4 mr-2" />
                    Exportar Transportistas
                  </Button>
                  <Button variant="outline" className="w-full bg-transparent">
                    <Download className="h-4 w-4 mr-2" />
                    Exportar Logs de Auditoría
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Mantenimiento del Sistema</CardTitle>
              <CardDescription>Herramientas de limpieza y optimización</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                <Button variant="outline">
                  <Activity className="h-4 w-4 mr-2" />
                  Limpiar Cache
                </Button>
                <Button variant="outline">
                  <Database className="h-4 w-4 mr-2" />
                  Optimizar BD
                </Button>
                <Button variant="outline">
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Generar Reportes
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
