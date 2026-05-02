# DocuFleet - Sistema de Gestión de Documentación y Certificados

## 📋 Visión General del Proyecto

DocuFleet es una plataforma integral de gestión de documentación, certificados y cumplimiento normativo para empresas de transporte y sus conductores. El sistema automatiza la validación, reporte y auditoría de documentos de identificación, licencias y permisos.

**Tecnología:**
- Next.js 14.2 (App Router)
- Supabase (PostgreSQL + Auth)
- Anthropic Claude (análisis de documentos con IA)
- Tailwind CSS + Shadcn/UI
- TypeScript + React 18

---

## 🎯 FEATURES PRINCIPALES

### 1. GESTIÓN DE CONDUCTORES (Conductor Portal)
**Ruta:** `/conductor/*`

#### Features:
- **Dashboard Conductor** - Panel de control con estado de documentación y cumplimiento
- **Subir Documentos** - Interfaz para cargar licencias, permisos y documentos de identidad
- **Perfil de Conductor** - Gestión de datos personales y preferencias
- **Onboarding Guiado** - Flujo inicial de registro y documentación
- **Historial de Documentos** - Seguimiento de todos los documentos subidos
- **Estado de Cumplimiento** - Indicador visual del progreso de validación

**BD Tables:**
- `conductores` - Perfiles de conductores
- `uploaded_documents` - Documentos subidos
- `document_validations` - Resultados de validación con IA

---

### 2. PANEL ADMINISTRATIVO (Admin Dashboard)
**Ruta:** `/admin/*`

#### Sub-módulos:

##### 2.1 Gestión de Postulantes
- Crear nuevos postulantes con datos personales y empresariales
- Listar todos los postulantes con filtros
- Ver estado de background checks
- Asignar empresas transportistas
- **NUEVO:** Crear nuevas empresas desde formulario consolidado

##### 2.2 Gestión de Conductores
- CRUD completo de conductores
- Sincronización de datos
- Asignación a empresas
- Gestión de licencias y tipos de vehículos

##### 2.3 Gestión de Documentos
- Procesamiento masivo de documentos
- Análisis automático con IA
- Validación multi-capa
- Detección automática de tipo de documento
- Reporte y auditoría de cambios

##### 2.4 Gestión de Usuarios y Equipo
- Crear usuarios administrativos y ejecutivos
- Asignación de roles y permisos
- Importar usuarios en lote (CSV)
- Gestión de equipos por empresa

##### 2.5 Gestión de Empresas/Transportistas
- CRUD de organizaciones
- Configuración de sub-contratistas
- Gestión de datos empresariales

##### 2.6 Gestión de Vehículos
- Registro de vehículos
- Asignación a conductores y empresas
- Validación de documentos vehiculares

##### 2.7 Analytics y Reportes
- Dashboard de métricas (Nuevo)
- Generación de reportes en PDF
- Análisis de cumplimiento
- Estadísticas por empresa/conductor

##### 2.8 Roles y Permisos
- Asignación de roles
- Control de acceso granular
- Gestión de permisos por módulo

---

### 3. PORTAL EMPRESA/MANDANTE
**Ruta:** `/dashboard/company/*`

#### Features:
- **Dashboard Empresa** - Overview de cumplimiento y alertas
- **Gestión de Conductores** - Listar y gestionar conductores asignados
- **Documentos** - Seguimiento de documentación por conductor
- **Alertas** - Notificaciones de documentos vencidos o faltantes
- **Reportes** - Generación de informes de cumplimiento
- **Analytics** - Métricas de cumplimiento de conductores
- **Equipo** - Gestión de usuarios de la empresa
- **Sub-contratistas** - Gestión de empresas asociadas

---

### 4. PORTAL TRANSPORTISTA
**Ruta:** `/transportista/*`

Panel dashboard para empresas transportistas con funcionalidades similares al portal de empresa pero orientado a gestión operativa.

---

### 5. SISTEMA DE AUTENTICACIÓN
**Rutas:** `/auth/*`

#### Tipos de Login:
- **Login Conductor** - Con RUT/DNI y contraseña
- **Login Empresa** - Con email y contraseña
- **Login Directo** - Sin credenciales (dev/demo)
- **Login Simple** - Solo email (para testing)
- **Login API** - Para integraciones
- **Change Password** - Cambio de contraseña

#### Features:
- Registro de nuevos usuarios
- Recuperación de contraseña
- Verificación de email
- Manejo de sesiones con cookies httpOnly

---

### 6. ANÁLISIS AUTOMÁTICO CON IA
**Endpoints:** `/api/analyze-*`, `/api/detect-*`, `/api/v2/*`

