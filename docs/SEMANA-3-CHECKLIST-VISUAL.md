# SEMANA 3 - CHECKLIST VISUAL

## ENTREGABLE 1: Layout Principal con Sidebar Responsive

```
┌─────────────────────────────────────────────────────┐
│ HEADER (Fixed)                                      │
│ Logo │ Search │         │ 🔔 │ Profile ▼ │ 🌙 │  │
├─────┬────────────────────────────────────────────────┤
│     │                                                │
│ Nav │                                                │
│ ─── │         MAIN CONTENT                           │
│ Dsh │                                                │
│ Drs │                                                │
│ Veh │                                                │
│ Doc │                                                │
│ Alt │                                                │
│     │                                                │
└─────┴────────────────────────────────────────────────┘
```

### Checklist
- [ ] Sidebar collapse/expand con animación
- [ ] Icono de hamburger en mobile
- [ ] Profile dropdown con opciones
- [ ] Dark/Light mode toggle
- [ ] Search bar funcional
- [ ] Notificaciones icon con contador
- [ ] Logout button con confirmación
- [ ] Active link highlight
- [ ] Responsive: mobile < 640px → hamburger
- [ ] Responsive: tablet 640-1024px → sidebar colapsible
- [ ] Responsive: desktop > 1024px → sidebar expandido

**Files:** `dashboard-sidebar.tsx`, `header.tsx`

---

## ENTREGABLE 2: Dashboard Genérico Reutilizable

### Template Base (Reutilizable para 5 roles)

```
┌─────────────────────────────────────────────┐
│ Dashboard - [Rol]                           │
├─────────────────────────────────────────────┤
│                                             │
│  ┌──────┐  ┌──────┐  ┌──────┐  ┌──────┐  │
│  │ KPI1 │  │ KPI2 │  │ KPI3 │  │ KPI4 │  │
│  └──────┘  └──────┘  └──────┘  └──────┘  │
│                                             │
│  ┌─────────────────┐  ┌──────────────────┐ │
│  │ Gráfico Trends  │  │ Alertas          │ │
│  │ (Últimos 30 d)  │  │ Críticas         │ │
│  └─────────────────┘  └──────────────────┘ │
│                                             │
│  ┌──────────────────────────────────────┐  │
│  │ Últimas Acciones / Vencimientos      │  │
│  └──────────────────────────────────────┘  │
│                                             │
└─────────────────────────────────────────────┘
```

### 5 Dashboards

#### Dashboard ADMIN
- KPI: Total usuarios, Organizaciones, Docs, Alertas
- Gráfico: Crecimiento de plataforma
- Alertas: Errores del sistema
- Acciones: Gestionar usuarios, Config sistema

#### Dashboard DISPATCHER
- KPI: Conductores, Vehículos, Asignaciones, Alertas
- Gráfico: Utilización de flota
- Alertas: Documentos por vencer, Conductores inactivos
- Acciones: Asignar conductor, Ver alertas

#### Dashboard TRANSPORTISTA
- KPI: Flota total, Compliance score, Docs vencidos, Alertas
- Gráfico: Compliance histórico
- Alertas: Documentos críticos
- Acciones: Agregar vehículo, Gestionar flota

#### Dashboard DRIVER
- KPI: Documentos actualizados, Próximos vencimientos, Alertas, Score
- Gráfico: Timeline de documentos
- Alertas: Tus documentos vencidos
- Acciones: Subir documento, Ver mis alertas

#### Dashboard MANDANTE
- KPI: Transportistas contratados, Compliance promedio, Auditorías, Alertas
- Gráfico: Compliance por transportista
- Alertas: Transportistas no conformes
- Acciones: Validar documentos, Bloquear transportista

### Checklist
- [ ] 5 dashboards diferentes (uno por rol)
- [ ] 4 KPI cards por dashboard
- [ ] Gráfico de tendencias con Recharts
- [ ] Tabla de últimas acciones
- [ ] Alertas destacadas
- [ ] Quick action buttons
- [ ] Color coding por rol
- [ ] Responsivo en mobile (stack vertical)
- [ ] Loading states
- [ ] Empty states

**Files:** `dashboards/` (5 files)

---

## ENTREGABLE 3: Componentes UI Base (20+)

### A. TABLAS (DataTable Reutilizable)

```
┌─────────────────────────────────────────────┐
│ Search: [______] | Filter: [v] | Sort: [v] │
├─────────────────────────────────────────────┤
│ ☐ Name      │ Email    │ Role  │ Actions  │
├─────────────────────────────────────────────┤
│ ☐ Juan Perez│ j@ex.com │ Driver│ ✏️ 🗑️  │
│ ☐ Maria Sel │ m@ex.com │ Admin │ ✏️ 🗑️  │
├─────────────────────────────────────────────┤
│ Pag 1 of 5  | << < 1 2 3 > >>  | 10 items │
└─────────────────────────────────────────────┘
```

