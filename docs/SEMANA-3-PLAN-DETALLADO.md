# SEMANA 3 - UI CORE Y NAVEGACIÓN (PLAN DETALLADO)

## 📋 RESUMEN EJECUTIVO

**Semana:** 3 de 12  
**Fase:** FUNDACIÓN (Final)  
**Objetivo Principal:** Interfaz de usuario base navegable para todos los 5 roles  
**Status:** ⏳ POR INICIAR

---

## 🎯 OBJETIVO GENERAL

Construir una UI cohesiva, profesional y responsive que permita la navegación y gestión de datos para los 5 roles principales del sistema.

**Hito:** UI navegable para admin, dispatcher, transportista, driver y mandante

---

## 📝 ENTREGABLES SEMANA 3 (6 COMPONENTS/FEATURES)

### 1. Layout Principal con Sidebar Responsive ✅ PARCIAL
**Estado:** 60% completado (header ya existe, sidebar puede optimizarse)  
**Archivo:** `/components/layout/dashboard-sidebar.tsx` + `/components/layout/header.tsx`

**Lo que FALTA:**
- [ ] Animación smooth en collapse/expand del sidebar
- [ ] Indicador visual de página activa
- [ ] Sub-menús desplegables por sección
- [ ] Logout button con confirmación
- [ ] Profile dropdown en header
- [ ] Dark mode toggle
- [ ] Search bar en header
- [ ] Notificación icon con contador

**Checklist:**
```
- [ ] Sidebar: 100% funcional con animaciones
- [ ] Header: Completo con profile y notificaciones
- [ ] Responsive: Hamburger en mobile, full en desktop
- [ ] Accesibilidad: ARIA labels y navegación keyboard
- [ ] Tema: Dark por defecto, light toggle opcional
```

---

### 2. Dashboard Genérico Reutilizable ✅ PARCIAL
**Estado:** 80% completado (dashboard principal existe)  
**Archivo:** `/app/(dashboard)/dashboard/page.tsx` (LISTO) + varías para otros roles

**Lo que FALTA:**
- [ ] Dashboard para Admin (gestión del sistema)
- [ ] Dashboard para Dispatcher (gestión de asignaciones)
- [ ] Dashboard para Transportista (gestión de flota)
- [ ] Dashboard para Driver (vista personal)
- [ ] Dashboard para Mandante (auditoría)

**Por Dashboard (Template reutilizable):**
```
- [ ] Cards KPI (4-6 métricos principales)
- [ ] Gráfico de tendencias (últimos 30 días)
- [ ] Tabla de últimas acciones
- [ ] Quick actions (botones de acceso rápido)
- [ ] Calendario de vencimientos
- [ ] Alertas críticas destacadas
```

**Checklist:**
```
- [ ] 5 variantes de dashboard (una por rol)
- [ ] KPIs dinámicos según rol
- [ ] Gráficos con Recharts
- [ ] Cards responsivas
- [ ] Color coding por prioridad
```

---

### 3. Componentes UI Base (20+ componentes) ✅ PARCIAL
**Estado:** 60% completado (shadcn/ui ya integrado)  
**Archivos:** `/components/ui/*`

**Componentes NUEVOS o por mejorar:**

#### Tablas
- [ ] DataTable reutilizable con:
  - [ ] Sorting
  - [ ] Filtering
  - [ ] Pagination
  - [ ] Selección múltiple
  - [ ] Bulk actions
  - [ ] Responsividad

#### Forms
- [ ] FormField reutilizable
- [ ] Input con validación en tiempo real
- [ ] Select con search
- [ ] MultiSelect
- [ ] DatePicker
- [ ] TimePicker
- [ ] FileUpload
- [ ] RichText editor (básico)

#### Modals/Dialogs
- [ ] Confirmación de acción
- [ ] Formulario en modal
- [ ] Galería de imágenes
- [ ] Preview de PDF

