export type UserRole = 'administrador' | 'despachador' | 'mandante' | 'transportista' | 'conductor' | 'prevencionista'

export interface Permission {
  resource: string
  action: 'read' | 'write' | 'delete' | 'manage'
}

export interface RolePermissions {
  [key: string]: Permission[]
}

export const ROLE_PERMISSIONS: Record<UserRole, RolePermissions> = {
  administrador: {
    // Administrador tiene acceso total
    transportistas: [
      { resource: 'transportistas', action: 'read' },
      { resource: 'transportistas', action: 'write' },
      { resource: 'transportistas', action: 'delete' },
      { resource: 'transportistas', action: 'manage' },
    ],
    conductores: [
      { resource: 'conductores', action: 'read' },
      { resource: 'conductores', action: 'write' },
      { resource: 'conductores', action: 'delete' },
      { resource: 'conductores', action: 'manage' },
    ],
    vehiculos: [
      { resource: 'vehiculos', action: 'read' },
      { resource: 'vehiculos', action: 'write' },
      { resource: 'vehiculos', action: 'delete' },
      { resource: 'vehiculos', action: 'manage' },
    ],
    documentos: [
      { resource: 'documentos', action: 'read' },
      { resource: 'documentos', action: 'write' },
      { resource: 'documentos', action: 'delete' },
      { resource: 'documentos', action: 'manage' },
    ],
    mandantes: [
      { resource: 'mandantes', action: 'read' },
      { resource: 'mandantes', action: 'write' },
      { resource: 'mandantes', action: 'delete' },
      { resource: 'mandantes', action: 'manage' },
    ],
    reportes: [
      { resource: 'reportes', action: 'read' },
      { resource: 'reportes', action: 'write' },
    ],
  },
  
  despachador: {
    // Despachador puede gestionar conductores, vehiculos y documentos
    transportistas: [
      { resource: 'transportistas', action: 'read' },
    ],
    conductores: [
      { resource: 'conductores', action: 'read' },
      { resource: 'conductores', action: 'write' },
      { resource: 'conductores', action: 'manage' },
    ],
    vehiculos: [
      { resource: 'vehiculos', action: 'read' },
      { resource: 'vehiculos', action: 'write' },
      { resource: 'vehiculos', action: 'manage' },
    ],
    documentos: [
      { resource: 'documentos', action: 'read' },
      { resource: 'documentos', action: 'write' },
      { resource: 'documentos', action: 'manage' },
    ],
    reportes: [
      { resource: 'reportes', action: 'read' },
      { resource: 'reportes', action: 'write' },
    ],
  },

  mandante: {
    // Mandante ve solo sus transportistas y documentos
    transportistas: [
      { resource: 'transportistas', action: 'read' },
      { resource: 'transportistas', action: 'write' }, // Puede editar sus transportistas
    ],
    conductores: [
      { resource: 'conductores', action: 'read' }, // Ver conductores de sus transportistas
    ],
    vehiculos: [
      { resource: 'vehiculos', action: 'read' }, // Ver vehículos de sus transportistas
    ],
    documentos: [
      { resource: 'documentos', action: 'read' },
      { resource: 'documentos', action: 'write' }, // Puede subir documentos
    ],
    reportes: [
      { resource: 'reportes', action: 'read' }, // Solo sus reportes
    ],
  },

  transportista: {
    // Transportista ve solo sus conductores y vehículos
    conductores: [
      { resource: 'conductores', action: 'read' },
      { resource: 'conductores', action: 'write' }, // Puede registrar conductores
    ],
    vehiculos: [
      { resource: 'vehiculos', action: 'read' },
      { resource: 'vehiculos', action: 'write' }, // Puede registrar vehículos
    ],
    documentos: [
      { resource: 'documentos', action: 'read' },
      { resource: 'documentos', action: 'write' }, // Puede subir documentos
    ],
    reportes: [
      { resource: 'reportes', action: 'read' }, // Solo sus reportes
    ],
  },

  conductor: {
    // Conductor solo ve sus documentos
    documentos: [
      { resource: 'documentos', action: 'read' },
      { resource: 'documentos', action: 'write' }, // Puede subir sus documentos
    ],
  },

  prevencionista: {
    // Prevencionista solo lectura a documentos aprobados
    documentos: [
      { resource: 'documentos', action: 'read' }, // Solo lectura de documentos aprobados
    ],
  },
}

export function hasPermission(userRole: UserRole, resource: string, action: 'read' | 'write' | 'delete' | 'manage'): boolean {
  const permissions = ROLE_PERMISSIONS[userRole]
  if (!permissions) return false

  const resourcePermissions = permissions[resource]
  if (!resourcePermissions) return false

  return resourcePermissions.some(p => p.action === action)
}