- [ ] Sorting por columna
- [ ] Filtering por múltiples campos
- [ ] Pagination (10, 25, 50 items)
- [ ] Select/Deselect todos
- [ ] Bulk actions (delete, export)
- [ ] Responsive (scroll horizontal en mobile)

### B. FORMS (Validación en tiempo real)

```
┌─────────────────────────────────────────┐
│ Nombre                                  │
│ [________________] ✓ Requerido          │
│                                         │
│ Email                                   │
│ [________________] ✗ Email inválido     │
│                                         │
│ Contraseña                              │
│ [________________] 👁 Muy débil         │
│ ✓ Mayúscula ✓ Número ✗ Símbolo        │
│                                         │
│ [Cancelar] [Guardar]                   │
└─────────────────────────────────────────┘
```

- [ ] Input text, email, password, phone
- [ ] Select y MultiSelect
- [ ] DatePicker y TimePicker
- [ ] FileUpload con drag & drop
- [ ] Validación en tiempo real
- [ ] Error messages claros
- [ ] Required field indicators
- [ ] Password strength meter

### C. MODALS/DIALOGS

- [ ] Confirmación (Simple alert)
- [ ] Formulario en modal (Crear/Editar)
- [ ] Galería de imágenes
- [ ] Preview PDF

### D. STATUS BADGES

```
Documento:
┌─────────┬──────────┬──────────┬─────────┐
│Pendiente│ Aprobado │Rechazado │ Vencido │
│  🟡    │   🟢    │   🔴    │ 🔴    │
└─────────┴──────────┴──────────┴─────────┘

Compliance:
┌──────────┬─────────┬───────┬──────────┐
│ Excelente│  Bueno  │Alerta │ Crítico  │
│   🟢🟢  │  🟢🟡  │ 🟡   │  🔴    │
└──────────┴─────────┴───────┴──────────┘
```

### E. NOTIFICACIONES

```
┌────────────────────────────────┐
│ ✓ Datos guardados exitosamente │
└────────────────────────────────┘

┌────────────────────────────────┐
│ ✗ Error: No se pudo guardar    │
└────────────────────────────────┘

┌────────────────────────────────┐
│ ⓘ Información importante aquí  │
└────────────────────────────────┘
```

### Checklist
- [ ] DataTable completa (sort, filter, pagination)
- [ ] Form inputs con validaciones
- [ ] Modals para confirmaciones
- [ ] Status badges por estado
- [ ] Sistema de toasts/banners
- [ ] Todos accesibles (WCAG 2.1 AA)
- [ ] Todos responsivos
- [ ] Loading states
- [ ] Error states

**Files:** `tables/data-table.tsx`, `forms/*.tsx`, `modals/*.tsx`

---

## ENTREGABLE 4: Sistema de Navegación por Rol

```
┌─────────────────────────────────────────┐
│ ADMIN Role → Can access:                │
│ ├─ /dashboard (admin-dashboard)         │
│ ├─ /users (user management)             │
│ ├─ /organizations (org management)      │
│ ├─ /settings (system config)            │
│ └─ /reports (all reports)               │
│                                         │
│ DRIVER Role → Can access:               │
│ ├─ /dashboard (driver-dashboard)        │
│ ├─ /my-documents (my docs only)         │
│ ├─ /profile (my profile)                │
│ └─ /alerts (my alerts)                  │
│                                         │
│ ❌ DRIVER tries /users                 │
│ → Redirect /dashboard + error toast    │
└─────────────────────────────────────────┘
```

### Checklist
- [ ] Navigation arrays por rol en `lib/navigation.ts`
- [ ] Route guards en middleware
- [ ] Role check en cada página
- [ ] Redirect automático a ruta permitida
- [ ] Breadcrumbs dinámicos
- [ ] Sub-menús desplegables
- [ ] Active link indicator
- [ ] Permisos documentados

**Files:** `lib/navigation.ts`, `lib/auth-guards.ts`, middleware

---

## ENTREGABLE 5: Login/Registro Mejorado

### Login Page
```
┌──────────────────────────┐
│ DocuFleet - Login        │
├──────────────────────────┤
│ Email                    │
│ [____________________]   │
│                          │
│ Contraseña         👁    │
│ [____________________]   │
│                          │
│ ☑ Recordarme             │
│                          │
│ [Iniciar Sesión]         │
│                          │
│ ¿No tienes cuenta?       │
│ [Crear Cuenta]           │
│                          │
│ [Olvidé contraseña]      │
└──────────────────────────┘
```

### Register Wizard (3 Steps)
```
Step 1: Email + Password
┌──────────────────────────┐
│ Paso 1 de 3: Cuenta      │
│ Email       [________]   │
│ Contraseña  [________]   │
│ Confirmar   [________]   │
│ [Siguiente]              │
└──────────────────────────┘

Step 2: Datos Personales
┌──────────────────────────┐
│ Paso 2 de 3: Datos       │
│ Nombre      [________]   │
│ RUT         [__-___-__-_]│
│ Teléfono    [__________] │
│ [Atrás] [Siguiente]      │
└──────────────────────────┘

Step 3: Rol + Org
┌──────────────────────────┐
│ Paso 3 de 3: Rol         │
│ Rol: [Admin▼]            │
│ Org: [Crear nueva▼]      │
│ [Atrás] [Crear Cuenta]   │
└──────────────────────────┘
```