#### Status Badges
- [ ] Por estado de documento (Pendiente, Aprobado, Rechazado, Vencido)
- [ ] Por compliance score (Excelente, Bueno, Alerta, Crítico)
- [ ] Por rol del usuario

#### Notificaciones
- [ ] Toast (esquina inferior derecha)
- [ ] Alert banner (encima del contenido)
- [ ] Notification center

**Checklist:**
```
- [ ] 10+ componentes de tabla
- [ ] 8+ componentes de form
- [ ] 4+ componentes de modal
- [ ] 5+ badges de estado
- [ ] Sistema de notificaciones
- [ ] Todos accesibles (WCAG 2.1)
- [ ] Todos responsivos
```

---

### 4. Sistema de Navegación por Rol 🔴 NO INICIADO
**Estado:** 0% (Necesita crearse)  
**Archivo:** `/lib/navigation.ts` (nuevo)

**Especificación:**

```typescript
// Estructura esperada
const roleNavigation = {
  admin: {
    main: ['Dashboard', 'Usuarios', 'Organizaciones', 'Config'],
    secondary: ['Reportes', 'Logs', 'Soporte']
  },
  dispatcher: {
    main: ['Dashboard', 'Asignaciones', 'Conductores', 'Vehículos'],
    secondary: ['Alertas', 'Documentos']
  },
  transportista: {
    main: ['Dashboard', 'Flota', 'Conductores', 'Vehículos'],
    secondary: ['Documentos', 'Alertas', 'Reportes']
  },
  driver: {
    main: ['Mi Dashboard', 'Mis Documentos', 'Mi Perfil'],
    secondary: ['Alertas', 'Soporte']
  },
  mandante: {
    main: ['Dashboard', 'Transportistas', 'Auditoría'],
    secondary: ['Reportes', 'Configuración']
  }
}
```

**Requisitos:**
- [ ] Navigation array por rol
- [ ] Route protection por rol
- [ ] Middleware de autorización
- [ ] Redirect automático a primera ruta permitida
- [ ] Breadcrumbs dinámicos
- [ ] Active link highlighting

**Checklist:**
```
- [ ] 5 rutas principales por rol
- [ ] Route guards implementados
- [ ] Fallback path configurado
- [ ] Breadcrumbs generados automáticamente
- [ ] Mobile navigation colapsible
```

---

### 5. Página de Login/Registro Mejorada ✅ PARCIAL
**Estado:** 70% completado (login existe)  
**Archivos:** `/app/auth/login/page.tsx` + `/app/auth/register/page.tsx`

**Mejoras NECESARIAS:**

#### Login Page
- [x] Email/Password (YA EXISTE)
- [ ] Social login (Google, GitHub - opcional)
- [ ] Remember me
- [ ] Forgot password link
- [ ] Auto-focus en primer input
- [ ] Validación en tiempo real
- [ ] Error messages claros
- [ ] Loading state
- [ ] Redirect automático a dashboard

#### Register Page
- [ ] Wizard multi-step (3 pasos)
  - Paso 1: Email + contraseña
  - Paso 2: Datos personales (nombre, RUT, teléfono)
  - Paso 3: Seleccionar rol + organización
- [ ] Validación de email único
- [ ] Password strength indicator
- [ ] Términos y condiciones checkbox
- [ ] Email verification (opcional)

#### Forgot Password
- [ ] Email input
- [ ] Send reset link
- [ ] Reset password form
- [ ] Success message

**Checklist:**
```
- [ ] Login: Completo y funcional
- [ ] Register: 3-step wizard
- [ ] Forgot password: Completo
- [ ] Validaciones: RUT, email, contraseña
- [ ] Seguridad: XSS, CSRF protection
- [ ] Responsive: 100% mobile
- [ ] Accesibilidad: Labels, placeholders
- [ ] Error handling: Mensajes claros
```

---

### 6. Página de Perfil de Usuario 🔴 NO INICIADO
**Estado:** 0% (Necesita crearse)  
**Archivo:** `/app/(dashboard)/profile/page.tsx` (nuevo)