#### Features:
- **Análisis de Documentos** - OCR + extracción de datos con Claude
- **Detección de Tipo** - Clasificación automática de documentos
- **Validación Multi-Capa** - Análisis de autenticidad y completitud
- **Análisis de URLs** - Verificación de links y contenido

#### Confidence Flags:
- Validación de autenticidad de documento
- Verificación de datos extraídos
- Detección de documentos falsificados

---

### 7. SISTEMA DE ALERTAS
**Endpoints:** `/api/alerts/*`

- Alertas de documentos vencidos
- Notificaciones de documentos pendientes
- Alertas de cumplimiento por conductor
- Sistema de alertas real-time

---

### 8. GENERACIÓN DE REPORTES Y CERTIFICADOS
**Endpoints:** `/api/certificates/*`, `/api/reports/*`

- Generación de PDF con resumen de cumplimiento
- Procesamiento masivo de certificados
- Reportes customizables
- Exportación de datos (CSV, JSON, PDF)

---

### 9. SISTEMA DE NOTIFICACIONES
**Endpoints:** `/api/notifications/*`, `/api/conductor/send-notification/*`

- Notificaciones por email
- Notificaciones por WhatsApp (preparado)
- Preferencias de notificación por conductor
- Sistema de contacto/chat

---

### 10. AI SCANNER (Experimental)
**Ruta:** `/ai-scanner`

Interfaz para análisis en tiempo real de documentos con IA.

---

## 🔌 API ENDPOINTS (130 total)

### Categoría: Authentication (8 endpoints)
```
POST   /api/auth/login
POST   /api/auth/login-conductor
POST   /api/auth/login-direct
POST   /api/auth/login-only-api
POST   /api/auth/login-rut
POST   /api/auth/login-simple
POST   /api/auth/change-password
POST   /api/auth/logout
```

### Categoría: Admin Management (27 endpoints)
```
POST   /api/admin/companies
POST   /api/admin/executive-staff
POST   /api/admin/metrics
POST   /api/admin/roles/assign
POST   /api/admin/users
GET    /api/admin/users/[id]
POST   /api/admin/users/bulk-import
POST   /api/admin/users/bulk-import-from-executives
POST   /api/admin/users/create-from-team
GET    /api/admin/users/get-company-id
[+ 17 endpoints de mantenimiento/sync/seeding]
```

### Categoría: Conductores/Applicants (3 endpoints)
```
GET    /api/conductor/documents
POST   /api/conductor/upload-document
POST   /api/conductor/send-notification
GET    /api/conductor/whatsapp-preferences
POST   /api/applicants
```

### Categoría: Documentos (28 endpoints)
```
GET    /api/documents
POST   /api/documents
GET    /api/documents/[id]
POST   /api/documents/upload
POST   /api/documents/validate
POST   /api/documents/save
POST   /api/company/documents/drivers/upload
POST   /api/company/documents/drivers/validate
GET    /api/company/documents/drivers
GET    /api/company/documents/drivers/[driverId]
GET    /api/company/documents/driver-lookup
[+ más endpoints de documentos]
```

### Categoría: IA & Análisis (6 endpoints)
```
POST   /api/analyze-document
POST   /api/analyze-url
POST   /api/detect-document-type
POST   /api/v2/documents/analyze
POST   /api/v2/documents/validate-multi-layer
POST   /api/reports/analyze
```

### Categoría: Alertas (2 endpoints)
```
GET    /api/alerts
GET|DELETE /api/alerts/[id]
POST   /api/company/alerts/check-expiring-documents
```

### Categoría: Certificados (3 endpoints)
```
GET    /api/certificates
POST   /api/certificates/process
POST   /api/certificates/bulk-process
```

### Categoría: Empresa (11 endpoints)
```
GET    /api/company/data
GET    /api/company/profile
GET|POST /api/company/users
GET|DELETE /api/company/users/[id]
GET    /api/company/documents
GET    /api/company/executives
GET    /api/company/notifications
POST   /api/company/notifications
GET|DELETE /api/company/notifications/[id]
POST   /api/company/notifications/[id]/read
```

### Categoría: Reportes (4 endpoints)
```
GET    /api/reports
POST   /api/reports/generate
GET    /api/reports/data
POST   /api/company/metrics
GET    /api/company/monthly-documents
```

### Categoría: Compliance v2 (3 endpoints)
```
GET    /api/v2/compliance/status
POST   /api/v2/compliance/report
POST   /api/v2/review-queue
GET    /api/v2/review-queue/[id]
```

