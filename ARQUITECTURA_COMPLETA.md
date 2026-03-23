# 🏗️ Arquitectura Completa - DocuFleet Phase 1

## Stack Tecnológico

```
Frontend (Next.js 15 + React)
├── Components UI (shadcn/ui)
├── Context API (Roles)
├── React Hooks (SWR para data)
└── Tailwind CSS (styling)

Backend (Next.js API Routes)
├── /api/admin/roles/assign (POST)
├── /api/user/roles (GET)
└── /api/v2/documents/analyze (POST - existente)

Database (Supabase PostgreSQL)
├── user_roles (nueva)
├── users (existente)
├── transportistas (existente)
├── conductores (existente)
├── vehiculos (existente)
└── uploaded_documents (existente)

Services (TypeScript)
├── risk-matrix-calculator.ts
├── smart-alerts-generator.ts
├── cross-verification.ts
├── contractor-pre-qualification.ts
├── rbac-access-control.ts
├── user-roles-service.ts
├── role-middleware.ts
└── chilean-documents-reference.ts
```

## Flujo de Datos

### 1. Matriz de Riesgos
```
BD (conductores) → risk-matrix-calculator.ts → Component
                                              ↓
                                    Verde/Amarillo/Rojo
                                    + Descripción problema
```

### 2. Alertas Inteligentes
```
BD (vencimientos) → smart-alerts-generator.ts → Component
                                               ↓
                                    Crítica (0-7 días)
                                    Advertencia (15 días)
                                    Info (30 días)
```

### 3. Verificación Cruzada
```
OCR Data + BD Data → cross-verification.ts → Component
                                            ↓
                                    Flag si discrepancia
                                    + Recomendación
```

### 4. Pre-calificación
```
Conductor/Transportista → contractor-pre-qualification.ts → Component
                         (9 requisitos)                    ↓
                                                    Score + Estado
                                                    + Checklist
```

### 5. Control de Acceso
```
Login → role-middleware.ts → BD (user_roles)
                             ↓
                        RoleProvider (Context)
                             ↓
                    useRole() en componentes
                             ↓
                        RoleGuard (protección)
```

## Componentes Inteligentes

### admin/page.tsx (Dashboard)
```
┌─────────────────────────────────────┐
│         ADMIN DASHBOARD             │
├─────────────────────────────────────┤
│ ┌─ Stats ────────────────────────┐  │
│ │ 12 Mandantes | 45 Transportistas│  │
│ │ 120 Vehículos | 200 Conductores │  │
│ └────────────────────────────────┘  │
├─────────────────────────────────────┤
│ ┌─ Matriz de Riesgos ────────────┐  │
│ │ 🔴 Crítica: 3 conductores      │  │
│ │ 🟡 Moderado: 12 transportistas │  │
│ │ 🟢 Operativo: 185 activos      │  │
│ └────────────────────────────────┘  │
├─────────────────────────────────────┤
│ ┌─ Alertas Inteligentes ─────────┐  │
│ │ 7 días: Licencia Juan García   │  │
│ │ 15 días: RTV Transportes X     │  │
│ │ 30 días: Seguro RC múltiples   │  │
│ └────────────────────────────────┘  │
├─────────────────────────────────────┤
│ ┌─ Verificación Cruzada ─────────┐  │
│ │ ⚠️ 3 discrepancias encontradas  │  │
│ │ RUT inconsistente: 2 casos     │  │
│ │ Nombre duplicado: 1 caso       │  │
│ └────────────────────────────────┘  │
├─────────────────────────────────────┤
│ ┌─ Pre-calificación ─────────────┐  │
│ │ 🟢 Verde: 180 (habilitados)    │  │
│ │ 🟡 Revisar: 35 (pendiente)     │  │
│ │ 🔴 Rojo: 12 (no habilitados)   │  │
│ └────────────────────────────────┘  │
└─────────────────────────────────────┘
```

### /admin/roles (Gestión de Roles)
```
┌─────────────────────────────────────┐
│     GESTIÓN DE ROLES Y PERMISOS     │
├─────────────────────────────────────┤
│ ┌─ Admin ────────────────────────┐  │
│ │ Permiso: read, write, delete  │  │
│ │ Recursos: Todo                │  │
│ └────────────────────────────────┘  │
├─────────────────────────────────────┤
│ ┌─ Mandante ─────────────────────┐  │
│ │ Permiso: read (limitado)       │  │
│ │ Recursos: Sus transportistas   │  │
│ └────────────────────────────────┘  │
├─────────────────────────────────────┤
│ ┌─ Transportista ────────────────┐  │
│ │ Permiso: read (solo suyo)      │  │
│ │ Recursos: Su flota             │  │
│ └────────────────────────────────┘  │
├─────────────────────────────────────┤
│ ┌─ Conductor ────────────────────┐  │
│ │ Permiso: read (docs personales)│  │
│ │ Recursos: Sus documentos       │  │
│ └────────────────────────────────┘  │
└─────────────────────────────────────┘
```