### Forgot Password
```
┌──────────────────────────┐
│ Olvidé mi contraseña     │
├──────────────────────────┤
│ Email:                   │
│ [____________________]   │
│ [Enviar código]          │
│                          │
│ [Volver al login]        │
└──────────────────────────┘
```

### Checklist
- [ ] Login: Email + password validados
- [ ] Login: Remember me funciona
- [ ] Register: Wizard 3-step completo
- [ ] Register: Validación de RUT
- [ ] Register: Password strength indicator
- [ ] Register: Email verification (opcional)
- [ ] Forgot password: Email reset funciona
- [ ] Error messages: Claros y específicos
- [ ] Loading states durante submit
- [ ] Redirect automático post-login
- [ ] Session management correcto
- [ ] Responsive móvil 100%

**Files:** `auth/login/page.tsx`, `auth/register/page.tsx`, `auth/forgot/page.tsx`

---

## ENTREGABLE 6: Página de Perfil de Usuario

```
┌──────────────────────────────────────────────┐
│ Mi Perfil                                    │
├──────────────────────────────────────────────┤
│                                              │
│ ┌──────────┐  Nombre: Juan Perez             │
│ │ [Avatar] │  Email: juan@empresa.com        │
│ │  Cambiar │  RUT: XX.XXX.XXX-X (No editable)│
│ └──────────┘  Rol: Dispatcher (No editable)  │
│               Teléfono: +56912345678         │
│               Registrado: 15 Mar 2024        │
│                                              │
├──────────────────────────────────────────────┤
│ CAMBIAR CONTRASEÑA                          │
│ Actual:      [_____________]                │
│ Nueva:       [_____________]                │
│ Confirmar:   [_____________]                │
│ [Cambiar Contraseña]                        │
│                                              │
├──────────────────────────────────────────────┤
│ PREFERENCIAS                                 │
│ Tema: Dark/Light [🌙]                      │
│ Idioma: Español/English [ES]               │
│ Notificaciones:  [☑] Email [☑] App         │
│ Resumen:  [Diario▼]                        │
│                                              │
├──────────────────────────────────────────────┤
│ SEGURIDAD                                    │
│ 2FA: Desactivado [Activar]                 │
│                                              │
│ Sesiones Activas:                           │
│ • Chrome / Windows (Actual) - 10:30 AM     │
│ • Safari / iPhone - 9:15 AM                │
│ [Cerrar sesión en otros dispositivos]      │
│                                              │
│ Últimos logins:                             │
│ • 15 Mar 10:30 - 192.168.1.1               │
│ • 15 Mar 09:15 - 192.168.1.50              │
│                                              │
├──────────────────────────────────────────────┤
│ ORGANIZACIONES                              │
│ Empresa X (Actual) [Cambiar]               │
│ Empresa Y [Cambiar]                        │
│ [Invitar miembro]                          │
│                                              │
└──────────────────────────────────────────────┘
```

### Checklist
- [ ] Avatar upload a Supabase Storage
- [ ] Edición de datos con validación
- [ ] Change password con validación actual
- [ ] Password strength indicator
- [ ] Tema claro/oscuro persiste
- [ ] Idioma persiste
- [ ] Notificaciones guardadas
- [ ] 2FA (Google Authenticator optional)
- [ ] Login history mostrando últimos 10
- [ ] Sesiones activas con opción de logout remoto
- [ ] Gestión de organizaciones
- [ ] Confirmación antes de cambios críticos
- [ ] Responsive móvil 100%

**Files:** `profile/page.tsx`, `profile/components/*`

---

## 📊 RESUMEN TAREAS

| # | Task | Est. Time | Status |
|----|------|-----------|--------|
| 1 | Layout + Sidebar | 1-2 days | 🔄 In Progress |
| 2 | 5 Dashboards | 2-3 days | ⏳ TODO |
| 3 | Components UI | 2-3 days | ⏳ TODO |
| 4 | Navigation Roles | 1-2 days | ⏳ TODO |
| 5 | Auth UI | 2-3 days | 🔄 In Progress |
| 6 | Profile Page | 1-2 days | ⏳ TODO |

**Total: ~12-15 days (Semana 3 = 7 días)**

---

## ✅ FINAL CHECKLIST

- [ ] Todos los componentes responsivos (mobile first)
- [ ] Todos los componentes accesibles (WCAG 2.1 AA)
- [ ] Sin errores en consola
- [ ] Performance: LCP < 2.5s, FID < 100ms
- [ ] Tests escritos (al menos smoke tests)
- [ ] Documentación actualizada
- [ ] Código reviewed y listo para merge
- [ ] Screenshots en README
- [ ] Demo funcional en staging

---

**Status:** 🟢 LISTO PARA COMENZAR SEMANA 3