### Categoría: Organizaciones (4 endpoints)
```
GET    /api/organizations
POST   /api/organizations
GET    /api/organizations/[id]
PUT    /api/organizations/[id]
```

### Categoría: Drivers (3 endpoints)
```
GET    /api/drivers
POST   /api/drivers
GET|PUT /api/drivers/[id]
```

### Categoría: Vehículos (3 endpoints)
```
GET    /api/vehicles
POST   /api/vehicles
GET|PUT /api/vehicles/[id]
```

### Categoría: Setup & Config (10 endpoints)
```
POST   /api/setup/database
POST   /api/setup/run-migrations
GET    /api/setup/check-table
GET    /api/setup/check-storage
POST   /api/setup/companies
POST   /api/setup-demo
POST   /api/seed/transportes-labbe
POST   /api/health/db
POST   /api/health/supabase
```

### Categoría: Utilidades (15+ endpoints)
```
GET    /api/document-types
POST   /api/notifications/send
POST   /api/contact-chat
GET    /api/login-email
POST   /api/login
POST   /api/logout
[+ endpoints de debug]
```

---

## 📊 TABLAS DE BASE DE DATOS

### Core Tables:
- `conductores` - Datos de conductores
- `organizations` - Empresas/Transportistas
- `users` - Usuarios del sistema
- `conductores_company_assignment` - Relación conductor-empresa
- `company_executives` - Ejecutivos de empresa

### Documentos:
- `uploaded_documents` - Documentos subidos
- `document_validations` - Resultados de análisis IA
- `document_types` - Tipos de documentos posibles
- `documents` - Tabla general de documentos

### Otros:
- `alerts` - Alertas del sistema
- `notifications` - Notificaciones enviadas
- `certificates` - Certificados generados
- `conductor_auth` - Datos de autenticación de conductores
- `applicants` - Postulantes en proceso

---

## 🎨 COMPONENTES PRINCIPALES

### Admin Components (38):
- `create-applicant-form.tsx` - Formulario consolidado para nuevo postulante + empresa
- Dashboards de administración
- Tablas de gestión
- Modales de confirmación

### Conductor Components:
- Onboarding guide
- Document upload
- Profile manager
- Status indicators

### Shared Components:
- Tabla data table con paginación
- Alertas visuales
- Cards de estado
- Formularios reutilizables

---

## 🔐 SEGURIDAD

- Autenticación con cookies httpOnly
- Autorización por roles y permisos
- Row Level Security (RLS) en Supabase
- Validación de entrada en servidor
- CORS configurado
- Endpoints de admin protegidos

---

## 📈 CARACTERÍSTICAS ESPECIALES

### 1. Validación Multi-Capa de Documentos
- OCR + extracción de texto
- Análisis de autenticidad con IA
- Verificación de campos obligatorios
- Confidence scoring

### 2. Sincronización de Datos
- Sync de conductores desde fuentes externas
- Sincronización bidireccional
- Manejo de conflictos
- Audit trail de cambios

### 3. Analytics y Reportes
- Dashboard de cumplimiento en tiempo real
- Métricas por empresa/conductor
- Exportación de datos
- Tendencias históricas

### 4. Sistema de Alertas
- Documentos próximos a vencer (30 días)
- Documentos vencidos
- Documentos pendientes de validación
- Alertas personalizables

---

## 🚀 DEPLOYMENT & INFRAESTRUCTURA

- Hosted en Vercel (Next.js)
- Database: Supabase (PostgreSQL)
- Storage: Supabase Storage para documentos
- Analytics: Vercel Analytics
- Real-time: Supabase Realtime (preparado)

---

## 📝 RECIENTEMENTE IMPLEMENTADO

✅ **Conductor Portal**
- Dark theme con colores orange brand (#ff6b35)
- Formulario consolidado para nuevo postulante + empresa
- Creación de empresas desde panel administrativo
- Corrección de errores de contraste (WCAG AA compliant)
- Documentación de documentos sin errores

✅ **Bug Fixes**
- Errores de API de documentos
- Type checking en TypeScript
- Relaciones rotas en base de datos

---

## 📋 PRÓXIMAS MEJORAS (Sugeridas)

- [ ] Notificaciones por WhatsApp en tiempo real
- [ ] Dashboard analytics mejorado con gráficos
- [ ] Integración con sistemas de terceros
- [ ] Mobile app para conductores
- [ ] Procesamiento masivo optimizado
- [ ] Machine Learning para detección de fraude

---

**Estado del Proyecto:** Producción con mejoras activas  
**Última actualización:** 2026-05-02  
**Versión:** 0.1.5