**Características:**

#### Sección: Información Personal
- [ ] Avatar editable
- [ ] Nombre, email, teléfono
- [ ] RUT (no editable)
- [ ] Rol (no editable)
- [ ] Organización (si aplica)
- [ ] Fecha de registro
- [ ] Status de 2FA

#### Sección: Cambiar Contraseña
- [ ] Current password
- [ ] New password (con strength indicator)
- [ ] Confirm password
- [ ] Save button

#### Sección: Preferencias
- [ ] Tema (light/dark)
- [ ] Idioma (Spanish/English)
- [ ] Timezone
- [ ] Notificaciones por email
- [ ] Resumen de alertas (diario/semanal/nunca)

#### Sección: Seguridad
- [ ] Sesiones activas (listar)
- [ ] Cerrar sesión en otros dispositivos
- [ ] Login history (últimos 10)
- [ ] 2FA setup (Google Authenticator)

#### Sección: Organizaciones (si admin/transportista)
- [ ] Lista de organizaciones
- [ ] Cambiar organización activa
- [ ] Dejar organización
- [ ] Invitar miembros

**Checklist:**
```
- [ ] Avatar upload (Supabase Storage)
- [ ] Edición de datos con validación
- [ ] Change password con validación
- [ ] Preferences guardadas
- [ ] Login history mostrado
- [ ] 2FA implementado
- [ ] Responsive design
- [ ] Confirmación antes de cambios críticos
```

---

## 🔧 TAREAS TÉCNICAS POR PRIORIDAD

### ALTA PRIORIDAD (Debe estar listo Día 3-4)

1. **Sistema de rutas por rol**
   - [ ] Middleware de autorización
   - [ ] Role-based route guards
   - [ ] Redirect automático

2. **Componentes de tabla y formularios**
   - [ ] DataTable reutilizable
   - [ ] Form inputs validados
   - [ ] Modal dialogs

3. **5 Dashboards principales**
   - [ ] Estructura base para cada rol
   - [ ] KPI cards
   - [ ] Quick actions

### MEDIA PRIORIDAD (Debe estar listo Día 5-6)

4. **Sidebar y Header mejorados**
   - [ ] Animaciones smooth
   - [ ] Profile dropdown
   - [ ] Notificaciones

5. **Login/Register mejorado**
   - [ ] Validaciones
   - [ ] 2FA setup opcional
   - [ ] Social login (opcional)

### BAJA PRIORIDAD (Puede esperar a Día 7)

6. **Página de perfil**
   - [ ] Edición de datos
   - [ ] Preferencias
   - [ ] Seguridad

---

## 📁 ARCHIVOS A CREAR/MODIFICAR

### CREAR (Nuevos)
```
/app/(dashboard)/profile/page.tsx
/components/dashboard/role-dashboards/
  ├── admin-dashboard.tsx
  ├── dispatcher-dashboard.tsx
  ├── transportista-dashboard.tsx
  ├── driver-dashboard.tsx
  └── mandante-dashboard.tsx
/components/tables/
  ├── data-table.tsx
  ├── columns.ts
  └── filters.tsx
/components/forms/
  ├── user-form.tsx
  ├── document-form.tsx
  └── assignment-form.tsx
/lib/navigation.ts
/lib/auth-guards.ts
/lib/permissions.ts
```

### MODIFICAR (Existentes)
```
/components/layout/dashboard-sidebar.tsx (mejorar animaciones)
/components/layout/header.tsx (agregar profile dropdown)
/app/auth/login/page.tsx (validaciones mejoradas)
/app/auth/register/page.tsx (wizard multi-step)
/app/(dashboard)/layout.tsx (role-based layout)
```

---

## 🎨 CONSIDERACIONES DE DISEÑO

### Color Coding por Rol
```
Admin:        Púrpura (#9333ea)
Dispatcher:   Azul (#3b82f6)
Transportista: Verde (#10b981)
Driver:       Naranja (#f97316)
Mandante:     Rojo (#ef4444)
```

