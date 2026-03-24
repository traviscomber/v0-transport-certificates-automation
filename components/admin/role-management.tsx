'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Shield, Users, Building2, Truck, User } from "lucide-react"
import { UserRole, ROLE_PERMISSIONS, getUserRoleDisplay, getPermissionSummary } from "@/lib/rbac-access-control"

interface RoleManagementProps {
  currentUserRole?: UserRole
}

const ROLE_ICONS: Record<UserRole, React.ReactNode> = {
  administrador: <Shield className="w-5 h-5 text-red-600" />,
  despachador: <Users className="w-5 h-5 text-orange-600" />,
  mandante: <Building2 className="w-5 h-5 text-blue-600" />,
  transportista: <Truck className="w-5 h-5 text-green-600" />,
  conductor: <User className="w-5 h-5 text-purple-600" />,
}

const ROLE_COLORS: Record<UserRole, string> = {
  administrador: 'bg-gradient-to-br from-red-500/20 to-red-600/10 border-red-500/30',
  despachador: 'bg-gradient-to-br from-orange-500/20 to-orange-600/10 border-orange-500/30',
  mandante: 'bg-gradient-to-br from-blue-500/20 to-blue-600/10 border-blue-500/30',
  transportista: 'bg-gradient-to-br from-green-500/20 to-green-600/10 border-green-500/30',
  conductor: 'bg-gradient-to-br from-purple-500/20 to-purple-600/10 border-purple-500/30',
}

const ROLE_BADGE_COLORS: Record<UserRole, string> = {
  administrador: 'bg-red-500/30 text-red-200 border border-red-500/50',
  despachador: 'bg-orange-500/30 text-orange-200 border border-orange-500/50',
  mandante: 'bg-blue-500/30 text-blue-200 border border-blue-500/50',
  transportista: 'bg-green-500/30 text-green-200 border border-green-500/50',
  conductor: 'bg-purple-500/30 text-purple-200 border border-purple-500/50',
}