export function getNavigationItems(userRole: UserRole) {
  const navItems: { href: string; label: string; icon: string }[] = []

  if (userRole === 'administrador') {
    navItems.push(
      { href: '/administrador', label: 'Dashboard', icon: 'LayoutDashboard' },
      { href: '/administrador/mandantes', label: 'Mandantes', icon: 'Building2' },
      { href: '/administrador/transportistas', label: 'Transportistas', icon: 'Truck' },
      { href: '/administrador/vehiculos', label: 'Vehiculos', icon: 'Car' },
      { href: '/administrador/conductores', label: 'Conductores', icon: 'Users' },
      { href: '/administrador/documentos', label: 'Documentos', icon: 'FileText' },
    )
  } else if (userRole === 'despachador') {
    navItems.push(
      { href: '/despachador', label: 'Dashboard', icon: 'LayoutDashboard' },
      { href: '/despachador/conductores', label: 'Conductores', icon: 'Users' },
      { href: '/despachador/vehiculos', label: 'Vehiculos', icon: 'Car' },
      { href: '/despachador/documentos', label: 'Documentos', icon: 'FileText' },
      { href: '/despachador/alertas', label: 'Alertas', icon: 'AlertCircle' },
      { href: '/despachador/reportes', label: 'Reportes', icon: 'BarChart3' },
    )
  } else if (userRole === 'mandante') {
    navItems.push(
      { href: '/mandante/dashboard', label: 'Mi Dashboard', icon: 'LayoutDashboard' },
      { href: '/mandante/transportistas', label: 'Mis Transportistas', icon: 'Truck' },
      { href: '/mandante/documentos', label: 'Documentos', icon: 'FileText' },
      { href: '/mandante/reportes', label: 'Reportes', icon: 'BarChart3' },
    )
  } else if (userRole === 'transportista') {
    navItems.push(
      { href: '/transportista/dashboard', label: 'Mi Dashboard', icon: 'LayoutDashboard' },
      { href: '/transportista/conductores', label: 'Mis Conductores', icon: 'Users' },
      { href: '/transportista/vehiculos', label: 'Mis Vehículos', icon: 'Car' },
      { href: '/transportista/documentos', label: 'Documentos', icon: 'FileText' },
      { href: '/transportista/alertas', label: 'Alertas', icon: 'AlertCircle' },
    )
  } else if (userRole === 'conductor') {
    navItems.push(
      { href: '/conductor/dashboard', label: 'Mi Dashboard', icon: 'LayoutDashboard' },
      { href: '/conductor/documentos', label: 'Mis Documentos', icon: 'FileText' },
      { href: '/conductor/alertas', label: 'Alertas', icon: 'AlertCircle' },
    )
  } else if (userRole === 'prevencionista') {
    navItems.push(
      { href: '/prevencionista/dashboard', label: 'Mi Dashboard', icon: 'LayoutDashboard' },
      { href: '/prevencionista/documentos', label: 'Documentos Aprobados', icon: 'FileText' },
    )
  }

  return navItems
}

export function canAccessRoute(userRole: UserRole, route: string): boolean {
  // Administrador siempre puede acceder
  if (userRole === 'administrador') return true

  // Mapeo de rutas a roles permitidos
  const routeAccessMap: Record<string, UserRole[]> = {
    '/administrador': ['administrador'],
    '/administrador/': ['administrador'],
    '/despachador': ['despachador', 'administrador'],
    '/despachador/': ['despachador', 'administrador'],
    '/mandante': ['mandante'],
    '/mandante/': ['mandante'],
    '/transportista': ['transportista'],
    '/transportista/': ['transportista'],
    '/conductor': ['conductor'],
    '/conductor/': ['conductor'],
    '/prevencionista': ['prevencionista'],
    '/prevencionista/': ['prevencionista'],
    '/dashboard': ['administrador', 'despachador', 'mandante', 'transportista', 'conductor', 'prevencionista'],
  }

  // Verificar acceso a ruta
  for (const [allowedRoute, roles] of Object.entries(routeAccessMap)) {
    if (route.startsWith(allowedRoute)) {
      return roles.includes(userRole)
    }
  }

  // Rutas públicas
  if (route === '/' || route === '/login' || route === '/register') {
    return true
  }

  return false
}

export function getUserRoleDisplay(role: UserRole): string {
  const displayNames: Record<UserRole, string> = {
    administrador: 'Administrador',
    despachador: 'Despachador',
    mandante: 'Mandante',
    transportista: 'Transportista',
    conductor: 'Conductor',
    prevencionista: 'Prevencionista',
  }
  return displayNames[role]
}

export function getPermissionSummary(userRole: UserRole): { totalPermissions: number; resources: string[] } {
  const permissions = ROLE_PERMISSIONS[userRole]
  const resources = Object.keys(permissions || {})
  const totalPermissions = Object.values(permissions || {}).reduce((sum, perms) => sum + perms.length, 0)
  
  return {
    totalPermissions,
    resources,
  }
}