### Estados de Documento
```
Pendiente:    Amarillo (#eab308)
Aprobado:     Verde (#22c55e)
Rechazado:    Rojo (#ef4444)
Vencido:      Rojo oscuro (#991b1b)
```

### Responsividad Esperada
```
Mobile (<640px):    Stack vertical, hamburger menu
Tablet (640-1024):  2 columnas, sidebar colapsible
Desktop (>1024):    3-4 columnas, sidebar expandido
```

---

## ✅ CRITERIOS DE ACEPTACIÓN

### Por Cada Feature

**Layout Principal**
- [ ] Sidebar aparece/desaparece en mobile
- [ ] Navegación fluida entre páginas
- [ ] Página activa highlighted
- [ ] Logout funciona correctamente

**Dashboards**
- [ ] Cada rol ve datos diferentes
- [ ] KPIs muestran valores correctos
- [ ] Gráficos son interactivos
- [ ] Quick actions funcionan

**Componentes UI**
- [ ] Tablas son responsivas
- [ ] Forms validan en tiempo real
- [ ] Modals se abren/cierran correctamente
- [ ] Botones tienen feedback visual

**Navegación por Rol**
- [ ] Usuarios no pueden acceder a rutas no permitidas
- [ ] Redirect automático funciona
- [ ] Breadcrumbs se actualizan
- [ ] Sub-menús funcionan

**Auth Mejorado**
- [ ] Login requiere validación
- [ ] Register valida campos
- [ ] Contraseña se muestra/oculta
- [ ] Error handling es claro

**Perfil de Usuario**
- [ ] Avatar se puede subir
- [ ] Datos se guardan en BD
- [ ] Cambio de contraseña funciona
- [ ] Preferencias persisten

---

## 📊 TIMELINE SEMANA 3

```
DÍA 1-2:  Estructura + Rutas por rol + Middleware
DÍA 3-4:  5 Dashboards + Componentes base de tabla
DÍA 5-6:  Sidebar/Header mejorados + Auth UI
DÍA 7:    Perfil de usuario + Pulida final
```

---

## 🚀 DEFINICIÓN DE "LISTO"

Semana 3 se considera **COMPLETADA** cuando:

1. ✅ Los 5 roles tienen navegación diferente
2. ✅ Cada rol ve un dashboard personalizado
3. ✅ Todos los componentes UI son responsivos
4. ✅ El login/register están pulidos
5. ✅ La página de perfil permite editar datos
6. ✅ Sin errores en consola
7. ✅ Performance: LCP < 2.5s, FID < 100ms
8. ✅ Documentación actualizada
9. ✅ Código reviewed y mergeado

---

## 📚 DEPENDENCIAS

- ✅ Semana 1: Base de datos + Auth (COMPLETADA)
- ✅ Semana 2: APIs backend (COMPLETADA)
- ⏳ Semana 3: UI Core (EN PROGRESO)
- ⏳ Semana 4+: Features específicas

---

## 🎓 NOTAS IMPORTANTES

1. **Reutilizar componentes:** No crear nuevo componente si existe uno similar
2. **Responsive first:** Diseñar para mobile primero, luego desktop
3. **Accesibilidad:** WCAG 2.1 AA es mínimo requerido
4. **Performance:** No cargar más de 3 componentes pesados por página
5. **Testing:** Al menos smoke tests por feature principal
6. **Documentation:** Actualizar README con nuevas rutas

---

## 🔗 REFERENCIAS

- MVP Roadmap: `/docs/MVP-ROADMAP-12-WEEKS.md`
- Funcionalidades W1-W2: `/docs/FUNCIONALIDADES-IMPLEMENTADAS-W1-W2.md`
- Design System: Colors, Typography definidos en `globals.css`
- API Endpoints: Swagger UI en `/api/docs`

---

*Documento generado: Semana 3 del MVP*  
*Status: Plan Detallado Listo para Implementación*