export function RoleManagement({ currentUserRole = 'administrador' }: RoleManagementProps) {
  const roles: UserRole[] = ['administrador', 'despachador', 'mandante', 'transportista', 'conductor']

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Gestión de Roles y Permisos</h2>
        <p className="text-muted-foreground">
          Sistema de control de acceso basado en roles (RBAC). Cada usuario tiene permisos específicos según su rol.
        </p>
      </div>

      {/* Roles Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {roles.map(role => {
          const summary = getPermissionSummary(role as UserRole)
          return (
            <Card key={role} className={`border ${ROLE_COLORS[role as UserRole]}`}>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    {ROLE_ICONS[role as UserRole]}
                    <h3 className="font-semibold">{getUserRoleDisplay(role as UserRole)}</h3>
                  </div>
                </div>
                <div className="space-y-2">
                  <div>
                    <p className="text-sm text-slate-400">Recursos</p>
                    <p className="text-2xl font-bold text-white">{summary.resources.length}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-400">Permisos</p>
                    <p className="text-lg font-semibold text-white">{summary.totalPermissions}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Detailed Permissions Table */}
      <Card>
        <CardHeader>
          <CardTitle>Matriz de Permisos por Rol</CardTitle>
          <CardDescription>
            Detalle de permisos de lectura, escritura, eliminación y gestión para cada rol
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {roles.map(role => {
              const permissions = ROLE_PERMISSIONS[role as UserRole] || {}
              const permissionEntries = Object.entries(permissions)
              
              if (permissionEntries.length === 0) {
                return (
                  <div key={role} className="space-y-3">
                    <div className="flex items-center gap-2">
                      {ROLE_ICONS[role as UserRole]}
                      <h3 className="font-semibold">{getUserRoleDisplay(role as UserRole)}</h3>
                    </div>
                    <p className="text-sm text-muted-foreground">Sin permisos definidos</p>
                    <div className="border-t pt-4" />
                  </div>
                )
              }
              
              return (
                <div key={role} className="space-y-3">
                  <div className="flex items-center gap-2">
                    {ROLE_ICONS[role as UserRole]}
                    <h3 className="font-semibold">{getUserRoleDisplay(role as UserRole)}</h3>
                  </div>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Recurso</TableHead>
                          <TableHead>Lectura</TableHead>
                          <TableHead>Escritura</TableHead>
                          <TableHead>Eliminación</TableHead>
                          <TableHead>Gestión</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {permissionEntries.map(([resource, perms]) => {
                          const hasRead = perms.some(p => p.action === 'read')
                          const hasWrite = perms.some(p => p.action === 'write')
                          const hasDelete = perms.some(p => p.action === 'delete')
                          const hasManage = perms.some(p => p.action === 'manage')
                          
                          return (
                            <TableRow key={`${role}-${resource}`}>
                              <TableCell className="font-medium capitalize">{resource}</TableCell>
                              <TableCell>
                                {hasRead ? (
                                  <Badge className="bg-green-500/30 text-green-200 border border-green-500/50">✓</Badge>
                                ) : (
                                  <Badge className="bg-slate-700/50 text-slate-400 border border-slate-600/50">-</Badge>
                                )}
                              </TableCell>
                              <TableCell>
                                {hasWrite ? (
                                  <Badge className="bg-green-500/30 text-green-200 border border-green-500/50">✓</Badge>
                                ) : (
                                  <Badge className="bg-slate-700/50 text-slate-400 border border-slate-600/50">-</Badge>
                                )}
                              </TableCell>
                              <TableCell>
                                {hasDelete ? (
                                  <Badge className="bg-red-500/30 text-red-200 border border-red-500/50">✓</Badge>
                                ) : (
                                  <Badge className="bg-slate-700/50 text-slate-400 border border-slate-600/50">-</Badge>
                                )}
                              </TableCell>
                              <TableCell>
                                {hasManage ? (
                                  <Badge className="bg-orange-500/30 text-orange-200 border border-orange-500/50">✓</Badge>
                                ) : (
                                  <Badge className="bg-slate-700/50 text-slate-400 border border-slate-600/50">-</Badge>
                                )}
                              </TableCell>
                            </TableRow>
                          )
                        })}
                      </TableBody>
                    </Table>
                  </div>
                  <div className="border-t pt-4" />
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Role Descriptions */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="bg-gradient-to-br from-red-500/20 to-red-600/10 border-red-500/30">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-red-400" />
              <CardTitle className="text-red-100">Administrador</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-sm text-slate-300">Acceso total al sistema</p>
            <ul className="text-sm space-y-1 text-slate-400">
              <li>• Gestionar transportistas, mandantes</li>
              <li>• Crear conductores y vehículos</li>
              <li>• Validar y rechazar documentos</li>
              <li>• Ver reportes globales</li>
            </ul>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-500/20 to-blue-600/10 border-blue-500/30">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Building2 className="w-5 h-5 text-blue-400" />
              <CardTitle className="text-blue-100">Mandante</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-sm text-slate-300">Gestiona sus transportistas</p>
            <ul className="text-sm space-y-1 text-slate-400">
              <li>• Ver transportistas asignados</li>
              <li>• Descargar documentos</li>
              <li>• Ver alertas de vencimiento</li>
              <li>• Reportes de compliance</li>
            </ul>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-500/20 to-green-600/10 border-green-500/30">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Truck className="w-5 h-5 text-green-400" />
              <CardTitle className="text-green-100">Transportista</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-sm text-slate-300">Gestiona conductores y vehículos</p>
            <ul className="text-sm space-y-1 text-slate-400">
              <li>• Registrar conductores</li>
              <li>• Subir documentos</li>
              <li>• Ver estado de documentos</li>
              <li>• Recibir alertas personalizadas</li>
            </ul>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500/20 to-purple-600/10 border-purple-500/30">
          <CardHeader>
            <div className="flex items-center gap-2">
              <User className="w-5 h-5 text-purple-400" />
              <CardTitle className="text-purple-100">Conductor</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-sm text-slate-300">Gestiona sus documentos</p>
            <ul className="text-sm space-y-1 text-slate-400">
              <li>• Subir documentos propios</li>
              <li>• Ver estado de documentos</li>
              <li>• Recibir alertas de vencimiento</li>
              <li>• Descargar certificados</li>
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* Access Control Tips */}
      <Card className="bg-gradient-to-br from-cyan-500/20 to-cyan-600/10 border-cyan-500/30">
        <CardHeader>
          <CardTitle className="text-base text-cyan-100">Notas sobre Control de Acceso</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-slate-300">
          <p>• Los permisos se aplican automáticamente según el rol del usuario</p>
          <p>• Los transportistas solo ven sus conductores y vehículos</p>
          <p>• Los mandantes solo ven sus transportistas asignados</p>
          <p>• Los conductores solo pueden subir y ver sus propios documentos</p>
          <p>• Los administradores tienen acceso sin restricciones</p>
        </CardContent>
      </Card>
    </div>
  )
}