### /walmart-ocr (OCR + Guide)
```
┌─────────────────────────────────────┐
│      PORTAL OCR WALMART CHILE       │
├─────────────────────────────────────┤
│ Tabs: [Cargar] [Guía] [Resultados] │
├─────────────────────────────────────┤
│ TAB: Guía de Documentos             │
│ ┌─────────────────────────────────┐ │
│ │ Conductor (12 docs)             │ │
│ │ ├─ Licencia A4/A5/A2            │ │
│ │ ├─ RTV, Permiso Circulación    │ │
│ │ ├─ Capacitación Ley 20.123     │ │
│ │ └─ ... (más)                    │ │
│ │                                  │ │
│ │ Vehículo (10 docs)              │ │
│ │ ├─ Tarjeta de Circulación      │ │
│ │ ├─ Registro de Propiedad       │ │
│ │ └─ ... (más)                    │ │
│ │                                  │ │
│ │ Empresa (10 docs)               │ │
│ │ ├─ Constitución                │ │
│ │ ├─ MTT Registration            │ │
│ │ └─ ... (más)                    │ │
│ └─────────────────────────────────┘ │
└─────────────────────────────────────┘
```

## Flujo de Autenticación + Roles

```
1. Usuario Login (Supabase Auth)
   ↓
2. Session creada en Supabase
   ↓
3. RoleProvider en layout.tsx
   └─→ Fetch /api/user/roles
       ↓
4. Roles guardados en Context (React)
   ↓
5. useRole() disponible en componentes
   ↓
6. RoleGuard protege secciones
   └─→ Si permiso denied → Mostrar 403
       └─→ Si permiso allowed → Mostrar contenido
```

## Matriz de Permisos Completa

```
┌────────────┬──────────┬──────────┬──────────────┬──────────┐
│ Recurso    │ Admin    │ Mandante │ Transporta   │ Conductor│
├────────────┼──────────┼──────────┼──────────────┼──────────┤
│ Dashboard  │ R/W/D    │ R        │ R (suyo)     │ -        │
│ Mandantes  │ R/W/D    │ -        │ -            │ -        │
│ Transport. │ R/W/D    │ R        │ R/W (suyo)   │ -        │
│ Vehículos  │ R/W/D    │ R        │ R/W (suyo)   │ -        │
│ Conductore │ R/W/D    │ R        │ R/W (suyo)   │ R (suyo) │
│ Documentos │ R/W/D    │ R        │ R/W (suyo)   │ R (suyo) │
│ Roles      │ R/W/D    │ -        │ -            │ -        │
│ Reportes   │ R/W      │ R        │ R (suyo)     │ -        │
└────────────┴──────────┴──────────┴──────────────┴──────────┘

Leyenda: R = Read | W = Write | D = Delete | - = Sin acceso
```

## Validación de Documentos - Pipeline

```
User Upload
    ↓
FileInput (JPG/PNG/PDF, <10MB)
    ↓
OCR Processing (Google Vision)
    ↓
Extract Data
    ├─ RUT
    ├─ Nombres
    ├─ Vigencia
    ├─ Número documento
    └─ ... campos específicos
    ↓
Cross Verification
    ├─ RUT BD vs OCR
    ├─ Similitud de strings
    ├─ Validación de checksum
    └─ Detección de anomalías
    ↓
Confidence Score (0-100%)
    ├─ >90%: Verde ✅
    ├─ 70-90%: Revisar ⚠️
    └─ <70%: Rechazar ❌
    ↓
Save to DB
    ├─ Si verde: Automático
    ├─ Si revisar: Espera admin
    └─ Si rechazar: Feedback al usuario
```

## Catálogo de 35 Documentos

```
CONDUCTOR (12)
├─ 1. Licencia A4
├─ 2. Licencia A5
├─ 3. Licencia A2
├─ 4. Permiso Circulación
├─ 5. RTV
├─ 6. Seguro RC
├─ 7. Capacitación Ley 20.123
├─ 8. Antecedentes Tránsito
├─ 9. Primeros Auxilios
├─ 10. Toxicológico
├─ 11. Competencia Profesional
└─ 12. Curso Defensa Vehicular

VEHÍCULO (10)
├─ 1. Tarjeta Circulación
├─ 2. Registro Propiedad
├─ 3. Homologación
├─ 4. Certificado Aduanal
├─ 5. Emisión Gases
├─ 6. Bitácora Mantenimiento
├─ 7. Seguro Carga
├─ 8. Autorización Pasos Fronterizos
├─ 9. Revisión Seguridad
└─ 10. Pagos Patente

EMPRESA (10)
├─ 1. RUT Certificado
├─ 2. Constitución Sociedad
├─ 3. Contrato Arrendamiento
├─ 4. Inscripción MTT
├─ 5. Antecedentes Penales
├─ 6. Vigencia Poderes
├─ 7. Seguro Responsabilidad
├─ 8. Declaración Patrimonio
├─ 9. Declaración Jurada Ley 20.123
└─ 10. Afiliación Previsión

ESPECIALES (3)
├─ 1. ADR (Carga Peligrosa)
├─ 2. Autorización Carga Peligrosa
└─ 3. Credencial Conductor Profesional
```

---

**Total: 35 Documentos + Sistema RBAC + 5 Features + OCR Integration**
